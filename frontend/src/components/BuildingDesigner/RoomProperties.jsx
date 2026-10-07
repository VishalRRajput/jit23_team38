import React, { useState, useEffect } from 'react';
import useBuildingStore from '../../context/useBuildingStore';
import { Trash2, Save, Plus, X } from 'lucide-react';

const RoomProperties = () => {
  const { selectedRoom, updateRoom, deleteRoom } = useBuildingStore();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (selectedRoom) {
      setFormData(selectedRoom);
    }
  }, [selectedRoom]);

  if (!selectedRoom) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 flex flex-col items-center justify-center text-gray-400">
        <p className="text-center">Select a room on the canvas to view properties.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateRoom(selectedRoom._id, formData);
  };

  const handleAddWifi = () => {
    const wifis = formData.wifiFingerprints || [];
    setFormData({
      ...formData,
      wifiFingerprints: [...wifis, { bssid: '', ssid: '', rssiRange: { min: -90, max: -30 }, priority: 1 }]
    });
  };

  const updateWifi = (index, field, value) => {
    const updated = [...(formData.wifiFingerprints || [])];
    if (field === 'min' || field === 'max') {
      updated[index].rssiRange[field] = parseInt(value, 10);
    } else {
      updated[index][field] = value;
    }
    setFormData({ ...formData, wifiFingerprints: updated });
  };

  const removeWifi = (index) => {
    const updated = [...(formData.wifiFingerprints || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, wifiFingerprints: updated });
  };

  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
        <h2 className="text-lg font-semibold text-white">Room Properties</h2>
        <button 
          onClick={() => deleteRoom(selectedRoom._id)}
          className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-900/30 transition-colors"
          title="Delete Room"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Room Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name || ''} 
            onChange={handleChange}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
          <select 
            name="type" 
            value={formData.type || 'Room'} 
            onChange={handleChange}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {['Room', 'Meeting Room', 'HR', 'IT', 'Reception', 'Pantry', 'Server Room', 'Cabin', 'Store Room', 'Hallway'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Color</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              name="color" 
              value={formData.color || '#4B5563'} 
              onChange={handleChange}
              className="w-10 h-10 rounded border-0 bg-transparent p-0 cursor-pointer"
            />
            <input 
              type="text" 
              name="color" 
              value={formData.color || '#4B5563'} 
              onChange={handleChange}
              className="flex-1 bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-indigo-500 uppercase"
            />
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-white">WiFi Fingerprints</h3>
            <button 
              onClick={handleAddWifi}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
            >
              <Plus size={14} /> Add AP
            </button>
          </div>
          
          <div className="space-y-3">
            {(formData.wifiFingerprints || []).map((wifi, idx) => (
              <div key={idx} className="bg-gray-700/50 border border-gray-600 rounded p-3 relative group">
                <button 
                  onClick={() => removeWifi(idx)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs text-gray-400">BSSID</label>
                    <input 
                      type="text" 
                      value={wifi.bssid} 
                      onChange={(e) => updateWifi(idx, 'bssid', e.target.value)}
                      placeholder="AA:BB:CC:DD:EE:FF"
                      className="w-full bg-gray-800 text-white text-xs border border-gray-600 rounded px-2 py-1 mt-1 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">SSID</label>
                    <input 
                      type="text" 
                      value={wifi.ssid} 
                      onChange={(e) => updateWifi(idx, 'ssid', e.target.value)}
                      placeholder="Office_Network"
                      className="w-full bg-gray-800 text-white text-xs border border-gray-600 rounded px-2 py-1 mt-1 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400">Min RSSI</label>
                    <input 
                      type="number" 
                      value={wifi.rssiRange?.min || -90} 
                      onChange={(e) => updateWifi(idx, 'min', e.target.value)}
                      className="w-full bg-gray-800 text-white text-xs border border-gray-600 rounded px-2 py-1 mt-1 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Max RSSI</label>
                    <input 
                      type="number" 
                      value={wifi.rssiRange?.max || -30} 
                      onChange={(e) => updateWifi(idx, 'max', e.target.value)}
                      className="w-full bg-gray-800 text-white text-xs border border-gray-600 rounded px-2 py-1 mt-1 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Priority</label>
                    <input 
                      type="number" 
                      value={wifi.priority || 1} 
                      onChange={(e) => updateWifi(idx, 'priority', parseInt(e.target.value))}
                      className="w-full bg-gray-800 text-white text-xs border border-gray-600 rounded px-2 py-1 mt-1 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!formData.wifiFingerprints || formData.wifiFingerprints.length === 0) && (
              <p className="text-xs text-gray-500 italic text-center py-2">No WiFi Access Points assigned to this room.</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-700 bg-gray-900/50">
        <button 
          onClick={handleSave}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded flex justify-center items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Save size={18} /> Save Changes
        </button>
      </div>
    </div>
  );
};

export default RoomProperties;
