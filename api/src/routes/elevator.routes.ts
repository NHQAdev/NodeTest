import { Router } from "express";
import {
  closeDoor,
  getElevators,
  getHealth,
  holdDoor,
  requestElevator,
  resetElevators,
  selectDestination,
} from "../controllers/elevator.controller";

const router = Router();

router.get("/", getHealth);
router.get("/elevators", getElevators);
router.post("/request", requestElevator);
router.post("/reset", resetElevators);
router.post("/destination", selectDestination);
router.post("/elevators/:id/open-door", holdDoor);
router.post("/elevators/:id/close-door", closeDoor);

export default router;
