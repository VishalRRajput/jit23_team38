import React from 'react';
import Room3D from './Room3D';
import EmployeeIndicator3D from './EmployeeIndicator3D';

const Building3D = ({ rooms, selectedRoom, onSelectRoom, activeEmployees, sosAlerts }) => {
  if (rooms.length === 0) return null;

  // 1. Group rooms by floorLevel
  const floors = {};
  rooms.forEach(room => {
    const lvl = room.floorLevel || 0;
    if (!floors[lvl]) floors[lvl] = [];
    floors[lvl].push(room);
  });

  // 2. Find base level (Ground floor)
  const floorLevels = Object.keys(floors).map(Number).sort((a, b) => a - b);
  const baseLevel = floorLevels[0];
  const baseRooms = floors[baseLevel];

  // 3. Compute Base Bounding Box (Ground Floor)
  const minXBase = Math.min(...baseRooms.map(r => r.dimensions.x));
  const minYBase = Math.min(...baseRooms.map(r => r.dimensions.y));
  const maxXBase = Math.max(...baseRooms.map(r => r.dimensions.x + r.dimensions.width));
  const maxYBase = Math.max(...baseRooms.map(r => r.dimensions.y + r.dimensions.height));

  const baseCenterX = (minXBase + maxXBase) / 2;
  const baseCenterY = (minYBase + maxYBase) / 2;
  const baseWidth = (maxXBase - minXBase) / 2 + 4;
  const baseDepth = (maxYBase - minYBase) / 2 + 4;

  // We make walls a bit taller (bigger rooms)
  const roomHeight = 30; 

  return (
    <group>
      {/* Grid Helper below everything */}
      <gridHelper 
        args={[baseWidth * 2, baseWidth * 2, 0x444444, 0x222222]} 
        position={[baseCenterX / 2, -0.09, baseCenterY / 2]} 
      />

      {floorLevels.map(level => {
        const levelRooms = floors[level];
        
        // Compute this floor's bounding box
        const minX = Math.min(...levelRooms.map(r => r.dimensions.x));
        const minY = Math.min(...levelRooms.map(r => r.dimensions.y));
        const maxX = Math.max(...levelRooms.map(r => r.dimensions.x + r.dimensions.width));
        const maxY = Math.max(...levelRooms.map(r => r.dimensions.y + r.dimensions.height));

        const thisCenterX = (minX + maxX) / 2;
        const thisCenterY = (minY + maxY) / 2;

        // Calculate offset to align this floor's center to the Ground floor's center
        const offsetX = (baseCenterX - thisCenterX) / 2;
        const offsetZ = (baseCenterY - thisCenterY) / 2;

        // Calculate vertical stacking position
        const floorHeightOffset = (level - baseLevel) * (roomHeight + 1); // 1 unit gap between floors

        return (
          <group key={level} position={[offsetX, floorHeightOffset, offsetZ]}>
            
            {/* Floor Slab for this Level (Using Base dimensions so building edges align perfectly) */}
            <mesh 
              position={[thisCenterX / 2, -0.1, thisCenterY / 2]} 
              rotation={[-Math.PI / 2, 0, 0]} 
              receiveShadow
            >
              <planeGeometry args={[baseWidth, baseDepth]} />
              <meshStandardMaterial color="#1f2937" metalness={0.2} roughness={0.8} />
            </mesh>

            {/* Rooms on this level */}
            {levelRooms.map(room => {
              const employeesInRoom = activeEmployees.filter(emp => emp.roomId === room._id);
              const hasSOS = sosAlerts.includes(room._id);
              
              return (
                <Room3D
                  key={room._id}
                  room={room}
                  isSelected={selectedRoom?._id === room._id}
                  onClick={onSelectRoom}
                  employeesInRoom={employeesInRoom}
                  sosAlert={hasSOS}
                  roomHeight={roomHeight}
                />
              );
            })}

            {/* Employees on this level */}
            {activeEmployees.map(emp => {
              const room = levelRooms.find(r => r._id === emp.roomId);
              if (!room) return null; // Employee not on this floor
              return (
                <EmployeeIndicator3D 
                  key={emp.employeeId} 
                  employee={emp} 
                  room={room} 
                />
              );
            })}

          </group>
        );
      })}
    </group>
  );
};

export default Building3D;
