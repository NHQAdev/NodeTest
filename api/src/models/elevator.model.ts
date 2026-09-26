import { DOOR_HOLD_TICKS } from "../constants/elevator";
import { ElevatorState } from "../types/elevator.type";

export class Elevator {
  state: ElevatorState;
  doorTicksLeft = 0;

  constructor(id: number) {
    this.state = {
      id,
      currentFloor: 1,
      direction: "IDLE",
      doorState: "CLOSED",
      status: "IDLE",
      targetFloors: [],
    };
  }

  get floor(): number {
    return this.state.currentFloor;
  }

  addRequest(floor: number): void {
    if (this.state.currentFloor === floor && this.state.status === "IDLE") {
      this.openDoor();
      return;
    }

    if (!this.state.targetFloors.includes(floor)) {
      this.state.targetFloors.push(floor);
    }
  }

  openDoor(): void {
    this.state.status = "DOOR_OPEN";
    this.state.doorState = "OPEN";
    this.doorTicksLeft = DOOR_HOLD_TICKS;
  }

  closeDoor(): void {
    this.state.doorState = "CLOSED";
  }

  step(): boolean {
    if (this.state.status === "DOOR_OPEN") {
      if (this.doorTicksLeft > 0) {
        this.doorTicksLeft--;
        return false;
      }

      this.closeDoor();

      if (this.state.targetFloors.length === 0) {
        this.state.status = "IDLE";
        this.state.direction = "IDLE";
        return true;
      }
    }

    if (this.state.targetFloors.length === 0) {
      if (this.state.status !== "IDLE" || this.state.direction !== "IDLE") {
        this.state.status = "IDLE";
        this.state.direction = "IDLE";
        return true;
      }
      return false;
    }

    const { currentFloor } = this.state;

    if (this.state.direction === "IDLE") {
      const nextTarget = this.state.targetFloors[0];
      if (nextTarget > currentFloor) {
        this.state.direction = "UP";
      } else if (nextTarget < currentFloor) {
        this.state.direction = "DOWN";
      } else {
        this.openDoor();
        this.state.targetFloors = this.state.targetFloors.filter((f) => f !== currentFloor);
        return true;
      }
    }

    if (this.state.direction === "UP") {
      const hasHigherTargets = this.state.targetFloors.some((f) => f >= currentFloor);
      if (!hasHigherTargets) {
        this.state.direction = "DOWN";
      }
    } else if (this.state.direction === "DOWN") {
      const hasLowerTargets = this.state.targetFloors.some((f) => f <= currentFloor);
      if (!hasLowerTargets) {
        this.state.direction = "UP";
      }
    }

    if (this.state.direction === "UP") {
      this.state.currentFloor++;
    } else if (this.state.direction === "DOWN") {
      this.state.currentFloor--;
    }
    this.state.status = "MOVING";
    this.state.doorState = "CLOSED";

    if (this.state.targetFloors.includes(this.state.currentFloor)) {
      this.state.targetFloors = this.state.targetFloors.filter((f) => f !== this.state.currentFloor);
      this.openDoor();
    }

    return true;
  }
}