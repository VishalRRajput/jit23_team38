import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Wifi, Cpu, Battery, Gauge, ShieldCheck, ShieldAlert } from 'lucide-react';

// Custom Leaflet DivIcon for Employee Marker
const createCustomIcon = (isInside, isSos) => {
  const colorClass = isSos
    ? 'bg-rose-500 shadow-rose-500/50 animate-ping'
    : isInside
    ? 'bg-emerald-500 shadow-emerald-500/50'
    : 'bg-amber-500 shadow-amber-500/50';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div class="relative flex items-center justify-center">
      <span class="w-6 h-6 rounded-full ${colorClass} shadow-lg border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
        ${isInside ? 'IN' : 'OUT'}
      </span>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Component to dynamically re-center map when active employee selection changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 16, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ activeLocations = [], geofence = null, selectedCenter = null }) {
  // Default Center: Corporate HQ (San Francisco)
  const defaultCenter = [37.774929, -122.419416];
  const centerPos = selectedCenter || (geofence ? [geofence.latitude, geofence.longitude] : defaultCenter);

  return (
    <div className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden glass-panel border border-gray-800 relative z-10">
      <MapContainer
        center={centerPos}
        zoom={15}
        scrollWheelZoom={true}
        className="dark-map"
      >
        <MapRecenter center={centerPos} />
        
        {/* Standard OpenStreetMap Tiles (Darkened by CSS filter) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Geofence Perimeter Radius Circle */}
        {geofence && (
          <Circle
            center={[geofence.latitude, geofence.longitude]}
            radius={geofence.radiusMeters || 200}
            pathOptions={{
              color: '#6366F1',
              fillColor: '#6366F1',
              fillOpacity: 0.15,
              weight: 2,
              dashArray: '6, 8'
            }}
          >
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-indigo-300">{geofence.officeName}</p>
                <p className="text-[10px] text-gray-300">Geofence Radius: {geofence.radiusMeters}m</p>
              </div>
            </Popup>
          </Circle>
        )}

        {/* Active Employee GPS Markers */}
        {activeLocations.map((item, idx) => {
          const emp = item.employee || item;
          const loc = item.latestLocation || item;
          if (!loc || loc.latitude === undefined || loc.longitude === undefined) return null;

          const isInside = loc.isInsideGeofence || emp.currentStatus === 'Inside Office';
          const isSos = loc.sosAlert || emp.currentStatus === 'SOS Alert';

          return (
            <Marker
              key={emp.employeeId || idx}
              position={[loc.latitude, loc.longitude]}
              icon={createCustomIcon(isInside, isSos)}
            >
              <Popup>
                <div className="w-56 p-1">
                  <div className="flex items-center space-x-3 mb-2 pb-2 border-b border-gray-700">
                    <img
                      src={emp.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                      alt={emp.name}
                      className="w-9 h-9 rounded-full border border-gray-600 object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{emp.name}</h4>
                      <p className="text-[10px] text-gray-400">{emp.department} • {emp.employeeId}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-1"><Cpu className="w-3 h-3 text-cyan-400" /> Device ID:</span>
                      <span className="font-mono text-cyan-300">{emp.deviceId}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-1"><Battery className="w-3 h-3 text-emerald-400" /> Battery:</span>
                      <span className="font-semibold text-emerald-400">{loc.battery || 95}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-1"><Gauge className="w-3 h-3 text-indigo-400" /> Speed:</span>
                      <span>{loc.speed ? loc.speed.toFixed(1) : 0} km/h</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-gray-700/80">
                      <span className="text-gray-400">Boundary Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isInside ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {isInside ? 'INSIDE OFFICE' : 'OUTSIDE GEOFENCE'}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
