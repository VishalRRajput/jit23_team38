import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit3, Trash2, Cpu, ShieldCheck, ShieldAlert, Mail, Phone } from 'lucide-react';
import api from '../services/api';
import EmployeeModal from '../components/EmployeeModal';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmp, setCurrentEmp] = useState(null);

  const fetchEmployees = async () => {
    try {
      const res = await api.get(`/employees?search=${search}&department=${selectedDept}`);
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error('[Employees Fetch Error]:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept]);

  const handleSaveEmployee = async (formData) => {
    try {
      if (currentEmp) {
        await api.put(`/employees/${currentEmp._id}`, formData);
      } else {
        await api.post('/employees', formData);
      }
      setIsModalOpen(false);
      setCurrentEmp(null);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (confirm('Are you sure you want to remove this employee hardware registration?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting employee');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Employee Directory & Hardware Registry</h1>
          <p className="text-xs text-gray-400">Manage personnel assignments, ESP32 device MACs, and active status</p>
        </div>

        <button
          onClick={() => { setCurrentEmp(null); setIsModalOpen(true); }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New Employee
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Employee ID, Name, Email, or ESP32 Device ID..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Hardware R&D">Hardware R&D</option>
          <option value="Operations">Operations</option>
          <option value="Quality Assurance">Quality Assurance</option>
          <option value="Logistics">Logistics</option>
        </select>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const isInside = emp.currentStatus === 'Inside Office';
          return (
            <div
              key={emp._id}
              className="glass-panel glass-card-hover rounded-2xl p-5 border border-gray-800/80 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={emp.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                      alt={emp.name}
                      className="w-11 h-11 rounded-full border border-gray-700 object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{emp.name}</h3>
                      <p className="text-xs text-indigo-400 font-medium">{emp.designation}</p>
                      <span className="text-[10px] font-mono text-gray-400">{emp.employeeId}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isInside ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {emp.currentStatus || 'Offline'}
                  </span>
                </div>

                <div className="space-y-2 py-3 border-y border-gray-800/80 text-xs text-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> Device ID:</span>
                    <span className="font-mono text-cyan-300 font-semibold">{emp.deviceId}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-400" /> Email:</span>
                    <span className="text-gray-300 truncate max-w-[150px]">{emp.email}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone:</span>
                    <span className="text-gray-300">{emp.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  onClick={() => { setCurrentEmp(emp); setIsModalOpen(true); }}
                  className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-xs flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteEmployee(emp._id)}
                  className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={currentEmp}
      />
    </div>
  );
}
