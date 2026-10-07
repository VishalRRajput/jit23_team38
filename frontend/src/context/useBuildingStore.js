import { create } from 'zustand';
import api from '../services/api';

const useBuildingStore = create((set, get) => ({
  buildings: [],
  currentBuilding: null,
  floors: [],
  currentFloor: null,
  rooms: [],
  selectedRoom: null,

  // Load initial data
  fetchBuildings: async () => {
    try {
      const { data } = await api.get('/buildings');
      set({ buildings: data.data || [] });
      if (data.data?.length > 0 && !get().currentBuilding) {
        get().setCurrentBuilding(data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch buildings', error);
    }
  },

  setCurrentBuilding: async (building) => {
    set({ currentBuilding: building, floors: [], currentFloor: null, rooms: [], selectedRoom: null });
    if (building) {
      await get().fetchFloors(building._id);
    }
  },

  fetchFloors: async (buildingId) => {
    try {
      const { data } = await api.get(`/buildings/${buildingId}/floors`);
      set({ floors: data.data || [] });
      if (data.data?.length > 0) {
        get().setCurrentFloor(data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch floors', error);
    }
  },

  setCurrentFloor: async (floor) => {
    set({ currentFloor: floor, rooms: [], selectedRoom: null });
    if (floor) {
      await get().fetchRooms(floor._id);
    }
  },

  fetchRooms: async (floorId) => {
    try {
      const { data } = await api.get(`/buildings/floors/${floorId}/rooms`);
      set({ rooms: data.data || [] });
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  },

  setSelectedRoom: (room) => set({ selectedRoom: room }),

  addRoom: async (roomData) => {
    const floorId = get().currentFloor?._id;
    if (!floorId) return;
    try {
      const { data } = await api.post(`/buildings/floors/${floorId}/rooms`, roomData);
      set((state) => ({ rooms: [...state.rooms, data.data] }));
    } catch (error) {
      console.error('Failed to add room', error);
    }
  },

  updateRoom: async (id, roomData) => {
    try {
      const { data } = await api.put(`/buildings/rooms/${id}`, roomData);
      set((state) => ({
        rooms: state.rooms.map((r) => (r._id === id ? data.data : r)),
        selectedRoom: state.selectedRoom?._id === id ? data.data : state.selectedRoom
      }));
    } catch (error) {
      console.error('Failed to update room', error);
    }
  },

  deleteRoom: async (id) => {
    try {
      await api.delete(`/buildings/rooms/${id}`);
      set((state) => ({
        rooms: state.rooms.filter((r) => r._id !== id),
        selectedRoom: state.selectedRoom?._id === id ? null : state.selectedRoom
      }));
    } catch (error) {
      console.error('Failed to delete room', error);
    }
  }
}));

export default useBuildingStore;
