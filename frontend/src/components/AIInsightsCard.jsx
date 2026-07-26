import React from 'react';
import { BrainCircuit, Zap, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';

export default function AIInsightsCard({ insights = [] }) {
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'warning':
        return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: AlertTriangle };
      case 'success':
        return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle };
      default:
        return { color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', icon: Info };
    }
  };

  const demoInsights = insights.length > 0 ? insights : [
    {
      id: 1,
      title: 'Optimal HQ Geofence Occupancy',
      category: 'Occupancy Intelligence',
      confidence: 96,
      severity: 'info',
      description: 'Peak presence occurs between 10:00 AM and 03:30 PM with an average stay duration of 7.8 hours.'
    },
    {
      id: 2,
      title: 'WiFi BSSID Indoor Accuracy High',
      category: 'Dual Hardware Signal',
      confidence: 92,
      severity: 'success',
      description: 'Dual-mode verification correctly identified 94% indoor entries where GPS satellite fix was limited.'
    },
    {
      id: 3,
      title: 'Late Arrival Anomaly Detected',
      category: 'Attendance Pattern Risk',
      confidence: 87,
      severity: 'warning',
      description: 'Detected 2 recurring late check-ins on Mondays. Recommended schedule check.'
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              AI Movement Intelligence <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </h3>
            <p className="text-[10px] text-gray-400">Automated pattern clustering & anomaly engine</p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
          CONFIDENCE: 94%
        </span>
      </div>

      <div className="space-y-3">
        {demoInsights.map((insight) => {
          const badge = getSeverityBadge(insight.severity);
          const Icon = badge.icon;
          return (
            <div
              key={insight.id}
              className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 hover:border-gray-700 transition-all text-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-gray-200">{insight.title}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 ${badge.color}`}>
                  <Icon className="w-3 h-3" /> {insight.category}
                </span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">{insight.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
