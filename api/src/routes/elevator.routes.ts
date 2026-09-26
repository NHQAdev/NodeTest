import { Router } from "express";
import {
  getElevators,
  getHealth,
  requestElevator,
} from "../controllers/elevator.controller";

const router = Router();

router.get("/", getHealth);
router.get("/elevators", getElevators);
router.post("/request", requestElevator);

export default router;
