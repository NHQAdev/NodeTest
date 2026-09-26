import { EventEmitter } from "events";
import { SIMULATION_INTERVAL_MS, STOP_PENALTY, TOTAL_ELEVATORS } from "../constants/elevator";
import { Elevator } from "../models/elevator.model";
import { Direction, ElevatorState } from "../types/elevator.type";

export class ElevatorService extends EventEmitter {
  public elevators: Elevator[];
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.elevators = Array.from({ length: TOTAL_ELEVATORS }, (_, i) => new Elevator(i));
  }

  getElevatorStates(): ElevatorState[] {
    return this.elevators.map((e) => ({ ...e.state }));
  }

  startSimulation(intervalMs = SIMULATION_INTERVAL_MS): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      let changed = false;

      for (const elevator of this.elevators) {
        if (elevator.step()) {
          changed = true;
        }
      }

      if (changed) {
        this.emit("update", this.getElevatorStates());
      }
    }, intervalMs);
  }

  stopSimulation(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  handleRequest(floor: number, direction: Direction): Elevator | null {
    const elevator = this.selectElevator(floor, direction);
    if (!elevator) return null;

    elevator.addRequest(floor);
    this.emit("update", this.getElevatorStates());
    return elevator;
  }

  selectElevator(floor: number, direction: Direction): Elevator | null {
    let bestElevator: Elevator | null = null;
    let lowestScore = Infinity;

    for (const elevator of this.elevators) {
      const score = this.calculateScore(floor, elevator, direction);
      if (score < lowestScore) {
        lowestScore = score;
        bestElevator = elevator;
      }
    }

    return bestElevator;
  }

  calculateScore(floor: number, elevator: Elevator, direction: Direction): number {
    const currentFloor = elevator.floor;
    const elevatorDirection = elevator.state.direction;
    const { targetFloors } = elevator.state;

    // 1. Thang đang rảnh (IDLE)
    if (elevator.state.status === "IDLE" || elevatorDirection === "IDLE") {
      return Math.abs(currentFloor - floor);
    }

    // 2. Thang đang di chuyển cùng hướng với khách gọi
    if (elevatorDirection === direction) {
      const isOnTheWay =
        (direction === "UP" && currentFloor <= floor) ||
        (direction === "DOWN" && currentFloor >= floor);

      if (isOnTheWay) {
        const stopsAhead = targetFloors.filter((target) =>
          direction === "UP"
            ? target > currentFloor && target < floor
            : target < currentFloor && target > floor
        );

        return Math.abs(currentFloor - floor) + stopsAhead.length * STOP_PENALTY;
      }

      // Cùng hướng nhưng đã đi qua tầng yêu cầu: đi hết hành trình rồi quay lại
      const furthest = targetFloors.length > 0
        ? (direction === "UP" ? Math.max(...targetFloors, currentFloor) : Math.min(...targetFloors, currentFloor))
        : currentFloor;

      const toFurthest = Math.abs(currentFloor - furthest);
      const toTarget = Math.abs(furthest - floor);
      return toFurthest + toTarget + targetFloors.length * STOP_PENALTY;
    }

    // 3. Thang đang di chuyển ngược hướng
    const furthest = targetFloors.length > 0
      ? (elevatorDirection === "UP" ? Math.max(...targetFloors, currentFloor) : Math.min(...targetFloors, currentFloor))
      : currentFloor;

    const toFurthest = Math.abs(currentFloor - furthest);
    const toTarget = Math.abs(furthest - floor);
    return toFurthest + toTarget + targetFloors.length * STOP_PENALTY;
  }
}

export const elevatorService = new ElevatorService();