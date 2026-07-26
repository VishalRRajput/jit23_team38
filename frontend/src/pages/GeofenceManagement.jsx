import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Edit3, Trash2, Wifi, MapPin, History, Radio } from 'lucide-react';
import api from '../services/api';
import GeofenceModal from '../components/GeofenceModal';

export default function GeofenceManagement() {
  const [geofences, setGeofences] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGeofence, setCurrentGeofence] = useState(null);

  const fetchData = async () => {
    try {
      const [geoRes, logRes] = await Promise.all([
        api.get('/geofences'),
        api.get('/geofences/logs?limit=20')
      ]);

      if (geoRes.data.success) setGeofences(geoRes.data.geofences);
      if (logRes.data.success) setLogs(logRes.data.logs);
    } catch (err) {
      console.error('[Geofence Fetch Error]:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveGeofence = async (formData) => {
    try {
      if (currentGeofence) {
        await api.put(`/geofences/${currentGeofence._id}`, formData);
      } else {
        await api.post('/geofences', formData);
      }
      setIsModalOpen(false);
      setCurrentGeofence(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving geofence');
    }
  };

  const handleDeleteGeofence = async (id) => {
    if (confirm('Are you sure you want to delete this office geofence boundary?')) {
      try {
        await api.delete(`/geofences/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting geofence');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Office Geofence Boundary Manager</h1>
          <p className="text-xs text-gray-400">Configure corporate geofences, radius thresholds, and office WiFi BSSID signatures</p>
        </div>

        <button
          onClick={() => { setCurrentGeofence(null); setIsModalOpen(true); }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Geofence
        </button>
      </div>

      {/* Geofences List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {geofences.map((geo) => (
          <div key={geo._id} className="glass-panel rounded-2xl p-5 border border-indigo-500/20 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{geo.officeName}</h3>
                  <p className="text-xs text-gray-400">{geo.description}</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                geo.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}>
                {geo.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs py-3 border-y border-gray-800/80">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-mono">Center GPS Coordinates</span>
                <span className="font-mono text-cyan-300">{geo.latitude}, {geo.longitude}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-mono">Radius Threshold</span>
                <span className="font-semibold text-emerald-400">{geo.radiusMeters} Meters</span>
              </div>
            </div>

            {/* Registered WiFi BSSID Signatures */}
            <div>
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-2">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Registered Office WiFi Signatures
              </span>
              <div className="space-y-1.5">
                {geo.officeWifiBSSIDs && geo.officeWifiBSSIDs.length > 0 ? (
                  geo.officeWifiBSSIDs.map((wifi, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/60 border border-gray-800 text-xs font-mono">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-200">{wifi.ssid || 'Office_WiFi'}</span>
                        {wifi.roomName && (
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                            {wifi.roomName}
                          </span>
                        )}
                      </div>
                      <span className="text-cyan-400">{wifi.bssid}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-gray-500 italic">No WiFi BSSIDs registered yet</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-800/80">
              <button
                onClick={() => { setCurrentGeofence(geo); setIsModalOpen(true); }}
                className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 text-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Edit
              </button>
              <button
                onClick={() => handleDeleteGeofence(geo._id)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Entry/Exit Audit Logs Table */}
      <div className="glass-panel rounded-2xl p-5 border border-gray-800">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" /> Geofence Entry & Exit Audit Event Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-lg">Event Type</th>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Method</th>
                <th className="p-3">Stay Duration</th>
                <th className="p-3 rounded-r-lg">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-900/40">
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      log.eventType === 'ENTRY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {log.eventType}
                    </span>
                  </td>
                  <td className="p-3 text-cyan-300 font-semibold">{log.employeeId}</td>
                  <td className="p-3 text-indigo-400">{log.verificationMethod || 'GPS'}</td>
                  <td className="p-3 text-gray-300">{log.durationMinutes ? `${log.durationMinutes} mins` : '--'}</td>
                  <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <GeofenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGeofence}
        geofence={currentGeofence}
      />
    </div>
  );
}
