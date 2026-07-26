import { Report } from '../models/Report.js';
import { Attendance } from '../models/Attendance.js';
import { GeofenceLog } from '../models/GeofenceLog.js';
import { Location } from '../models/Location.js';
import { Employee } from '../models/Employee.js';

export const getReportsList = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateReport = async (req, res) => {
  try {
    const { title, reportType, fileFormat = 'PDF' } = req.body;

    let recordCount = 0;
    if (reportType === 'ATTENDANCE') {
      recordCount = await Attendance.countDocuments();
    } else if (reportType === 'GEOFENCE_LOGS') {
      recordCount = await GeofenceLog.countDocuments();
    } else {
      recordCount = await Location.countDocuments();
    }

    const report = await Report.create({
      title: title || `${reportType} Enterprise Report`,
      reportType,
      fileFormat,
      generatedBy: req.user?.name || 'System Admin',
      recordCount,
      downloadUrl: `/api/reports/download/${reportType.toLowerCase()}.${fileFormat.toLowerCase()}`
    });

    res.status(201).json({ success: true, message: 'Report generated successfully', report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportReportData = async (req, res) => {
  try {
    const { type, format } = req.params;

    if (type === 'attendance') {
      const records = await Attendance.find().limit(50);
      if (format === 'csv' || format === 'excel') {
        let csv = 'Employee ID,Date,Check-In Time,Check-Out Time,Working Hours,Status\n';
        records.forEach(r => {
          csv += `"${r.employeeId}","${r.date}","${r.checkInTime || ''}","${r.checkOutTime || ''}","${r.workingHours}","${r.status}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${Date.now()}.csv`);
        return res.send(csv);
      }
    }

    // Default JSON fallback download stream
    const logs = await GeofenceLog.find().limit(100);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_report_${Date.now()}.${format}`);
    res.json(logs);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
