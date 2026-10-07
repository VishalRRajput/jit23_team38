import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const EmployeeIndicator3D = ({ employee, room }) => {
  const meshRef = useRef();

  // Floating animation
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      const floorHeightOffset = (room?.floorLevel || 0) * 31; // roomHeight(30) + gap(1)
      // Center it inside the room block (y = 15) instead of above it (y = 32)
      meshRef.current.position.y = 15 + floorHeightOffset + Math.sin(t * 3 + employee.employeeId.charCodeAt(0)) * 0.5;
      meshRef.current.rotation.y += 0.02;
    }
  });

  if (!room) return null;

  // Position indicator at center of room
  const sX = room.dimensions.width / 2;
  const sZ = room.dimensions.height / 2;
  const pX = (room.dimensions.x / 2) + (sX / 2);
  const pZ = (room.dimensions.y / 2) + (sZ / 2);

  // Add small random offset so multiple employees don't overlap perfectly
  const hash = employee.employeeId.charCodeAt(employee.employeeId.length - 1);
  const offsetX = (hash % 10) * 0.5 - 2.5;
  const offsetZ = ((hash * 7) % 10) * 0.5 - 2.5;
  const floorHeightOffset = (room.floorLevel || 0) * 31;

  return (
    <group position={[pX + offsetX, 15 + floorHeightOffset, pZ + offsetZ]} ref={meshRef}>
      <mesh>
        <coneGeometry args={[2.5, 5.0, 16]} />
        <meshStandardMaterial color="#3b82f6" />
        <mesh position={[0, -2.5, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[2.5, 5.0, 16]} />
          <meshStandardMaterial color="#60a5fa" opacity={0.5} transparent />
        </mesh>
      </mesh>
      <Html position={[0, 5, 0]} center distanceFactor={140} className="pointer-events-none z-10">
        <div className="flex flex-col items-center bg-gray-900/80 px-3 py-2 rounded shadow-xl backdrop-blur border border-blue-500/30">
          <img src={employee.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-blue-400 mb-1" />
          <span className="text-sm font-bold text-white whitespace-nowrap">{employee.name}</span>
          <span className="text-xs text-blue-300">{employee.employeeId}</span>
        </div>
      </Html>
    </group>
  );
};

export default EmployeeIndicator3D;
