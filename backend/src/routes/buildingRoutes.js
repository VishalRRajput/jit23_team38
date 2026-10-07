import express from 'express';
import {
  getBuildings,
  createBuilding,
  deleteBuilding,
  getFloors,
  createFloor,
  deleteFloor,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/buildingController.js';

const router = express.Router();

// Building routes
router.route('/')
  .get(getBuildings)
  .post(createBuilding);

router.route('/:id')
  .delete(deleteBuilding);

// Floor routes
router.route('/:buildingId/floors')
  .get(getFloors)
  .post(createFloor);

router.route('/floors/:id')
  .delete(deleteFloor);

// Room routes
router.route('/floors/:floorId/rooms')
  .get(getRooms)
  .post(createRoom);

router.route('/rooms/:id')
  .put(updateRoom)
  .delete(deleteRoom);

export default router;
