import { DOOR_HOLD_TICKS } from "../constants/elevator";
import { Direction, DoorState, ElevatorState, ElevatorStatus } from "../types/elevator.type";
import {
  DestinationRequest,
  DownHallRequest,
  ElevatorRequest,
  UpHallRequest,
} from "./request.model";

export class Elevator {
  // --- Encapsulation: Tất cả thuộc tính nội tại được đặt private ---
  private _state: ElevatorState;
  private _doorTicksLeft = 0;
  private _requests: ElevatorRequest[] = [];

  constructor(id: number) {
    this._state = {
      id,
      currentFloor: 1,
      direction: "IDLE",
      doorState: "CLOSED",
      status: "IDLE",
      targetFloors: [],
    };
  }

  // --- Getters công khai để đọc dữ liệu an toàn ---
  get id(): number {
    return this._state.id;
  }

  get floor(): number {
    return this._state.currentFloor;
  }

  get currentFloor(): number {
    return this._state.currentFloor;
  }

  get direction(): Direction {
    return this._state.direction;
  }

  get doorState(): DoorState {
    return this._state.doorState;
  }

  get status(): ElevatorStatus {
    return this._state.status;
  }

  get targetFloors(): number[] {
    return [...this._state.targetFloors];
  }

  get requests(): readonly ElevatorRequest[] {
    return [...this._requests];
  }

  get doorTicksLeft(): number {
    return this._doorTicksLeft;
  }

  /**
   * Trả về bản sao trạng thái của thang máy (tránh mutation từ bên ngoài)
   */
  getState(): ElevatorState {
    return {
      ...this._state,
      targetFloors: [...this._state.targetFloors],
    };
  }

  get state(): Readonly<ElevatorState> {
    return this.getState();
  }

  isIdle(): boolean {
    return this._state.status === "IDLE";
  }

  isDoorOpen(): boolean {
    return this._state.doorState === "OPEN";
  }

  isMoving(): boolean {
    return this._state.status === "MOVING";
  }

  private syncTargetFloors(): void {
    const uniqueFloors = Array.from(new Set(this._requests.map((r) => r.floor)));
    this._state.targetFloors = uniqueFloors.sort((a, b) => a - b);
  }

  addRequest(floor: number, direction?: Direction): void {
    if (this._state.currentFloor === floor && this._state.status === "IDLE") {
      this.openDoor();
      return;
    }

    if (this._state.currentFloor === floor && this._state.status === "DOOR_OPEN") {
      this.openDoor();
      return;
    }

    const alreadyExists = this._requests.some((r) => {
      if (r.floor !== floor) return false;
      if (!direction || direction === "IDLE") return r instanceof DestinationRequest;
      if (direction === "UP") return r instanceof UpHallRequest;
      if (direction === "DOWN") return r instanceof DownHallRequest;
      return false;
    });

    if (!alreadyExists) {
      if (direction === "UP") {
        this._requests.push(new UpHallRequest(floor));
      } else if (direction === "DOWN") {
        this._requests.push(new DownHallRequest(floor));
      } else {
        this._requests.push(new DestinationRequest(floor));
      }
      this.syncTargetFloors();
    }
  }

  canAcceptDestination(floor?: number): boolean {
    const isDoorOpen = this._state.status === "DOOR_OPEN" && this._state.doorState === "OPEN";
    if (!isDoorOpen) return false;
    if (floor !== undefined && floor === this._state.currentFloor) return false;
    return true;
  }

  addDestination(floor: number): boolean {
    if (!this.canAcceptDestination(floor)) {
      return false;
    }
    this.addRequest(floor, "IDLE");
    return true;
  }

  openDoor(): void {
    this._state.status = "DOOR_OPEN";
    this._state.doorState = "OPEN";
    this._doorTicksLeft = DOOR_HOLD_TICKS;
  }

  closeDoor(): void {
    this._state.doorState = "CLOSED";
  }

  holdDoor(ticks: number = DOOR_HOLD_TICKS): void {
    if (this._state.status === "DOOR_OPEN") {
      this._doorTicksLeft = Math.max(this._doorTicksLeft, ticks);
    }
  }

  closeDoorImmediately(): void {
    if (this._state.status === "DOOR_OPEN") {
      this._doorTicksLeft = 0;
      this.closeDoor();
    }
  }

  reset(): void {
    this._state.currentFloor = 1;
    this._state.direction = "IDLE";
    this._state.doorState = "CLOSED";
    this._state.status = "IDLE";
    this._state.targetFloors = [];
    this._doorTicksLeft = 0;
    this._requests = [];
  }

  step(): boolean {
    if (this._state.status === "DOOR_OPEN") {
      if (this._doorTicksLeft > 0) {
        this._doorTicksLeft--;
        return false;
      }

      this.closeDoor();

      if (this._requests.length === 0) {
        this._state.status = "IDLE";
        this._state.direction = "IDLE";
        return true;
      }
    }

    if (this._requests.length === 0) {
      if (this._state.status !== "IDLE" || this._state.direction !== "IDLE") {
        this._state.status = "IDLE";
        this._state.direction = "IDLE";
        return true;
      }
      return false;
    }

    const currentFloor = this._state.currentFloor;

    if (this._state.direction === "IDLE") {
      const firstTarget = this._requests[0].floor;
      if (firstTarget > currentFloor) {
        this._state.direction = "UP";
      } else if (firstTarget < currentFloor) {
        this._state.direction = "DOWN";
      } else {
        const served = this._requests.filter((r) => r.floor === currentFloor);
        this._requests = this._requests.filter((r) => !served.includes(r));
        this.syncTargetFloors();
        this.openDoor();
        return true;
      }
    }

    if (this._state.direction === "UP") {
      const hasTargetsAbove = this._requests.some((r) => r.floor >= currentFloor);
      if (!hasTargetsAbove) {
        this._state.direction = "DOWN";
      }
    } else if (this._state.direction === "DOWN") {
      const hasTargetsBelow = this._requests.some((r) => r.floor <= currentFloor);
      if (!hasTargetsBelow) {
        this._state.direction = "UP";
      }
    }

    if (this._state.direction === "UP") {
      this._state.currentFloor++;
    } else if (this._state.direction === "DOWN") {
      this._state.currentFloor--;
    }
    this._state.status = "MOVING";
    this._state.doorState = "CLOSED";

    const newFloor = this._state.currentFloor;
    const hasTargetsAhead =
      this._state.direction === "UP"
        ? this._requests.some((r) => r.floor > newFloor)
        : this._requests.some((r) => r.floor < newFloor);

    const toServe = this._requests.filter((r) =>
      r.shouldStop(newFloor, this._state.direction, hasTargetsAhead)
    );

    if (toServe.length > 0) {
      this._requests = this._requests.filter((r) => !toServe.includes(r));
      this.syncTargetFloors();
      this.openDoor();

      const hasFurtherTargetsInDirection =
        this._state.direction === "UP"
          ? this._requests.some((r) => r.floor > newFloor)
          : this._requests.some((r) => r.floor < newFloor);

      if (!hasFurtherTargetsInDirection && this._requests.length > 0) {
        this._state.direction = this._state.direction === "UP" ? "DOWN" : "UP";
      } else if (this._requests.length === 0) {
        this._state.direction = "IDLE";
      }
    }

    return true;
  }
}