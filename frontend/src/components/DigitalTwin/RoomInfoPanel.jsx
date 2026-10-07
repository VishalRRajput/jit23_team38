import React from 'react';
import { X, Wifi, Battery, AlertTriangle, Clock } from 'lucide-react';

const RoomInfoPanel = ({ room, employees, onClose }) => {
  return (
    <div className="absolute bottom-4 right-4 w-80 bg-gray-900/95 border border-gray-700 rounded-lg shadow-2xl backdrop-blur z-40 overflow-hidden flex flex-col max-h-[80vh]">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center" style={{ borderTop: `4px solid ${room.color || '#4b5563'}` }}>
        <div>
          <h2 className="text-lg font-bold text-white">{room.name}</h2>
          <p className="text-xs text-gray-400">{room.type}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-1 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {/* Occupancy */}
        <div className="bg-gray-800 rounded p-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Occupancy</h3>
          {employees.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Room is currently empty.</p>
          ) : (
            <div className="space-y-3">
              {employees.map(emp => (
                <div key={emp.employeeId} className="flex items-center gap-3 bg-gray-900 p-2 rounded border border-gray-700">
                  <img src={emp.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-indigo-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{emp.name}</p>
                    <p className="text-xs text-gray-400 truncate">{emp.employeeId} • {emp.department}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Telemetry (show for first employee if multiple, or general room info) */}
        {employees.length > 0 && (
          <div className="bg-gray-800 rounded p-3 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Device Status (Latest)</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-900 p-2 rounded flex items-center gap-2">
                <Wifi size={14} className="text-blue-400" />
                <div>
                  <p className="text-[10px] text-gray-500">Method</p>
                  <p className="text-xs text-white font-medium">WiFi Fingerprint</p>
                </div>
              </div>
              <div className="bg-gray-900 p-2 rounded flex items-center gap-2">
                <Battery size={14} className="text-green-400" />
                <div>
                  <p className="text-[10px] text-gray-500">Battery</p>
                  <p className="text-xs text-white font-medium">{employees[0].battery || 100}%</p>
                </div>
              </div>
              <div className="bg-gray-900 p-2 rounded flex items-center gap-2">
                <Clock size={14} className="text-purple-400" />
                <div>
                  <p className="text-[10px] text-gray-500">Last Seen</p>
                  <p className="text-xs text-white font-medium">Just now</p>
                </div>
              </div>
              <div className="bg-gray-900 p-2 rounded flex items-center gap-2">
                <AlertTriangle size={14} className={employees.some(e => e.sosAlert) ? "text-red-500" : "text-gray-500"} />
                <div>
                  <p className="text-[10px] text-gray-500">SOS Status</p>
                  <p className={`text-xs font-medium ${employees.some(e => e.sosAlert) ? "text-red-500" : "text-white"}`}>
                    {employees.some(e => e.sosAlert) ? "ACTIVE" : "Normal"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomInfoPanel;
