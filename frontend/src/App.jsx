import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import NotificationDrawer from './components/NotificationDrawer';
import { useAuth } from './context/AuthContext';

import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Tracking from './pages/Tracking';
import GeofenceManagement from './pages/GeofenceManagement';
import Attendance from './pages/Attendance';
import AIAnalytics from './pages/AIAnalytics';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AdminProfile from './pages/AdminProfile';

function ProtectedLayout() {
  const { token, loading } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-gray-400 text-xs font-mono">
        Loading System Dashboard...
      </div>
    );
  }

  // Redirect to login if token absent
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0B0F19]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleNotifications={() => setIsNotificationOpen(!isNotificationOpen)} />
        <main className="p-6 flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/geofences" element={<GeofenceManagement />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/ai-analytics" element={<AIAnalytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin-profile" element={<AdminProfile />} />
          </Routes>
        </main>
      </div>

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
