import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Cpu, Wifi, Map, Bell, Shield } from 'lucide-react';

export default function Settings() {
  const [config, setConfig] = useState({
    postInterval: 5000,
    geofenceRadius: 200,
    wifiRssiThreshold: -85,
    googleMapsKey: '',
    autoCheckOutHours: 12,
    enableSosPush: true,
    enableEmailAlerts: true
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Settings & Hardware Parameters</h1>
          <p className="text-xs text-gray-400">Configure ESP32 device upload rates, WiFi RSSI thresholds, and map integrations</p>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          ✓ System settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Hardware & Telemetry Parameters */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" /> ESP32 Telemetry & Polling Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Location Upload Interval (Milliseconds)</label>
              <input
                type="number"
                value={config.postInterval}
                onChange={(e) => setConfig({ ...config, postInterval: parseInt(e.target.value) })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">Recommended: 5000ms (5 seconds)</p>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">WiFi RSSI Indoor Threshold (dBm)</label>
              <input
                type="number"
                value={config.wifiRssiThreshold}
                onChange={(e) => setConfig({ ...config, wifiRssiThreshold: parseInt(e.target.value) })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">Minimum signal strength for indoor verification</p>
            </div>
          </div>
        </div>

        {/* Map Integration */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
            <Map className="w-4 h-4 text-indigo-400" /> Map Rendering & API Key Configuration
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Optional Google Maps API Key</label>
              <input
                type="text"
                value={config.googleMapsKey}
                onChange={(e) => setConfig({ ...config, googleMapsKey: e.target.value })}
                placeholder="AIzaSy... (Leave empty to use OpenStreetMap Leaflet tiles default)"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Alert Toggles */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
            <Bell className="w-4 h-4 text-emerald-400" /> Notifications & Emergency SOS Alerts
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableSosPush}
                onChange={(e) => setConfig({ ...config, enableSosPush: e.target.checked })}
                className="w-4 h-4 rounded bg-gray-900 border-gray-800 text-indigo-600 focus:ring-0"
              />
              <span className="text-gray-200">Broadcast Real-Time Audio Popups on Push Button SOS</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableEmailAlerts}
                onChange={(e) => setConfig({ ...config, enableEmailAlerts: e.target.checked })}
                className="w-4 h-4 rounded bg-gray-900 border-gray-800 text-indigo-600 focus:ring-0"
              />
              <span className="text-gray-200">Dispatch Email Summaries for Late Arrival Anomalies</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Save className="w-4 h-4" /> Save System Settings
        </button>
      </form>
    </div>
  );
}
