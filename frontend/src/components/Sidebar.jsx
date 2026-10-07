import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MapPin,
  ShieldCheck,
  CalendarCheck,
  BrainCircuit,
  FileSpreadsheet,
  Bell,
  Settings,
  LogOut,
  Wifi,
  Radio,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'GPS & WiFi Tracking', path: '/tracking', icon: MapPin },
    { name: 'Geofence Manager', path: '/geofences', icon: ShieldCheck },
    { name: 'Attendance Logs', path: '/attendance', icon: CalendarCheck },
    { name: 'AI Analytics', path: '/ai-analytics', icon: BrainCircuit },
    { name: 'Reports Export', path: '/reports', icon: FileSpreadsheet },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Building Designer', path: '/designer', icon: Building },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-gray-800/80 flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-gray-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold bg-gradient-to-r from-white via-gray-200 to-indigo-300 bg-clip-text text-transparent tracking-wide">
              GEO-TRACK PRO
            </h1>
            <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
              <Wifi className="w-2.5 h-2.5 text-emerald-400" /> DUAL WiFi + GPS
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
