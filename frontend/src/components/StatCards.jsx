import React from 'react';
import { Users, UserCheck, UserX, Cpu, TrendingUp } from 'lucide-react';

export default function StatCards({ summary }) {
  const stats = [
    {
      title: 'Total Employees',
      value: summary?.totalEmployees || 4,
      subtext: 'Registered Trackers',
      icon: Users,
      color: 'from-blue-600/20 to-indigo-600/20',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400'
    },
    {
      title: 'Employees Present',
      value: summary?.insideCount || 2,
      subtext: 'Inside Office Geofence',
      icon: UserCheck,
      color: 'from-emerald-600/20 to-teal-600/20',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Employees Outside',
      value: summary?.outsideCount || 2,
      subtext: 'Out of Boundary / Transit',
      icon: UserX,
      color: 'from-amber-600/20 to-orange-600/20',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400'
    },
    {
      title: 'Active ESP32 Devices',
      value: summary?.totalEmployees || 4,
      subtext: 'Dual GPS+WiFi Streaming',
      icon: Cpu,
      color: 'from-cyan-600/20 to-sky-600/20',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`glass-panel glass-card-hover rounded-2xl p-5 border ${stat.borderColor} relative overflow-hidden`}
          >
            {/* Ambient background glow */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} blur-2xl pointer-events-none`}></div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</span>
              <div className={`p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 ${stat.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-extrabold text-white font-['Outfit']">{stat.value}</h2>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live
              </span>
            </div>

            <p className="text-[11px] text-gray-400 mt-2 font-sans">{stat.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
