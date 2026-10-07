import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import DigitalTwinView from '../components/DigitalTwin/DigitalTwinView';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { MapPin, Navigation, Cpu, Battery, Signal, Clock, History, Box, Map } from 'lucide-react';

export default function Tracking() {
  const { latestLocations } = useSocket();
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [geofence, setGeofence] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  
  // Indoor state
  const [viewMode, setViewMode] = useState('outdoor'); // 'outdoor' | 'indoor'
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await api.get('/employees');
        if (empRes.data && empRes.data.success && Array.isArray(empRes.data.employees) && empRes.data.employees.length > 0) {
          setEmployees(empRes.data.employees);
          setSelectedEmpId(empRes.data.employees[0].employeeId);
        }
      } catch (err) {
        console.error('[Tracking Employees Fetch Error]:', err);
      }

      try {
        const geoRes = await api.get('/geofences');
        if (geoRes.data && geoRes.data.success && Array.isArray(geoRes.data.geofences) && geoRes.data.geofences.length > 0) {
          setGeofence(geoRes.data.geofences[0]);
        }
      } catch (err) {
        console.error('[Tracking Geofence Fetch Error]:', err);
      }

      try {
        const bldgRes = await api.get('/buildings');
        if (bldgRes.data && bldgRes.data.success && Array.isArray(bldgRes.data.data) && bldgRes.data.data.length > 0) {
          const firstBldgId = bldgRes.data.data[0]._id;
          const floorRes = await api.get(`/buildings/${firstBldgId}/floors`);
          
          if (floorRes.data && floorRes.data.success && Array.isArray(floorRes.data.data) && floorRes.data.data.length > 0) {
            let allRooms = [];
            for (const floor of floorRes.data.data) {
              const roomRes = await api.get(`/buildings/floors/${floor._id}/rooms`);
              if (roomRes.data && roomRes.data.success && Array.isArray(roomRes.data.data)) {
                const roomsWithFloor = roomRes.data.data.map(r => ({
                  ...r,
                  floorLevel: floor.level
                }));
                allRooms = [...allRooms, ...roomsWithFloor];
              }
            }
            setRooms(allRooms);
          }
        }
      } catch (err) {
        console.error('[Tracking Buildings Fetch Error]:', err);
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

  // Auto-switch view based on indoor/outdoor status
  useEffect(() => {
    if (liveLocation) {
      if (liveLocation.isIndoor && viewMode !== 'indoor') {
        setViewMode('indoor');
        if (liveLocation.roomId) {
          const room = rooms.find(r => r._id === liveLocation.roomId);
          if (room) setSelectedRoom(room);
        }
      } else if (!liveLocation.isIndoor && viewMode !== 'outdoor') {
        setViewMode('outdoor');
      }
    }
  }, [liveLocation, rooms]);

  const centerPos = liveLocation && !liveLocation.isIndoor
    ? [liveLocation.latitude, liveLocation.longitude]
    : geofence
    ? [geofence.latitude, geofence.longitude]
    : [37.774929, -122.419416];

  // Map employees to include their latest location data for Digital Twin
  const mappedEmployees = employees.map(emp => {
    const loc = latestLocations[emp.employeeId] || (emp.employeeId === selectedEmpId ? liveLocation : null);
    return {
      ...emp,
      ...loc
    };
  });

  // Extract SOS alerts
  const sosAlerts = mappedEmployees.filter(e => e.sosAlert && e.isIndoor && e.roomId).map(e => e.roomId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Real-Time Hybrid Tracking</h1>
          <p className="text-xs text-gray-400">Deep-dive GPS & Indoor WiFi telemetry inspection</p>
        </div>
        
        {/* Hybrid Toggle */}
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
          <button 
            onClick={() => setViewMode('outdoor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'outdoor' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Map size={16} /> Outdoor GPS
          </button>
          <button 
            onClick={() => setViewMode('indoor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'indoor' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Box size={16} /> Indoor Twin
          </button>
        </div>
      </div>

      {/* Main Grid: Employee Selection Sidebar + Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Employee Picker & Live Telemetry Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-gray-800">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Select Active Device</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {employees.map(emp => {
                const latestLoc = latestLocations[emp.employeeId];
                // Check if we received a ping in the last 15 seconds
                const isOnline = latestLoc && (new Date() - new Date(latestLoc.timestamp)) < 15000;
                const isIndoor = isOnline && latestLoc?.isIndoor;
                const displayStatus = isOnline 
                  ? (latestLoc.currentStatus || emp.currentStatus || 'Online')
                  : 'Offline (ESP32 Off)';

                return (
                  <button
                    key={emp.employeeId}
                    onClick={() => {
                      setSelectedEmpId(emp.employeeId);
                      if (latestLoc?.isIndoor) {
                        setViewMode('indoor');
                      } else if (latestLoc) {
                        setViewMode('outdoor');
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      selectedEmpId === emp.employeeId
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white font-semibold'
                        : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-2 h-2 rounded-full ${!isOnline ? 'bg-gray-600' : (isIndoor ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400')}`}></span>
                      <div>
                        <p className="font-semibold text-gray-200">{emp.name}</p>
                        <p className={`text-[10px] font-mono flex items-center gap-1 ${!isOnline ? 'text-gray-500' : 'text-cyan-400'}`}>
                          {displayStatus} {isIndoor && <span className="text-emerald-500 text-[10px]">📍</span>}
                        </p>
                      </div>
                    </div>
                    <Navigation className={`w-3.5 h-3.5 ${isOnline ? 'text-indigo-400' : 'text-gray-600'}`} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Device Telemetry Card */}
          {selectedEmployee && (
            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 text-xs space-y-3 relative overflow-hidden">
              {liveLocation?.sosAlert && (
                <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none"></div>
              )}
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <span className={`font-bold flex items-center gap-1.5 ${liveLocation?.sosAlert ? 'text-red-400' : 'text-white'}`}>
                  <Cpu className={`w-4 h-4 ${liveLocation?.sosAlert ? 'text-red-400' : 'text-cyan-400'}`} /> 
                  ESP32 Live Telemetry
                </span>
                <span className="text-[10px] font-mono text-cyan-400">{selectedEmployee.deviceId}</span>
              </div>

              <div className="space-y-2 relative z-10">
                {liveLocation?.isIndoor ? (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Indoor Location:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {rooms.find(r => r._id === liveLocation.roomId)?.name || 'Unknown Room'}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lat / Lng:</span>
                    <span className="font-mono text-gray-200">{liveLocation?.latitude?.toFixed(6) || '37.774929'}, {liveLocation?.longitude?.toFixed(6) || '-122.419416'}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-1"><Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery Level:</span>
                  <span className={`font-semibold ${liveLocation?.battery < 20 ? 'text-red-400' : 'text-emerald-400'}`}>{liveLocation?.battery || 95}%</span>
                </div>
                
                {!liveLocation?.isIndoor && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 flex items-center gap-1"><Signal className="w-3.5 h-3.5 text-indigo-400" /> GPS Satellites:</span>
                    <span className="text-gray-200">{liveLocation?.satellites || 8} Active</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Verification Mode:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${liveLocation?.isIndoor ? 'bg-emerald-500/10 text-emerald-300' : 'bg-indigo-500/10 text-indigo-300'}`}>
                    {liveLocation?.verificationMethod || 'GPS'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Map/Twin View (3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="h-[480px] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative">
            {viewMode === 'outdoor' ? (
              <MapView
                activeLocations={employees.map(e => ({
                  employee: e,
                  latestLocation: latestLocations[e.employeeId] || (e.employeeId === selectedEmpId ? liveLocation : null)
                }))}
                geofence={geofence}
                selectedCenter={centerPos}
              />
            ) : (
              <DigitalTwinView 
                rooms={rooms} 
                employees={mappedEmployees} 
                selectedRoom={selectedRoom}
                setSelectedRoom={setSelectedRoom}
                sosAlerts={sosAlerts}
              />
            )}
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
                    <th className="p-2.5">Location</th>
                    <th className="p-2.5">Speed/Battery</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 rounded-r-lg">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono text-[11px]">
                  {historyLogs.slice(0, 5).map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-900/40">
                      <td className="p-2.5 text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="p-2.5 text-cyan-300">
                        {log.isIndoor 
                          ? <span className="text-emerald-400 font-bold">Indoor: {rooms.find(r => r._id === log.roomId)?.name || 'Building'}</span>
                          : `${log.latitude.toFixed(5)}, ${log.longitude.toFixed(5)}`}
                      </td>
                      <td className="p-2.5 text-gray-300">{log.isIndoor ? `Bat: ${log.battery}%` : `${log.speed ? log.speed.toFixed(1) : 0} km/h`}</td>
                      <td className="p-2.5">
                        {log.sosAlert ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 animate-pulse">SOS ACTIVE</span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] ${log.isInsideGeofence || log.isIndoor ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {log.isIndoor ? 'INDOORS' : (log.isInsideGeofence ? 'INSIDE GEO' : 'OUTSIDE')}
                          </span>
                        )}
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
