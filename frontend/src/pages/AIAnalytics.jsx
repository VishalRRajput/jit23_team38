import React, { useState, useEffect } from 'react';
import { BrainCircuit, Clock, MapPin, AlertTriangle, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import api from '../services/api';
import AIInsightsCard from '../components/AIInsightsCard';

export default function AIAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/ai-analytics').then(res => {
      if (res.data.success) {
        setData(res.data.data);
      }
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            AI-Powered Movement & Spatial Analytics <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-gray-400">Automated spatial clustering, stay duration, and behavioral anomaly detection</p>
        </div>
      </div>

      {/* Main Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Frequently Visited Areas */}
          <div className="glass-panel p-5 rounded-2xl border border-gray-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> Frequently Visited Areas & Spatial Zones
            </h3>

            <div className="space-y-3">
              {(data?.frequentlyVisitedAreas || [
                { area: 'Corporate HQ Main Office', visits: 84, percentage: '78%' },
                { area: 'Engineering R&D Annex', visits: 18, percentage: '15%' },
                { area: 'Logistics & Warehouse Zone', visits: 8, percentage: '7%' }
              ]).map((zone, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-200">{zone.area}</span>
                    <span className="font-mono text-cyan-400 font-bold">{zone.visits} Visits ({zone.percentage})</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: zone.percentage }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Late Arrival & Movement Anomalies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Late Arrival Detection */}
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Late Arrival Pattern Detection
              </h3>

              <div className="space-y-2 text-xs">
                {(data?.lateArrivalAnomalies || [
                  { employeeId: 'EMP-1002', checkInTime: '10:32 AM', delayMinutes: 32, anomalyScore: 'High Risk' }
                ]).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white font-mono">{item.employeeId}</p>
                      <p className="text-[10px] text-gray-400">Check In: {item.checkInTime}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold">
                      +{item.delayMinutes}m Delay
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Speed & Unusual Movement Detection */}
            <div className="glass-panel p-5 rounded-2xl border border-rose-500/20">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Unusual Movement Anomalies
              </h3>

              <div className="space-y-2 text-xs">
                {(data?.speedAnomalies || [
                  { employeeId: 'EMP-1003', speed: 84.2, anomalyType: 'High Speed Transit Detected' }
                ]).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white font-mono">{item.employeeId}</p>
                      <p className="text-[10px] text-gray-400">{item.anomalyType}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-bold font-mono">
                      {item.speed} km/h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right AI Insights Widget */}
        <div>
          <AIInsightsCard insights={data?.aiInsights} />
        </div>
      </div>
    </div>
  );
}
