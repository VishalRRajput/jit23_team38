import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initSocket, emitEvent } from './config/socket.js';
import { Employee } from './models/Employee.js';
import { Attendance } from './models/Attendance.js';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import geofenceRoutes from './routes/geofenceRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiAnalyticsRoutes from './routes/aiAnalyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
app.use((req, res, next) => {
  console.log("========== REQUEST ==========");
  console.log(req.method, req.url);
  console.log(req.ip);
  next();
});
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API Routes Setup
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai-analytics', aiAnalyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'WiFi & GPS Employee Tracking System API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Heartbeat Monitor (Runs every 30 seconds)
// Marks employees as Offline if they haven't pinged in 2 minutes
setInterval(async () => {
  try {
    const twoMinutesAgo = new Date(Date.now() - 120000);
    const inactiveEmployees = await Employee.find({
      lastSeen: { $lt: twoMinutesAgo },
      currentStatus: { $ne: 'Offline' },
      status: 'Active'
    });

    if (inactiveEmployees.length > 0) {
      for (const emp of inactiveEmployees) {
        const previousStatus = emp.currentStatus;
        emp.currentStatus = 'Offline';
        await emp.save();
        
        // Auto Check-Out if they were inside the office
        if (previousStatus && previousStatus.includes('Inside')) {
          const todayStr = new Date().toISOString().split('T')[0];
          let attendance = await Attendance.findOne({ employeeId: emp.employeeId, date: todayStr });
          if (attendance && attendance.checkInTime) {
            const now = new Date();
            attendance.checkOutTime = now;
            const diffMs = now.getTime() - new Date(attendance.checkInTime).getTime();
            attendance.workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
            await attendance.save();
            console.log(`[Heartbeat] Auto Checked-Out ${emp.employeeId}. Working Hours: ${attendance.workingHours}`);
          }
        }
        
        // Notify frontend that this employee just went offline
        emitEvent('location:update', {
          employeeId: emp.employeeId,
          employeeName: emp.name,
          currentStatus: 'Offline',
          deviceId: emp.deviceId,
          timestamp: new Date()
        });
        
        console.log(`[Heartbeat] Marked ${emp.employeeId} as Offline due to inactivity.`);
      }
    }
  } catch (err) {
    console.error('[Heartbeat Error]:', err);
  }
}, 30000);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
=========================================================
  🚀 EMPLOYEE TRACKING SYSTEM BACKEND SERVER ONLINE
  📡 HTTP Server:  http://localhost:${PORT}
  🔌 Socket.IO:   http://localhost:${PORT}
  📍 REST API:     http://localhost:${PORT}/api/location
=========================================================
  `);
});
