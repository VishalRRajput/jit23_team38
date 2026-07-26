import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

export default function AttendanceModal({ isOpen, onClose, onSave, attendance }) {
  const [checkOutTime, setCheckOutTime] = useState('');

  useEffect(() => {
    if (attendance) {
      if (attendance.checkOutTime) {
        const d = new Date(attendance.checkOutTime);
        // adjust for timezone offset to show correctly in datetime-local
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        setCheckOutTime(d.toISOString().slice(0, 16));
      } else {
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        setCheckOutTime(d.toISOString().slice(0, 16));
      }
    }
  }, [attendance]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      employeeId: attendance.employeeId,
      date: attendance.date,
      checkOutTime: new Date(checkOutTime).toISOString(),
      status: attendance.status
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Manual Check-Out Override</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Employee</label>
            <div className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white font-bold">
              {attendance?.name}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-emerald-400 font-bold">Check-Out Time</label>
            <input
              type="datetime-local"
              required
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full bg-gray-900 border border-emerald-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Save Check-Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
