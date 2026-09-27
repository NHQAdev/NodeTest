import { Direction } from "../types/elevator.type";

export abstract class ElevatorRequest {
  constructor(public readonly floor: number) { }

  abstract shouldStop(
    currentFloor: number,
    currentDirection: Direction,
    hasTargetsAhead: boolean
  ): boolean;

  abstract getDirection(): Direction;
}

export class UpHallRequest extends ElevatorRequest {
  getDirection(): Direction {
    return "UP";
  }

  shouldStop(
    currentFloor: number,
    currentDirection: Direction,
    hasTargetsAhead: boolean
  ): boolean {
    if (this.floor !== currentFloor) return false;

    if (currentDirection === "UP") {
      return true;
    }
    return !hasTargetsAhead;
  }
}

export class DownHallRequest extends ElevatorRequest {
  getDirection(): Direction {
    return "DOWN";
  }

  shouldStop(
    currentFloor: number,
    currentDirection: Direction,
    hasTargetsAhead: boolean
  ): boolean {
    if (this.floor !== currentFloor) return false;

    if (currentDirection === "DOWN") {
      return true;
    }
    return !hasTargetsAhead;
  }
}

export class DestinationRequest extends ElevatorRequest {
  getDirection(): Direction {
    return "IDLE";
  }

  shouldStop(currentFloor: number): boolean {
    return this.floor === currentFloor;
  }
}
