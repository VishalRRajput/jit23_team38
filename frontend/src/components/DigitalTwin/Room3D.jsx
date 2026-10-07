import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';

const Room3D = ({ room, isSelected, onClick, employeesInRoom, sosAlert, roomHeight = 30 }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Animate SOS flash or soft glow when occupied
  useFrame((state) => {
    if (meshRef.current) {
      if (sosAlert) {
        const t = state.clock.getElapsedTime();
        meshRef.current.material.opacity = 0.5 + Math.sin(t * 10) * 0.3;
        meshRef.current.material.color.set('#ff0000');
      } else if (employeesInRoom?.length > 0) {
        const t = state.clock.getElapsedTime();
        meshRef.current.material.opacity = 0.6 + Math.sin(t * 3) * 0.1;
        meshRef.current.material.color.set('#10b981'); // Emerald glow
      } else {
        meshRef.current.material.opacity = isSelected ? 0.8 : (hovered ? 0.6 : 0.4);
        meshRef.current.material.color.set(room.color || '#4b5563'); // Default color
      }
    }
  });

  // Calculate 3D center from 2D (top-left x,y and width,height)
  const sX = room.dimensions.width / 2;
  const sZ = room.dimensions.height / 2;
  const pX = (room.dimensions.x / 2) + (sX / 2);
  const pZ = (room.dimensions.y / 2) + (sZ / 2);

  // Note: Vertical offset is now handled by the parent group in Building3D
  return (
    <group position={[pX, roomHeight / 2, pZ]}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(room); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      >
        <boxGeometry args={[sX, roomHeight, sZ]} />
        <meshStandardMaterial transparent opacity={0.4} />
        <Edges scale={1} threshold={15} color={isSelected ? 'white' : 'black'} />
      </mesh>
      
      {/* Room Label */}
      <Html position={[0, roomHeight / 2 + 2, 0]} center distanceFactor={80} className="pointer-events-none">
        <div className={`px-2 py-1 rounded text-lg font-bold text-white shadow-lg backdrop-blur-sm transition-colors ${sosAlert ? 'bg-red-600/80' : 'bg-gray-900/60'}`}>
          {room.name}
        </div>
      </Html>
    </group>
  );
};

export default Room3D;
