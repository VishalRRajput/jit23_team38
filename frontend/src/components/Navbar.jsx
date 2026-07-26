import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Shield, Radio, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleNotifications }) {
  const { admin } = useAuth();
  const { unreadNotificationsCount } = useSocket();
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B0F19]/80 backdrop-blur-md border-b border-gray-800/80 px-6 flex items-center justify-between">
      {/* Left: System Status & Clock */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ESP32 Telemetry Stream Active</span>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-gray-400 bg-gray-900/60 px-3 py-1 rounded-lg border border-gray-800">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>REALTIME CLOCK: {timeStr}</span>
        </div>
      </div>

      {/* Right: Notification Drawer, Search & Admin Profile */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative hidden sm:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee or device..."
            className="w-full bg-gray-900/80 border border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Notifications Icon */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Admin Profile Dropdown Trigger */}
        <div
          onClick={() => navigate('/admin-profile')}
          className="flex items-center space-x-3 cursor-pointer pl-3 border-l border-gray-800 hover:opacity-90 transition-opacity"
        >
          <img
            src={admin?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt="Admin"
            className="w-8 h-8 rounded-full border border-indigo-500/50 object-cover"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-gray-200">{admin?.name || 'Chief Admin'}</p>
            <p className="text-[10px] text-gray-400 capitalize">{admin?.role || 'Super Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
