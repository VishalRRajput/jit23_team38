import { Location } from '../models/Location.js';
import { Employee } from '../models/Employee.js';
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

    // Find employee linked to this ESP32 deviceId
    let employee = await Employee.findOne({ deviceId });
    if (!employee) {
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

    // Evaluate geofence & hybrid WiFi verification
    const geofenceResult = await processGeofenceEvaluation(employee, {
      latitude: Number(latitude),
      longitude: Number(longitude),
      scannedWifi,
      sosAlert
    });

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
      scannedWifi,
      verificationMethod: geofenceResult.verificationMethod,
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
      verificationMethod: geofenceResult.verificationMethod,
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
