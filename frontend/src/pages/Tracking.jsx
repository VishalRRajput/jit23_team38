import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { MapPin, Navigation, Cpu, Battery, Signal, Clock, History } from 'lucide-react';

export default function Tracking() {
  const { latestLocations } = useSocket();
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [geofence, setGeofence] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, geoRes] = await Promise.all([
          api.get('/employees'),
          api.get('/geofences')
        ]);

        if (empRes.data.success && empRes.data.employees.length > 0) {
          setEmployees(empRes.data.employees);
          setSelectedEmpId(empRes.data.employees[0].employeeId);
        }
        if (geoRes.data.success && geoRes.data.geofences.length > 0) {
          setGeofence(geoRes.data.geofences[0]);
        }
      } catch (err) {
        console.error('[Tracking Fetch Error]:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEmpId) {
      api.get(`/location/history/${selectedEmpId}?limit=30`).then(res => {
        if (res.data.success) {
          setHistoryLogs(res.data.history);
        }
      }).catch(err => console.error(err));
    }
  }, [selectedEmpId]);

  const selectedEmployee = employees.find(e => e.employeeId === selectedEmpId);
  const liveLocation = latestLocations[selectedEmpId] || historyLogs[0];

  const centerPos = liveLocation
    ? [liveLocation.latitude, liveLocation.longitude]
    : geofence
    ? [geofence.latitude, geofence.longitude]
    : [37.774929, -122.419416];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Real-Time GPS & WiFi Telemetry Inspector</h1>
          <p className="text-xs text-gray-400">Deep-dive location inspection, raw coordinate logs, and ESP32 status</p>
        </div>
      </div>

      {/* Main Grid: Employee Selection Sidebar + Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Employee Picker & Live Telemetry Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-gray-800">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Select Active Device</h3>
            <div className="space-y-2">
              {employees.map(emp => (
                <button
                  key={emp.employeeId}
                  onClick={() => setSelectedEmpId(emp.employeeId)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    selectedEmpId === emp.employeeId
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white font-semibold'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2 h-2 rounded-full ${emp.currentStatus === 'Inside Office' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                    <div>
                      <p className="font-semibold text-gray-200">{emp.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{emp.deviceId}</p>
                    </div>
                  </div>
                  <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Device Telemetry Card */}
          {selectedEmployee && (
            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <span className="font-bold text-white flex items-center gap-1.5"><Cpu className="w-4 h-4 text-cyan-400" /> ESP32 Live Telemetry</span>
                <span className="text-[10px] font-mono text-cyan-400">{selectedEmployee.deviceId}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Lat / Lng:</span>
                  <span className="font-mono text-gray-200">{liveLocation?.latitude?.toFixed(6) || '37.774929'}, {liveLocation?.longitude?.toFixed(6) || '-122.419416'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-1"><Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery Level:</span>
                  <span className="font-semibold text-emerald-400">{liveLocation?.battery || 95}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-1"><Signal className="w-3.5 h-3.5 text-indigo-400" /> GPS Satellites:</span>
                  <span className="text-gray-200">{liveLocation?.satellites || 8} Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Verification Mode:</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono text-[10px]">
                    {liveLocation?.verificationMethod || 'GPS + WiFi BSSID'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Map View (3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="h-[480px]">
            <MapView
              activeLocations={employees.map(e => ({
                employee: e,
                latestLocation: latestLocations[e.employeeId] || (e.employeeId === selectedEmpId ? liveLocation : null)
              }))}
              geofence={geofence}
              selectedCenter={centerPos}
            />
          </div>

          {/* Historical Movement Breadcrumb Table */}
          <div className="glass-panel p-4 rounded-2xl border border-gray-800">
            <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" /> Recent Location Logs & Telemetry Stream
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">Timestamp</th>
                    <th className="p-2.5">Coordinates</th>
                    <th className="p-2.5">Speed</th>
                    <th className="p-2.5">Geofence Status</th>
                    <th className="p-2.5 rounded-r-lg">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono text-[11px]">
                  {historyLogs.slice(0, 5).map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-900/40">
                      <td className="p-2.5 text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="p-2.5 text-cyan-300">{log.latitude.toFixed(5)}, {log.longitude.toFixed(5)}</td>
                      <td className="p-2.5 text-gray-300">{log.speed ? log.speed.toFixed(1) : 0} km/h</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${log.isInsideGeofence ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {log.isInsideGeofence ? 'INSIDE' : 'OUTSIDE'}
                        </span>
                      </td>
                      <td className="p-2.5 text-indigo-400">{log.verificationMethod || 'GPS'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
