import { Request, Response } from "express";
import { elevatorService } from "../services/elevator.service";

export const getHealth = (_req: Request, res: Response): void => {
  res.json({
    status: "ok",
    elevatorsCount: elevatorService.elevators.length,
    elevators: elevatorService.getElevatorStates(),
  });
};

export const getElevators = (_req: Request, res: Response): void => {
  res.json(elevatorService.getElevatorStates());
};

export const requestElevator = (req: Request, res: Response): void => {
  const { floor, direction } = req.body || {};

  if (typeof floor !== "number" || !direction) {
    res.status(400).json({ error: "Missing or invalid 'floor' or 'direction'" });
    return;
  }

  const elevator = elevatorService.handleRequest(floor, direction);

  res.json({
    success: true,
    assignedElevatorId: elevator?.state.id,
    elevator: elevator?.state,
  });
};
