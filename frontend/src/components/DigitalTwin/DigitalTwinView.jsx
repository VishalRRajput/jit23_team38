import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import Building3D from './Building3D';
import EmployeeIndicator3D from './EmployeeIndicator3D';
import RoomInfoPanel from './RoomInfoPanel';

const DigitalTwinView = ({ 
  rooms, 
  employees, 
  selectedRoom, 
  setSelectedRoom,
  sosAlerts = []
}) => {
  // Indoor employees
  const indoorEmployees = employees.filter(emp => emp.isIndoor && emp.roomId);

  return (
    <div className="w-full h-full relative bg-gray-950">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 80, 120]} fov={50} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={10} 
          maxDistance={500} 
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera going below ground
        />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
        />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Building3D 
            rooms={rooms} 
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
            activeEmployees={indoorEmployees}
            sosAlerts={sosAlerts}
          />
        </Suspense>
      </Canvas>

      {/* Overlays */}
      {selectedRoom && (
        <RoomInfoPanel 
          room={selectedRoom} 
          employees={indoorEmployees.filter(e => e.roomId === selectedRoom._id)} 
          onClose={() => setSelectedRoom(null)} 
        />
      )}

      {sosAlerts.length > 0 && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-red-900/30 animate-pulse z-50">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            EMERGENCY SOS ALERT IN PROGRESS
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalTwinView;
