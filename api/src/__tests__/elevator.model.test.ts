import { Elevator } from "../models/elevator.model";

describe("Elevator Model Tests (OOP Encapsulation & Behavior)", () => {
  let elevator: Elevator;

  beforeEach(() => {
    elevator = new Elevator(0);
  });

  describe("Encapsulation & Initial State", () => {
    it("should initialize at Floor 1 with CLOSED door and IDLE status", () => {
      expect(elevator.id).toBe(0);
      expect(elevator.floor).toBe(1);
      expect(elevator.currentFloor).toBe(1);
      expect(elevator.direction).toBe("IDLE");
      expect(elevator.doorState).toBe("CLOSED");
      expect(elevator.status).toBe("IDLE");
      expect(elevator.targetFloors).toEqual([]);
      expect(elevator.isIdle()).toBe(true);
      expect(elevator.isDoorOpen()).toBe(false);
      expect(elevator.isMoving()).toBe(false);
    });

    it("should return an immutable copy from getState()", () => {
      const state = elevator.getState();
      state.currentFloor = 99; // mutate copied object
      expect(elevator.floor).toBe(1); // original remains intact
    });
  });

  describe("Destination Selection Rule (Once elevator arrives)", () => {
    it("should reject destination selection when door is CLOSED or status is not DOOR_OPEN", () => {
      expect(elevator.canAcceptDestination(5)).toBe(false);
      const success = elevator.addDestination(5);
      expect(success).toBe(false);
      expect(elevator.targetFloors).not.toContain(5);
    });

    it("should accept destination selection when door is OPEN", () => {
      elevator.openDoor();
      expect(elevator.isDoorOpen()).toBe(true);
      expect(elevator.canAcceptDestination(5)).toBe(true);

      const success = elevator.addDestination(5);
      expect(success).toBe(true);
      expect(elevator.targetFloors).toContain(5);
    });

    it("should reject destination if passenger selects current floor", () => {
      elevator.openDoor();
      expect(elevator.canAcceptDestination(1)).toBe(false);
      const success = elevator.addDestination(1);
      expect(success).toBe(false);
    });
  });

  describe("Door Controls", () => {
    it("should hold door open when holdDoor() is called", () => {
      elevator.openDoor();
      elevator.step(); // doorTicksLeft decreases
      const remainingTicks = elevator.doorTicksLeft;

      elevator.holdDoor(5);
      expect(elevator.doorTicksLeft).toBeGreaterThan(remainingTicks);
    });

    it("should close door immediately when closeDoorImmediately() is called", () => {
      elevator.openDoor();
      expect(elevator.isDoorOpen()).toBe(true);

      elevator.closeDoorImmediately();
      expect(elevator.doorState).toBe("CLOSED");
      expect(elevator.doorTicksLeft).toBe(0);
    });
  });

  describe("Simulation Step & Trajectory", () => {
    it("should move up towards target and stop at destination", () => {
      elevator.addRequest(3, "UP");
      expect(elevator.direction).toBe("UP");

      // Tick 1: moves from 1 to 2
      elevator.step();
      expect(elevator.floor).toBe(2);
      expect(elevator.status).toBe("MOVING");

      // Tick 2: reaches floor 3 and opens door
      elevator.step();
      expect(elevator.floor).toBe(3);
      expect(elevator.status).toBe("DOOR_OPEN");
      expect(elevator.doorState).toBe("OPEN");
    });

    it("should not stop for opposite direction hall call until turnaround", () => {
      // Giả sử thang đang đi lên tầng 5
      elevator.addRequest(5, "UP");
      // Khách ở tầng 3 gọi đi XUỐNG
      elevator.addRequest(3, "DOWN");

      // Tick 1: từ 1 lên 2
      elevator.step();
      expect(elevator.floor).toBe(2);

      // Tick 2: từ 2 lên 3 (không dừng vì đang UP và còn tầng 5 phía trước)
      elevator.step();
      expect(elevator.floor).toBe(3);
      expect(elevator.status).toBe("MOVING"); // Không mở cửa ở 3!

      // Tick 3: từ 3 lên 4
      elevator.step();
      expect(elevator.floor).toBe(4);

      // Tick 4: tới tầng 5, mở cửa trả khách
      elevator.step();
      expect(elevator.floor).toBe(5);
      expect(elevator.status).toBe("DOOR_OPEN");
    });
  });
});
