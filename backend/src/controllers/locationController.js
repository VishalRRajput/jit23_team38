import { Location } from '../models/Location.js';
import { Employee } from '../models/Employee.js';
import { Room } from '../models/Room.js';
import { processGeofenceEvaluation } from '../services/geofenceService.js';
import { emitEvent } from '../config/socket.js';

export const postLocationData = async (req, res) => {
  try {
    const {
      deviceId,
      latitude,
      longitude,
      speed = 0,
      satellites = 0,
      battery = 100,
      batteryVoltage = 4.2,
      sosAlert = false,
      scannedWifi = []
    } = req.body;

    if (!deviceId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location payload: deviceId, latitude, and longitude are required'
      });
    }

    console.log(`[LocationController] Received payload from ${deviceId}. Scanned WiFi:`, JSON.stringify(scannedWifi));

    // Find employee linked to this ESP32 deviceId
    let employee = await Employee.findOne({ deviceId });
    if (!employee) {
      if (deviceId === 'ESP32_EMP_1001') {
        employee = await Employee.create({
          employeeId: 'EMP-1001',
          name: 'Alex Rivera',
          department: 'Engineering',
          designation: 'Senior IoT Architect',
          email: 'alex.rivera@company.com',
          phone: '+1 (555) 234-5678',
          deviceId: 'ESP32_EMP_1001',
          status: 'Active',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
        });
      } else {
        // Auto-register demo hardware assignment if not mapped
        employee = await Employee.create({
          employeeId: `EMP-${deviceId.replace(/[^0-9]/g, '') || '1001'}`,
          name: `ESP32 Operator (${deviceId})`,
          department: 'Field Engineering',
          designation: 'Hardware Specialist',
          email: `${deviceId.toLowerCase()}@company.com`,
          phone: '+1 (555) 992-1004',
          deviceId,
          status: 'Active'
        });
      }
    }

    // Evaluate geofence & hybrid WiFi verification
    const geofenceResult = await processGeofenceEvaluation(employee, {
      latitude: Number(latitude),
      longitude: Number(longitude),
      scannedWifi,
      sosAlert
    });

    // Indoor Room Detection Logic
    let isIndoor = false;
    let roomId = null;
    let floorId = null;
    let buildingId = null;

    if (scannedWifi && scannedWifi.length > 0) {
      const allRooms = await Room.find().populate('floorId');
      
      // Basic matching: find a room where scanned wifi matches
      let bestRoom = null;
      let highestPriority = -1;
      let bestRoomRssi = -999;

      for (const room of allRooms) {
        if (room.wifiFingerprints && room.wifiFingerprints.length > 0) {
          for (const fp of room.wifiFingerprints) {
            const matchedWifi = scannedWifi.find(w => w.bssid.toLowerCase() === fp.bssid.toLowerCase());
            if (matchedWifi) {
              // Check RSSI range if defined
              const minRssi = fp.rssiRange?.min || -100;
              const maxRssi = fp.rssiRange?.max || 0;
              
              if (matchedWifi.rssi >= minRssi && matchedWifi.rssi <= maxRssi) {
                // If priority is higher, OR if priority is equal but the signal is stronger (closer)
                if (!bestRoom || (fp.priority || 1) > highestPriority || ((fp.priority || 1) === highestPriority && matchedWifi.rssi > bestRoomRssi)) {
                  bestRoom = room;
                  highestPriority = fp.priority || 1;
                  bestRoomRssi = matchedWifi.rssi;
                }
              }
            }
          }
        }
      }

      if (bestRoom) {
        isIndoor = true;
        roomId = bestRoom._id;
        floorId = bestRoom.floorId?._id;
        buildingId = bestRoom.floorId?.buildingId;
      }
    }

    // Determine current status string
    let newStatus = 'Out of Office';
    if (isIndoor && roomId) {
      const roomDoc = await Room.findById(roomId);
      newStatus = `Inside ${roomDoc?.name || 'Room'}`;
    } else if (geofenceResult.isInside) {
      newStatus = `Inside ${geofenceResult.matchedGeofence?.officeName || 'Campus'}`;
    }

    // Update Employee record with latest status and lastSeen
    employee.currentStatus = newStatus;
    employee.lastSeen = new Date();
    await employee.save();

    // Save Location Log Point
    const locationRecord = await Location.create({
      employeeId: employee.employeeId,
      deviceId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      speed: Number(speed),
      satellites: Number(satellites),
      battery: Number(battery),
      batteryVoltage: Number(batteryVoltage),
      sosAlert: Boolean(sosAlert),
      isInsideGeofence: geofenceResult.isInside,
      geofenceId: geofenceResult.matchedGeofence?._id || null,
      isIndoor,
      roomId,
      floorId,
      buildingId,
      scannedWifi,
      verificationMethod: isIndoor ? 'WIFI_BSSID' : geofenceResult.verificationMethod,
      timestamp: new Date()
    });

    // Broadcast live telemetry update over Socket.IO
    emitEvent('location:update', {
      employeeId: employee.employeeId,
      employeeName: employee.name,
      department: employee.department,
      deviceId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      speed: Number(speed),
      battery: Number(battery),
      currentStatus: employee.currentStatus,
      isInsideGeofence: geofenceResult.isInside,
      geofenceName: geofenceResult.matchedGeofence?.officeName || 'Out of Office',
      isIndoor,
      roomId,
      floorId,
      buildingId,
      verificationMethod: isIndoor ? 'WIFI_BSSID' : geofenceResult.verificationMethod,
      timestamp: locationRecord.timestamp
    });

    res.status(201).json({
      success: true,
      message: 'Location data received and processed',
      isInsideGeofence: geofenceResult.isInside,
      verificationMethod: geofenceResult.verificationMethod,
      eventTriggered: geofenceResult.eventTriggered,
      locationRecord
    });
  } catch (error) {
    console.error('[Location Controller Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLatestEmployeeLocation = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const location = await Location.findOne({ employeeId }).sort({ timestamp: -1 });

    if (!location) {
      return res.status(404).json({ success: false, message: 'No location telemetry found for this employee' });
    }

    res.json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeLocationHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 100 } = req.query;

    const history = await Location.find({ employeeId })
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: history.length, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllActiveLocations = async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'Active' });
    const locations = await Promise.all(
      employees.map(async (emp) => {
        const loc = await Location.findOne({ employeeId: emp.employeeId }).sort({ timestamp: -1 });
        return {
          employee: emp,
          latestLocation: loc
        };
      })
    );

    res.json({ success: true, count: locations.length, locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
