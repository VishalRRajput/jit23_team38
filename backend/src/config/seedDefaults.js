import { Admin } from '../models/Admin.js';
import { Employee } from '../models/Employee.js';
import { Geofence } from '../models/Geofence.js';
import { Attendance } from '../models/Attendance.js';
import { Location } from '../models/Location.js';

export const ensureInitialData = async () => {
  try {
    // 1. Ensure Default Admin Account
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('[AutoSeed] No admin account found. Creating default admin...');
      await Admin.create({
        name: 'Corporate Chief Admin',
        email: 'admin@company.com',
        password: 'adminpassword123',
        role: 'superadmin',
        department: 'Executive Operations',
        phone: '+1 (555) 019-2834',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      });
      console.log('[AutoSeed] Default admin created (admin@company.com / adminpassword123).');
    }

    // 2. Ensure Default Geofence
    let defaultGeofence = await Geofence.findOne({ officeName: 'Corporate Tech HQ' });
    if (!defaultGeofence) {
      const geofenceCount = await Geofence.countDocuments();
      if (geofenceCount === 0) {
        console.log('[AutoSeed] No geofence found. Creating Corporate Tech HQ geofence...');
        defaultGeofence = await Geofence.create({
          officeName: 'Corporate Tech HQ',
          latitude: 37.774929,
          longitude: -122.419416,
          radiusMeters: 200,
          officeWifiBSSIDs: [
            { ssid: 'Office_WiFi_Network', bssid: 'AA:BB:CC:DD:EE:01', minRssi: -85 },
            { ssid: 'Corp_Guest_5G', bssid: 'AA:BB:CC:DD:EE:02', minRssi: -85 }
          ],
          description: 'Main Silicon Valley Headquarters Geofence Perimeter',
          status: 'Active'
        });
        console.log('[AutoSeed] Default geofence created.');
      } else {
        defaultGeofence = await Geofence.findOne();
      }
    }

    // 3. Ensure Default Employees (including ESP32_EMP_1001)
    const employeeCount = await Employee.countDocuments();
    if (employeeCount === 0) {
      console.log('[AutoSeed] No employees found in database. Seeding production employee records...');
      const defaultEmployees = [
        {
          employeeId: 'EMP-1001',
          name: 'Alex Rivera',
          department: 'Engineering',
          designation: 'Senior IoT Architect',
          email: 'alex.rivera@company.com',
          phone: '+1 (555) 234-5678',
          deviceId: 'ESP32_EMP_1001',
          status: 'Active',
          currentStatus: 'Inside Office',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
        },
        {
          employeeId: 'EMP-1002',
          name: 'Sarah Chen',
          department: 'Operations',
          designation: 'Logistics Manager',
          email: 'sarah.chen@company.com',
          phone: '+1 (555) 345-6789',
          deviceId: 'ESP32_EMP_1002',
          status: 'Active',
          currentStatus: 'Outside Geofence',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
        },
        {
          employeeId: 'EMP-1003',
          name: 'Michael Vance',
          department: 'Hardware R&D',
          designation: 'Embedded Systems Lead',
          email: 'michael.vance@company.com',
          phone: '+1 (555) 456-7890',
          deviceId: 'ESP32_EMP_1003',
          status: 'Active',
          currentStatus: 'Inside Office',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
        },
        {
          employeeId: 'EMP-1004',
          name: 'Elena Rostova',
          department: 'Quality Assurance',
          designation: 'Field Test Specialist',
          email: 'elena.rostova@company.com',
          phone: '+1 (555) 567-8901',
          deviceId: 'ESP32_EMP_1004',
          status: 'Active',
          currentStatus: 'Outside Geofence',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        }
      ];

      for (const empData of defaultEmployees) {
        await Employee.create(empData);
      }
      console.log(`[AutoSeed] Successfully seeded 4 employees.`);
    } else {
      // Check if ESP32_EMP_1001 specifically exists
      const emp1001 = await Employee.findOne({ deviceId: 'ESP32_EMP_1001' });
      if (!emp1001) {
        console.log('[AutoSeed] Device ESP32_EMP_1001 not mapped. Registering Alex Rivera...');
        await Employee.create({
          employeeId: 'EMP-1001',
          name: 'Alex Rivera',
          department: 'Engineering',
          designation: 'Senior IoT Architect',
          email: 'alex.rivera@company.com',
          phone: '+1 (555) 234-5678',
          deviceId: 'ESP32_EMP_1001',
          status: 'Active',
          currentStatus: 'Inside Office',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
        });
        console.log('[AutoSeed] Alex Rivera (ESP32_EMP_1001) registered.');
      }
    }

    // 4. Ensure Baseline Location Telemetry for Active Employees
    const allEmployees = await Employee.find({ status: 'Active' });
    const todayStr = new Date().toISOString().split('T')[0];

    for (const emp of allEmployees) {
      const locCount = await Location.countDocuments({ employeeId: emp.employeeId });
      if (locCount === 0) {
        const isAlex = emp.deviceId === 'ESP32_EMP_1001';
        const lat = 37.774929 + (Math.random() - 0.5) * 0.0015;
        const lng = -122.419416 + (Math.random() - 0.5) * 0.0015;

        await Location.create({
          employeeId: emp.employeeId,
          deviceId: emp.deviceId,
          latitude: lat,
          longitude: lng,
          speed: isAlex ? 0.8 : 0,
          satellites: 9,
          battery: 98,
          batteryVoltage: 4.15,
          isInsideGeofence: true,
          geofenceId: defaultGeofence?._id || null,
          scannedWifi: [
            { ssid: 'Office_WiFi_Network', bssid: 'AA:BB:CC:DD:EE:01', rssi: -58 },
            { ssid: 'Corp_Guest_5G', bssid: 'AA:BB:CC:DD:EE:02', rssi: -65 }
          ],
          verificationMethod: 'GPS',
          timestamp: new Date()
        });

        // Ensure Attendance Record
        const existingAtt = await Attendance.findOne({ employeeId: emp.employeeId, date: todayStr });
        if (!existingAtt) {
          await Attendance.create({
            employeeId: emp.employeeId,
            date: todayStr,
            checkInTime: new Date(Date.now() - 3 * 3600 * 1000),
            status: 'Present',
            workingHours: 3.0,
            autoGenerated: true
          });
        }
      }
    }

    console.log('[AutoSeed] Initial database records check completed.');
  } catch (err) {
    console.error('[AutoSeed Error]:', err.message);
  }
};
