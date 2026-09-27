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
    assignedElevatorId: elevator?.id,
    elevator: elevator?.getState(),
  });
};

export const resetElevators = (_req: Request, res: Response): void => {
  elevatorService.resetAll();
  res.json({
    success: true,
    message: "All elevators have been reset to Floor 1",
    elevators: elevatorService.getElevatorStates(),
  });
};

export const selectDestination = (req: Request, res: Response): void => {
  const { elevatorId, floor } = req.body || {};

  if (typeof elevatorId !== "number" || typeof floor !== "number") {
    res.status(400).json({ error: "Missing or invalid 'elevatorId' or 'floor'" });
    return;
  }

  const result = elevatorService.handleDestination(elevatorId, floor);
  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.message,
    });
    return;
  }

  res.json(result);
};

export const holdDoor = (req: Request, res: Response): void => {
  const elevatorId = Number(req.params.id);
  const success = elevatorService.holdDoor(elevatorId);
  res.json({ success });
};

export const closeDoor = (req: Request, res: Response): void => {
  const elevatorId = Number(req.params.id);
  const success = elevatorService.closeDoorImmediately(elevatorId);
  res.json({ success });
};
