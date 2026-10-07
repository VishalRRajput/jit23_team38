import React, { useState, useRef } from 'react';
import useBuildingStore from '../../context/useBuildingStore';
import { MousePointer2, Move } from 'lucide-react';

const FloorPlanEditor = ({ baseRooms = [] }) => {
  const { currentFloor, rooms, addRoom, updateRoom, setSelectedRoom, selectedRoom } = useBuildingStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState(null);
  const [dragMode, setDragMode] = useState(false);
  const [draggingRoom, setDraggingRoom] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);

  const getCanvasCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    if (!currentFloor) return;
    const { x, y } = getCanvasCoords(e);
    
    const clickedRoom = rooms.find(
      r => x >= r.dimensions.x && x <= r.dimensions.x + r.dimensions.width &&
           y >= r.dimensions.y && y <= r.dimensions.y + r.dimensions.height
    );

    if (dragMode) {
      if (clickedRoom) {
        setDraggingRoom({ ...clickedRoom });
        setDragOffset({
          x: x - clickedRoom.dimensions.x,
          y: y - clickedRoom.dimensions.y
        });
        setSelectedRoom(clickedRoom);
      }
      return;
    }

    if (clickedRoom) {
      setSelectedRoom(clickedRoom);
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
    setSelectedRoom(null);
  };

  const handleMouseMove = (e) => {
    if (dragMode && draggingRoom) {
      const { x, y } = getCanvasCoords(e);
      setDraggingRoom(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          x: Math.max(0, x - dragOffset.x),
          y: Math.max(0, y - dragOffset.y)
        }
      }));
      return;
    }

    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    setCurrentRect({
      x: Math.min(x, startPos.x),
      y: Math.min(y, startPos.y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y)
    });
  };

  const handleMouseUp = () => {
    if (dragMode && draggingRoom) {
      updateRoom(draggingRoom._id, { dimensions: draggingRoom.dimensions });
      setDraggingRoom(null);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentRect && currentRect.width > 20 && currentRect.height > 20) {
      addRoom({
        name: 'New Room',
        dimensions: currentRect,
        type: 'Room'
      });
    }
    setCurrentRect(null);
  };

  return (
    <div className="flex-1 bg-gray-900 overflow-hidden flex flex-col relative rounded-lg border border-gray-700">
      <div className="absolute top-4 left-4 flex gap-2 z-10 bg-gray-800 p-2 rounded shadow-lg border border-gray-600">
        <button 
          onClick={() => setDragMode(false)}
          className={`p-2 rounded ${!dragMode ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          title="Draw Room"
        >
          <MousePointer2 size={20} />
        </button>
        <button 
          onClick={() => setDragMode(true)}
          className={`p-2 rounded ${dragMode ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          title="Move Room"
        >
          <Move size={20} />
        </button>
      </div>
      
      <div 
        ref={canvasRef}
        className="flex-1 w-full h-full cursor-crosshair relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Ghost Base Rooms (Ground Floor Blueprint) */}
        {currentFloor && currentFloor.level > 0 && baseRooms.map(room => (
          <div
            key={`base-${room._id}`}
            className="absolute border-2 border-dashed border-gray-600/40 bg-gray-800/20 pointer-events-none"
            style={{
              left: room.dimensions.x,
              top: room.dimensions.y,
              width: room.dimensions.width,
              height: room.dimensions.height,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-30 text-gray-400 font-mono text-[10px]">
              Base: {room.name}
            </div>
          </div>
        ))}

        {/* Draw Current Floor Rooms */}
        {rooms.map(room => {
          const isDraggingThis = draggingRoom && draggingRoom._id === room._id;
          const renderRoom = isDraggingThis ? draggingRoom : room;
          
          return (
            <div
              key={room._id}
              onClick={(e) => {
                if (dragMode) return;
                e.stopPropagation();
                setSelectedRoom(room);
              }}
              className={`absolute flex items-center justify-center transition-shadow ${dragMode ? 'cursor-move' : 'cursor-pointer'} ${selectedRoom?._id === room._id ? 'border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-20' : 'border border-gray-600 z-10 hover:border-gray-400'}`}
              style={{
                left: renderRoom.dimensions.x,
                top: renderRoom.dimensions.y,
                width: renderRoom.dimensions.width,
                height: renderRoom.dimensions.height,
                backgroundColor: renderRoom.color || '#4B5563', // fallback color
                opacity: isDraggingThis ? 0.6 : 0.8
              }}
            >
              <span className="text-white text-xs font-semibold select-none break-words text-center p-1 drop-shadow-md">
                {renderRoom.name}
              </span>
            </div>
          );
        })}

        {currentRect && (
          <div 
            className="absolute border-2 border-dashed border-indigo-400 bg-indigo-500/20 z-30 pointer-events-none"
            style={{
              left: currentRect.x,
              top: currentRect.y,
              width: currentRect.width,
              height: currentRect.height
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FloorPlanEditor;
