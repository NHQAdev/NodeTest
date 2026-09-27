import { EventEmitter } from "events";
import {
  REVERSE_DIRECTION_PENALTY,
  SIMULATION_INTERVAL_MS,
  STOP_PENALTY,
  TOTAL_ELEVATORS,
  TOTAL_FLOORS,
} from "../constants/elevator";
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
    return this.elevators.map((e) => e.getState());
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

  resetAll(): void {
    for (const elevator of this.elevators) {
      elevator.reset();
    }
    this.emit("update", this.getElevatorStates());
  }

  handleRequest(floor: number, direction: Direction): Elevator | null {
    const elevator = this.selectElevator(floor, direction);
    if (!elevator) return null;

    elevator.addRequest(floor, direction);
    this.emit("update", this.getElevatorStates());
    return elevator;
  }

  handleDestination(
    elevatorId: number,
    floor: number
  ): { success: boolean; message?: string } {
    const elevator = this.elevators.find((e) => e.id === elevatorId);
    if (!elevator) {
      return { success: false, message: `Elevator with ID ${elevatorId} not found` };
    }

    if (floor < 1 || floor > TOTAL_FLOORS) {
      return { success: false, message: `Floor ${floor} is out of bounds (1 - ${TOTAL_FLOORS})` };
    }

    // Kiểm tra điều kiện: Thang máy phải đến nơi và đang mở cửa (DOOR_OPEN)
    if (!elevator.canAcceptDestination(floor)) {
      if (!elevator.isDoorOpen()) {
        return {
          success: false,
          message: `Cannot select destination. Elevator ${elevatorId} is currently ${elevator.status} at Floor ${elevator.floor}. Destination can only be selected once the elevator arrives and opens its doors.`,
        };
      }

      if (elevator.floor === floor) {
        return {
          success: false,
          message: `Elevator is already at Floor ${floor}. Please choose a different floor.`,
        };
      }

      return {
        success: false,
        message: `Cannot select Floor ${floor} at this time.`,
      };
    }

    const added = elevator.addDestination(floor);
    if (!added) {
      return { success: false, message: `Failed to add destination floor ${floor}` };
    }

    this.emit("update", this.getElevatorStates());
    return { success: true };
  }

  holdDoor(elevatorId: number): boolean {
    const elevator = this.elevators.find((e) => e.id === elevatorId);
    if (!elevator) return false;

    elevator.holdDoor();
    this.emit("update", this.getElevatorStates());
    return true;
  }

  closeDoorImmediately(elevatorId: number): boolean {
    const elevator = this.elevators.find((e) => e.id === elevatorId);
    if (!elevator) return false;

    elevator.closeDoorImmediately();
    this.emit("update", this.getElevatorStates());
    return true;
  }

  selectElevator(floor: number, direction: Direction): Elevator | null {
    let bestElevator: Elevator | null = null;
    let lowestScore = Infinity;

    for (const elevator of this.elevators) {
      const score = this.calculateScore(floor, elevator, direction);

      if (score < lowestScore) {
        lowestScore = score;
        bestElevator = elevator;
      } else if (score === lowestScore && bestElevator) {
        // Tie-breaking: Khi 2 thang có cùng điểm (ví dụ cùng ở tầng 1):
        // Ưu tiên thang có ít việc hơn (ít targetFloors hơn) để chia đều tải
        if (elevator.targetFloors.length < bestElevator.targetFloors.length) {
          bestElevator = elevator;
        }
      }
    }

    return bestElevator;
  }

  calculateScore(floor: number, elevator: Elevator, direction: Direction): number {
    const currentFloor = elevator.floor;
    const targetFloors = elevator.targetFloors;

    // 1. Thang hoàn toàn rảnh rỗi (không có bất kỳ tầng đích nào)
    const isTrulyIdle = targetFloors.length === 0 && (elevator.isIdle() || elevator.direction === "IDLE");
    if (isTrulyIdle) {
      return Math.abs(currentFloor - floor);
    }

    // Xác định hướng di chuyển thực tế của thang:
    // Nếu thang chưa kịp đổi direction từ IDLE nhưng đã nhận lệnh (targetFloors):
    const effectiveDirection: Direction =
      elevator.direction !== "IDLE"
        ? elevator.direction
        : targetFloors.length > 0
        ? targetFloors[0] > currentFloor
          ? "UP"
          : targetFloors[0] < currentFloor
          ? "DOWN"
          : "IDLE"
        : "IDLE";

    // 2. Thang đang di chuyển CÙNG HƯỚNG với khách gọi
    if (effectiveDirection === direction) {
      const isOnTheWay =
        (direction === "UP" && currentFloor <= floor) ||
        (direction === "DOWN" && currentFloor >= floor);

      if (isOnTheWay) {
        // Tầng đón nằm ngay trên lộ trình di chuyển: gom khách tối ưu nhất
        const stopsAhead = targetFloors.filter((target) =>
          direction === "UP"
            ? target > currentFloor && target < floor
            : target < currentFloor && target > floor
        );

        return Math.abs(currentFloor - floor) + stopsAhead.length * STOP_PENALTY;
      }

      // Cùng hướng nhưng đã đi qua tầng yêu cầu: phải đi hết hành trình rồi quay đầu
      const furthest =
        effectiveDirection === "UP"
          ? Math.max(...targetFloors, currentFloor)
          : Math.min(...targetFloors, currentFloor);

      const toFurthest = Math.abs(currentFloor - furthest);
      const toTarget = Math.abs(furthest - floor);
      return toFurthest + toTarget + targetFloors.length * STOP_PENALTY + REVERSE_DIRECTION_PENALTY;
    }

    // 3. Thang đang di chuyển NGƯỢC HƯỚNG với khách gọi (ví dụ đang lên 10 mà khách ở tầng 4 gọi xuống)
    // Thang này phải chịu điểm phạt nặng (REVERSE_DIRECTION_PENALTY) để nhường quyền ưu tiên cho thang đang rảnh
    const furthest =
      effectiveDirection === "UP"
        ? Math.max(...targetFloors, currentFloor)
        : Math.min(...targetFloors, currentFloor);

    const toFurthest = Math.abs(currentFloor - furthest);
    const toTarget = Math.abs(furthest - floor);
    return toFurthest + toTarget + targetFloors.length * STOP_PENALTY + REVERSE_DIRECTION_PENALTY;
  }
}

export const elevatorService = new ElevatorService();