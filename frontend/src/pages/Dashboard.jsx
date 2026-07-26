import React, { useState, useEffect } from 'react';
import StatCards from '../components/StatCards';
import MapView from '../components/MapView';
import AIInsightsCard from '../components/AIInsightsCard';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MapPin, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

const COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B'];

export default function Dashboard() {
  const { latestLocations } = useSocket();
  const [summary, setSummary] = useState(null);
  const [activeLocations, setActiveLocations] = useState([]);
  const [geofence, setGeofence] = useState(null);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, locRes, geoRes, anaRes] = await Promise.all([
          api.get('/attendance/summary'),
          api.get('/location/active/all'),
          api.get('/geofences'),
          api.get('/analytics')
        ]);

        if (sumRes.data.success) setSummary(sumRes.data.summary);
        if (locRes.data.success) setActiveLocations(locRes.data.locations);
        if (geoRes.data.success && geoRes.data.geofences.length > 0) {
          setGeofence(geoRes.data.geofences[0]);
        }
        if (anaRes.data.success) {
          setWeeklyTrends(anaRes.data.weeklyPresenceTrends);
          setDepartmentData(anaRes.data.departmentBreakdown);
        }
      } catch (err) {
        console.error('[Dashboard Fetch Error]:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Combine fetched active locations with real-time Socket updates
  const combinedLocations = activeLocations.map(item => {
    const empId = item.employee?.employeeId;
    if (empId && latestLocations[empId]) {
      return {
        ...item,
        latestLocation: latestLocations[empId],
        employee: {
          ...item.employee,
          currentStatus: latestLocations[empId].isInsideGeofence ? 'Inside Office' : 'Outside Geofence'
        }
      };
    }
    return item;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Real-Time Executive Dashboard</h1>
          <p className="text-xs text-gray-400">Live ESP32 telemetry, dual WiFi+GPS geofencing, and AI insights</p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            SOCKET STREAM: ONLINE
          </span>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <StatCards summary={summary} />

      {/* Main Grid: Interactive Map + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section (2 columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> Live Employee GPS Telemetry
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">Geofence: {geofence?.officeName || 'Corporate HQ'} ({geofence?.radiusMeters || 200}m)</span>
          </div>

          <div className="h-[440px]">
            <MapView activeLocations={combinedLocations} geofence={geofence} />
          </div>
        </div>

        {/* Right Side: AI Insights Card */}
        <div className="space-y-6">
          <AIInsightsCard />

          {/* Department Breakdown Pie Chart */}
          <div className="glass-panel rounded-2xl p-5 border border-gray-800">
            <h4 className="text-xs font-bold text-gray-200 mb-3 uppercase tracking-wider">Department Presence</h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData.length > 0 ? departmentData : [
                      { name: 'Engineering', value: 4 },
                      { name: 'Operations', value: 3 },
                      { name: 'Hardware R&D', value: 2 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Weekly Presence Trends Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Weekly Employee Presence Trends
            </h3>
            <p className="text-[11px] text-gray-400">Automated geofence entry & exit volume</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={weeklyTrends.length > 0 ? weeklyTrends : [
                { day: 'Mon', present: 8, absent: 1, late: 1 },
                { day: 'Tue', present: 9, absent: 0, late: 1 },
                { day: 'Wed', present: 10, absent: 0, late: 0 },
                { day: 'Thu', present: 9, absent: 1, late: 0 },
                { day: 'Fri', present: 8, absent: 2, late: 0 }
              ]}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
              <Area type="monotone" dataKey="present" stroke="#6366F1" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
