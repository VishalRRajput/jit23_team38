import { Building } from '../models/Building.js';
import { Floor } from '../models/Floor.js';
import { Room } from '../models/Room.js';

export const getBuildings = async (req, res, next) => {
  try {
    const buildings = await Building.find();
    res.json({ success: true, count: buildings.length, data: buildings });
  } catch (error) {
    next(error);
  }
};

export const createBuilding = async (req, res, next) => {
  try {
    const building = await Building.create(req.body);
    res.status(201).json({ success: true, data: building });
  } catch (error) {
    next(error);
  }
};

export const deleteBuilding = async (req, res, next) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }
    
    // Cascading deletes
    const floors = await Floor.find({ buildingId: building._id });
    for (const floor of floors) {
      await Room.deleteMany({ floorId: floor._id });
    }
    await Floor.deleteMany({ buildingId: building._id });
    await building.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getFloors = async (req, res, next) => {
  try {
    const floors = await Floor.find({ buildingId: req.params.buildingId });
    res.json({ success: true, count: floors.length, data: floors });
  } catch (error) {
    next(error);
  }
};

export const createFloor = async (req, res, next) => {
  try {
    req.body.buildingId = req.params.buildingId;
    const floor = await Floor.create(req.body);
    res.status(201).json({ success: true, data: floor });
  } catch (error) {
    next(error);
  }
};

export const deleteFloor = async (req, res, next) => {
  try {
    const floor = await Floor.findById(req.params.id);
    if (!floor) {
      return res.status(404).json({ success: false, message: 'Floor not found' });
    }
    await Room.deleteMany({ floorId: floor._id });
    await floor.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ floorId: req.params.floorId });
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    req.body.floorId = req.params.floorId;
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    await room.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
