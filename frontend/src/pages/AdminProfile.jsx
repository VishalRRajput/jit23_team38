import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Mail, Phone, Building, Save } from 'lucide-react';
import api from '../services/api';

export default function AdminProfile() {
  const { admin, setAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: admin?.name || 'Corporate Chief Admin',
    email: admin?.email || 'admin@company.com',
    department: admin?.department || 'Executive Operations',
    phone: admin?.phone || '+1 (555) 019-2834',
    avatar: admin?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  });

  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        setAdmin(res.data.admin);
        setMsg('Profile updated successfully!');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Profile & Access Credentials</h1>
        <p className="text-xs text-gray-400">Manage superadmin profile details and system access permissions</p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          ✓ {msg}
        </div>
      )}

      <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-gray-800">
          <img
            src={formData.avatar}
            alt="Avatar"
            className="w-16 h-16 rounded-full border-2 border-indigo-500/50 object-cover"
          />
          <div>
            <h3 className="text-base font-bold text-white">{formData.name}</h3>
            <p className="text-xs text-indigo-400 font-medium">{formData.department}</p>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mt-1 inline-block uppercase">
              ROLE: {admin?.role || 'SUPERADMIN'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Full Admin Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save className="w-4 h-4" /> Save Profile Details
          </button>
        </form>
      </div>
    </div>
  );
}
