import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, FileText, CheckCircle2, Clock } from 'lucide-react';
import api from '../services/api';
import { exportToCsv, exportToExcel, exportToPdf, exportToJson, downloadBlob } from '../utils/exportUtils';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      if (res.data.success) setReports(res.data.reports);
    } catch (err) {
      console.error('[Reports Fetch Error]:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const downloadReportFile = async (reportType, fileFormat) => {
    const typeKey = (reportType || '').toLowerCase().replace('_history', '').replace('_logs', '');
    const ext = (fileFormat || 'pdf').toLowerCase() === 'excel' ? 'xls' : (fileFormat || 'pdf').toLowerCase();

    try {
      // 1. Fetch from backend with configured baseURL and JWT auth
      const res = await api.get(`/reports/download/${typeKey}.${ext}`, { responseType: 'blob' });
      const filename = `${typeKey}_report_${Date.now()}.${ext === 'excel' ? 'xls' : ext}`;
      downloadBlob(new Blob([res.data]), filename);
      return;
    } catch (err) {
      console.warn('[Backend download failed, falling back to client-side export]:', err);
    }

    // 2. Client-side fallback to guarantee the download succeeds
    try {
      if (typeKey === 'attendance') {
        const todayStr = new Date().toISOString().split('T')[0];
        const res = await api.get(`/attendance/daily?date=${todayStr}`);
        const list = res.data?.attendanceList || [];
        const headers = ['Employee ID', 'Name', 'Department', 'Date', 'Check-In', 'Check-Out', 'Working Hours', 'Status'];
        const rows = list.map(item => [
          item.employeeId,
          item.name,
          item.department,
          todayStr,
          item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
          item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
          item.workingHours ? `${item.workingHours} hrs` : '--',
          item.status
        ]);
        if (ext === 'csv') exportToCsv(`attendance_report_${Date.now()}.csv`, headers, rows);
        else if (ext === 'xls' || ext === 'excel') exportToExcel(`attendance_report_${Date.now()}.xls`, 'Corporate Attendance Report', headers, rows);
        else if (ext === 'json') exportToJson(`attendance_report_${Date.now()}.json`, list);
        else exportToPdf(`attendance_report_${Date.now()}.pdf`, 'Corporate Attendance Report', `Generated: ${new Date().toLocaleString()}`, headers, rows);
      } else if (typeKey === 'geofence') {
        const res = await api.get('/geofences');
        const list = res.data?.geofences || [];
        const headers = ['Geofence Name', 'Radius (m)', 'Coordinates', 'Status', 'Created Date'];
        const rows = list.map(g => [g.name, `${g.radius} m`, `${g.latitude}, ${g.longitude}`, g.active ? 'Active' : 'Inactive', new Date(g.createdAt || Date.now()).toLocaleDateString()]);
        if (ext === 'csv') exportToCsv(`geofence_report_${Date.now()}.csv`, headers, rows);
        else if (ext === 'xls' || ext === 'excel') exportToExcel(`geofence_report_${Date.now()}.xls`, 'Geofence Event Audit Report', headers, rows);
        else if (ext === 'json') exportToJson(`geofence_report_${Date.now()}.json`, list);
        else exportToPdf(`geofence_report_${Date.now()}.pdf`, 'Geofence Event Audit Report', `Generated: ${new Date().toLocaleString()}`, headers, rows);
      } else {
        const res = await api.get('/location/active/all');
        const list = res.data?.locations || [];
        const headers = ['Employee ID', 'Name', 'Latitude', 'Longitude', 'Battery (%)', 'Status'];
        const rows = list.map(l => [
          l.employee?.employeeId || '--',
          l.employee?.name || '--',
          l.latestLocation?.latitude?.toFixed(6) || '--',
          l.latestLocation?.longitude?.toFixed(6) || '--',
          `${l.latestLocation?.battery || 100}%`,
          l.employee?.currentStatus || 'Online'
        ]);
        if (ext === 'csv') exportToCsv(`movement_report_${Date.now()}.csv`, headers, rows);
        else if (ext === 'xls' || ext === 'excel') exportToExcel(`movement_report_${Date.now()}.xls`, 'Movement & Telemetry History Report', headers, rows);
        else if (ext === 'json') exportToJson(`movement_report_${Date.now()}.json`, list);
        else exportToPdf(`movement_report_${Date.now()}.pdf`, 'Movement & Telemetry History Report', `Generated: ${new Date().toLocaleString()}`, headers, rows);
      }
    } catch (fallbackErr) {
      alert('Could not export report. Please check server connection.');
    }
  };

  const handleGenerateReport = async (reportType, fileFormat) => {
    setGenerating(true);
    try {
      await api.post('/reports/generate', {
        title: `Corporate ${reportType} Report`,
        reportType,
        fileFormat
      });
      fetchReports();
      // Immediately download the generated file
      await downloadReportFile(reportType, fileFormat);
    } catch (err) {
      // Still trigger download via fallback if API had an issue
      await downloadReportFile(reportType, fileFormat);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Report Generation & Enterprise Exports</h1>
          <p className="text-xs text-gray-400">Download attendance summaries, movement logs, and geofence events in PDF, Excel, JSON, or CSV</p>
        </div>
      </div>

      {/* Quick Action Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 space-y-3">
          <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 w-fit">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Daily Attendance Report</h3>
          <p className="text-xs text-gray-400">Export complete employee check-in times, working hours, and late arrival logs.</p>
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <button
              onClick={() => handleGenerateReport('ATTENDANCE', 'PDF')}
              disabled={generating}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={() => downloadReportFile('ATTENDANCE', 'EXCEL')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel
            </button>
            <button
              onClick={() => downloadReportFile('ATTENDANCE', 'CSV')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              CSV
            </button>
            <button
              onClick={() => downloadReportFile('ATTENDANCE', 'JSON')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              JSON
            </button>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
          <div className="p-3 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 w-fit">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Movement & Telemetry History</h3>
          <p className="text-xs text-gray-400">Detailed raw GPS coordinates, speeds, battery stats, and route telemetry.</p>
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <button
              onClick={() => handleGenerateReport('MOVEMENT_HISTORY', 'PDF')}
              disabled={generating}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={() => downloadReportFile('MOVEMENT_HISTORY', 'EXCEL')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel
            </button>
            <button
              onClick={() => downloadReportFile('MOVEMENT_HISTORY', 'CSV')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              CSV
            </button>
            <button
              onClick={() => downloadReportFile('MOVEMENT_HISTORY', 'JSON')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              JSON
            </button>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 space-y-3">
          <div className="p-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 w-fit">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Geofence ENTRY / EXIT Audit</h3>
          <p className="text-xs text-gray-400">Comprehensive event log of entry/exit times and dual WiFi verification methods.</p>
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <button
              onClick={() => handleGenerateReport('GEOFENCE_LOGS', 'PDF')}
              disabled={generating}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={() => downloadReportFile('GEOFENCE_LOGS', 'EXCEL')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel
            </button>
            <button
              onClick={() => downloadReportFile('GEOFENCE_LOGS', 'CSV')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              CSV
            </button>
            <button
              onClick={() => downloadReportFile('GEOFENCE_LOGS', 'JSON')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Generated Reports History */}
      <div className="glass-panel rounded-2xl p-5 border border-gray-800">
        <h3 className="text-sm font-bold text-white mb-3">Recently Generated Report Archives</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-lg">Report Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Format</th>
                <th className="p-3">Records</th>
                <th className="p-3">Generated Date</th>
                <th className="p-3 rounded-r-lg">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono text-[11px]">
              {reports.map((rep) => (
                <tr key={rep._id} className="hover:bg-gray-900/40">
                  <td className="p-3 font-sans font-semibold text-white">{rep.title}</td>
                  <td className="p-3 text-indigo-400">{rep.reportType}</td>
                  <td className="p-3 text-cyan-300">{rep.fileFormat}</td>
                  <td className="p-3 text-gray-300">{rep.recordCount}</td>
                  <td className="p-3 text-gray-400">{new Date(rep.createdAt).toLocaleString()}</td>
                  <td className="p-3 font-sans">
                    <button
                      onClick={() => downloadReportFile(rep.reportType, rep.fileFormat)}
                      className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-indigo-300 hover:text-white font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
