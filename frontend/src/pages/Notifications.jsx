import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, LogOut, ShieldAlert, CheckCheck, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) setNotifications(res.data.notifications);
    } catch (err) {
      console.error('[Notifications Fetch Error]:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Clear all notifications?')) {
      try {
        await api.delete('/notifications/clear');
        fetchNotifications();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notification Center</h1>
          <p className="text-xs text-gray-400">Audit trail for employee entries, exits, device offline alerts, and SOS signals</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs text-rose-400 font-semibold flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
            <p>No logged notifications found.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-xl border text-xs transition-all flex items-start justify-between ${
                n.read ? 'bg-gray-900/40 border-gray-800/60 text-gray-400' : 'bg-gray-900/80 border-gray-700 text-gray-200 shadow-md'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">{n.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                    {n.type}
                  </span>
                </div>
                <p className="text-gray-400">{n.message}</p>
              </div>

              <span className="text-[10px] font-mono text-gray-500 shrink-0">
                {new Date(n.timestamp).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
