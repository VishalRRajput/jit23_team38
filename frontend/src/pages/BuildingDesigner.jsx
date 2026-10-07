import React, { useEffect, useState } from 'react';
import useBuildingStore from '../context/useBuildingStore';
import api from '../services/api';
import FloorPlanEditor from '../components/BuildingDesigner/FloorPlanEditor';
import RoomProperties from '../components/BuildingDesigner/RoomProperties';
import { Plus, Building, Layers } from 'lucide-react';

const BuildingDesigner = () => {
  const { 
    buildings, currentBuilding, setCurrentBuilding, fetchBuildings,
    floors, currentFloor, setCurrentFloor,
    rooms 
  } = useBuildingStore();

  const [baseRooms, setBaseRooms] = useState([]);

  useEffect(() => {
    if (floors.length > 0) {
      const sortedFloors = [...floors].sort((a, b) => a.level - b.level);
      const baseFloor = sortedFloors[0];
      if (baseFloor) {
        api.get(`/buildings/floors/${baseFloor._id}/rooms`)
          .then(res => {
            if (res.data && res.data.success) setBaseRooms(res.data.data);
          })
          .catch(err => console.error(err));
      }
    }
  }, [floors]);

  const handleCreateBuilding = async () => {
    const name = window.prompt("Enter new building name:");
    if (name) {
      try {
        await api.post('/buildings', { name });
        fetchBuildings();
      } catch (err) { console.error(err); }
    }
  };

  const handleCreateFloor = async () => {
    if (!currentBuilding) return;
    const name = window.prompt("Enter new floor name (e.g., Ground Floor):");
    const levelStr = window.prompt("Enter floor level number (e.g., 0, 1, 2):", "0");
    const level = parseInt(levelStr) || 0;
    
    if (name) {
      try {
        await api.post(`/buildings/${currentBuilding._id}/floors`, { name, level });
        setCurrentBuilding(currentBuilding); // Triggers floor refresh
      } catch (err) { console.error(err); }
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden pt-16">
      {/* Left Sidebar - Building & Floor Selection */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Building size={20} className="text-indigo-400" />
            Designer
          </h1>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {/* Buildings List */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Buildings</h2>
              <button onClick={handleCreateBuilding} className="text-indigo-400 hover:text-indigo-300">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {buildings.map(b => (
                <button
                  key={b._id}
                  onClick={() => setCurrentBuilding(b)}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${currentBuilding?._id === b._id ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {b.name}
                </button>
              ))}
              {buildings.length === 0 && <p className="text-xs text-gray-500 italic">No buildings found.</p>}
            </div>
          </div>

          {/* Floors List */}
          {currentBuilding && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Floors</h2>
                <button onClick={handleCreateFloor} className="text-indigo-400 hover:text-indigo-300">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1">
                {floors.map(f => (
                  <button
                    key={f._id}
                    onClick={() => setCurrentFloor(f)}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${currentFloor?._id === f._id ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <Layers size={14} /> {f.name}
                  </button>
                ))}
                {floors.length === 0 && <p className="text-xs text-gray-500 italic">No floors found.</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-gray-950 p-4">
        {!currentFloor ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Building size={48} className="mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Floor Selected</h2>
            <p>Please select a building and a floor to start designing.</p>
          </div>
        ) : (
          <FloorPlanEditor baseRooms={baseRooms} />
        )}
      </div>

      {/* Right Sidebar - Room Properties */}
      <RoomProperties />
    </div>
  );
};

export default BuildingDesigner;
