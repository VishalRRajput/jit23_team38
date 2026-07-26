import React from 'react';
import { X, Bell, ShieldCheck, ShieldAlert, LogOut, CheckCheck, Trash2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { liveAlerts, unreadNotificationsCount, setUnreadNotificationsCount } = useSocket();

  if (!isOpen) return null;

  const getAlertBadge = (type) => {
    switch (type) {
      case 'ENTRY':
        return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: ShieldCheck };
      case 'EXIT':
        return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: LogOut };
      case 'SOS_ALERT':
        return { color: 'text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse', icon: ShieldAlert };
      default:
        return { color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', icon: Bell };
    }
  };

  const markAllRead = () => {
    setUnreadNotificationsCount(0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111827] border-l border-gray-800 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Real-Time Event Stream</h3>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                    {unreadNotificationsCount} New
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllRead}
                  className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-xs flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                </button>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="p-6 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto">
              {liveAlerts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
                  <p>No new real-time geofence events logged yet.</p>
                  <p className="text-[10px] mt-1 text-gray-600">Events will stream live when ESP32 telemetry updates.</p>
                </div>
              ) : (
                liveAlerts.map((alert) => {
                  const badge = getAlertBadge(alert.type);
                  const Icon = badge.icon;
                  return (
                    <div
                      key={alert.id}
                      className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
                          <Icon className="w-3.5 h-3.5" /> {alert.type}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">{alert.timestamp}</span>
                      </div>
                      <h4 className="font-semibold text-gray-200 mt-1.5">{alert.title}</h4>
                      <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">{alert.message}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-950/40">
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition-colors"
            >
              Close Notification Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
