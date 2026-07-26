import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Wifi, MapPin } from 'lucide-react';

export default function GeofenceModal({ isOpen, onClose, onSave, geofence = null }) {
  const [formData, setFormData] = useState({
    officeName: '',
    latitude: 37.774929,
    longitude: -122.419416,
    radiusMeters: 200,
    officeWifiBSSID: 'AA:BB:CC:DD:EE:01',
    officeWifiSSID: 'Office_WiFi_Network',
    roomName: '',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    if (geofence) {
      setFormData({
        officeName: geofence.officeName || '',
        latitude: geofence.latitude || 37.774929,
        longitude: geofence.longitude || -122.419416,
        radiusMeters: geofence.radiusMeters || 200,
        officeWifiBSSID: geofence.officeWifiBSSIDs?.[0]?.bssid || 'AA:BB:CC:DD:EE:01',
        officeWifiSSID: geofence.officeWifiBSSIDs?.[0]?.ssid || 'Office_WiFi_Network',
        roomName: geofence.officeWifiBSSIDs?.[0]?.roomName || '',
        description: geofence.description || '',
        status: geofence.status || 'Active'
      });
    }
  }, [geofence]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      officeWifiBSSIDs: [
        { ssid: formData.officeWifiSSID, bssid: formData.officeWifiBSSID, roomName: formData.roomName, minRssi: -85 }
      ]
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              {geofence ? 'Edit Office Geofence' : 'Create New Office Geofence'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Office Name</label>
            <input
              type="text"
              required
              value={formData.officeName}
              onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Corporate Silicon Valley HQ"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Center Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Center Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Geofence Radius (Meters)</label>
            <input
              type="number"
              required
              value={formData.radiusMeters}
              onChange={(e) => setFormData({ ...formData, radiusMeters: parseInt(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
            <div>
              <label className="block text-gray-400 mb-1 flex items-center gap-1">
                <Wifi className="w-3 h-3 text-cyan-400" /> Office WiFi SSID
              </label>
              <input
                type="text"
                value={formData.officeWifiSSID}
                onChange={(e) => setFormData({ ...formData, officeWifiSSID: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                placeholder="Office_WiFi_Network"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-mono">WiFi BSSID (MAC)</label>
              <input
                type="text"
                value={formData.officeWifiBSSID}
                onChange={(e) => setFormData({ ...formData, officeWifiBSSID: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="AA:BB:CC:DD:EE:01"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-emerald-400 font-bold">Room / Classroom Name (Optional)</label>
            <input
              type="text"
              value={formData.roomName}
              onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
              className="w-full bg-gray-900 border border-emerald-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Room 1 A Block"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Geofence boundary notes..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Save Geofence Boundary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
