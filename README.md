# WiFi and GPS Enabled Employee Tracking System

An enterprise-ready, production-grade **WiFi and GPS Enabled Employee Tracking System**. Designed for real-time employee surveillance using physical ESP32 IoT microcontrollers, **Dual-Mode Verification** (GPS coordinates + ambient WiFi BSSID scanning), automated Geofence Entry/Exit attendance logging, real-time Socket.IO streaming, AI movement intelligence, and PDF/Excel report exports.

---

## Key Hardware Component List & Circuit Wiring

The physical tracking device is built with the following hardware components:
1. **ESP32 Development Board** (38-pin, CP2102 UART)
2. **NEO-6M GPS Module** (With external ceramic antenna)
3. **18650 Li-Ion Battery** (3.7V, 3000mAh)
4. **TP4056 Battery Charging Board** (5V 1A Micro-USB with protection)
5. **MT3608 Boost Converter** (3.7V $\rightarrow$ Regulated 5.0V Output)
6. **Push Button** (GPIO 15 - Emergency SOS / Alert Button)
7. **Status LED** (GPIO 4 - Network & GPS fix indicator)
8. **Mini Breadboard & Jumper Wires** (20cm Male-Female)
9. **3D Printed / Plastic Enclosure**

> See complete schematic in [docs/HARDWARE_SCHEMATIC.md](file:///c:/Users/Vishu/Desktop/Live_tracking/docs/HARDWARE_SCHEMATIC.md).

---

## Tech Stack Overview

- **Backend**: Node.js, Express.js, Socket.IO, MongoDB (Mongoose ODM), JWT, bcryptjs
- **Frontend**: React.js (Vite), Tailwind CSS (Glassmorphism dark theme), React Router v6, Leaflet (OpenStreetMap dark tiles), Recharts, Lucide Icons, Axios
- **IoT Firmware**: C++ Arduino Sketch (`firmware/ESP32_Dual_Tracker.ino`) for ESP32 + NEO-6M + WiFi Scanner
- **Desktop Simulator**: Automated hardware micro-simulator (`npm run simulate-esp32`)

---

## Project Folder Structure

```
Live_tracking/
├── firmware/
│   └── ESP32_Dual_Tracker.ino   # Complete ESP32 C++ Arduino Firmware
├── backend/
│   ├── src/
│   │   ├── config/              # MongoDB connection & Socket.IO setup
│   │   ├── controllers/         # Auth, Employee, Location, Geofence, Attendance, Analytics, AI, Report, Notification controllers
│   │   ├── middleware/          # JWT auth middleware & error handler
│   │   ├── models/              # Mongoose Schemas (Admin, Employee, Location, Geofence, GeofenceLog, Attendance, Notification, Report)
│   │   ├── routes/              # Express API endpoints
│   │   ├── services/            # Dual-mode Geofence engine, AI analytics engine, Exporters
│   │   ├── utils/               # Haversine distance calculator
│   │   └── server.js            # Server entry point
│   ├── scripts/                 # Seed database & ESP32 Micro-Simulator
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Sidebar, StatCards, MapView, GeofenceModal, EmployeeModal, AIInsightsCard, NotificationDrawer
│   │   ├── context/             # AuthContext, SocketContext
│   │   ├── pages/               # Dashboard, Employees, Tracking, Geofence Management, Attendance, AI Analytics, Reports, Notifications, Settings, Login, ForgotPassword, AdminProfile
│   │   ├── services/            # Axios API client & Socket.IO client
│   │   ├── App.jsx              # Router layout
│   │   └── main.jsx
│   └── package.json
└── docs/                        # Architecture, Hardware Schematics, API Docs, ERD, Deployment, Testing Plan
```

---

## Quick Start Guide

### 1. Install & Run Backend Server
```bash
cd backend
npm install
npm run seed              # Seed database with superadmin and demo employees
npm start                 # Start backend server on http://localhost:5000
```

### 2. Launch ESP32 Hardware Simulator (Optional for Desktop Testing)
```bash
cd backend
npm run simulate-esp32    # Pushes live GPS & WiFi telemetry every 4 seconds
```

### 3. Install & Launch Frontend Dashboard
```bash
cd frontend
npm install
npm run dev               # Starts Vite dev server on http://localhost:5173
```
 
### Default Credentials
- **Admin Email**: `admin@company.com`
- **Admin Password**: `adminpassword123`

---

## Output Deliverables Included
- **C++ Firmware**: `firmware/ESP32_Dual_Tracker.ino`
- **System Architecture**: `docs/ARCHITECTURE.md`
- **Hardware Wiring**: `docs/HARDWARE_SCHEMATIC.md`
- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **Database ERD**: `docs/DATABASE_ERD.md`
- **Deployment Guide**: `docs/DEPLOYMENT_GUIDE.md`
- **Testing Plan**: `docs/TESTING_PLAN.md`
