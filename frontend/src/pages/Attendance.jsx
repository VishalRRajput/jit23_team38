import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, CheckCircle2, AlertCircle, XCircle, Filter, Edit2 } from 'lucide-react';
import api from '../services/api';
import AttendanceModal from '../components/AttendanceModal';

export default function Attendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchAttendance = async () => {
    try {
      const [dailyRes, sumRes] = await Promise.all([
        api.get(`/attendance/daily?date=${selectedDate}`),
        api.get('/attendance/summary')
      ]);

      if (dailyRes.data.success) setAttendanceList(dailyRes.data.attendanceList);
      if (sumRes.data.success) setSummary(sumRes.data.summary);
    } catch (err) {
      console.error('[Attendance Fetch Error]:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const openOverrideModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleManualOverride = async (formData) => {
    try {
      await api.post('/attendance/manual', formData);
      setIsModalOpen(false);
      setSelectedRecord(null);
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || 'Error setting manual attendance');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 };
      case 'Late':
        return { color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: AlertCircle };
      default:
        return { color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: XCircle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Automated Attendance Registry</h1>
          <p className="text-xs text-gray-400">Attendance auto-derived from ESP32 Geofence Entry & Exit logs</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-gray-800">
          <span className="text-[10px] text-gray-400 uppercase font-mono">Total Tracked</span>
          <p className="text-2xl font-bold text-white mt-1">{summary?.totalEmployees || 4}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30">
          <span className="text-[10px] text-emerald-400 uppercase font-mono">Present Today</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{summary?.presentCount || 3}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30">
          <span className="text-[10px] text-amber-400 uppercase font-mono">Late Arrivals</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{summary?.lateCount || 1}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/30">
          <span className="text-[10px] text-rose-400 uppercase font-mono">Absent / Out</span>
          <p className="text-2xl font-bold text-rose-400 mt-1">{summary?.absentCount || 1}</p>
        </div>
      </div>

      {/* Daily Attendance Table */}
      <div className="glass-panel rounded-2xl p-5 border border-gray-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-indigo-400" /> Daily Attendance Logs ({selectedDate})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-lg">Employee</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Check-In Time</th>
                <th className="p-3.5">Check-Out Time</th>
                <th className="p-3.5">Working Hours</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono text-[11px]">
              {attendanceList.map((item) => {
                const badge = getStatusBadge(item.status);
                const Icon = badge.icon;
                return (
                  <tr key={item.employeeId} className="hover:bg-gray-900/40">
                    <td className="p-3.5 font-sans flex items-center space-x-3">
                      <img
                        src={item.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                        alt={item.name}
                        className="w-8 h-8 rounded-full border border-gray-700 object-cover"
                      />
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{item.employeeId}</p>
                      </div>
                    </td>
                    <td className="p-3.5 font-sans text-gray-400">{item.department}</td>
                    <td className="p-3.5 text-cyan-300">
                      {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                    </td>
                    <td className="p-3.5 text-indigo-300">
                      {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still Checked In'}
                    </td>
                    <td className="p-3.5 text-gray-200 font-bold">
                      {item.workingHours ? `${item.workingHours} hrs` : '--'}
                    </td>
                    <td className="p-3.5 font-sans">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${badge.color}`}>
                        <Icon className="w-3 h-3" /> {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-sans">
                      <button
                        onClick={() => openOverrideModal(item)}
                        className="p-1.5 rounded bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800"
                        title="Manual Check-Out Override"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleManualOverride}
        attendance={selectedRecord}
      />
    </div>
  );
}
