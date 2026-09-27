import { ElevatorService } from "../services/elevator.service";

describe("ElevatorService Dispatcher & Algorithm Tests", () => {
  let service: ElevatorService;

  beforeEach(() => {
    service = new ElevatorService();
  });

  afterEach(() => {
    service.stopSimulation();
  });

  it("should initialize with 3 elevators all at Floor 1", () => {
    const states = service.getElevatorStates();
    expect(states.length).toBe(3);
    for (const state of states) {
      expect(state.currentFloor).toBe(1);
      expect(state.status).toBe("IDLE");
      expect(state.doorState).toBe("CLOSED");
    }
  });

  it("should dispatch an idle elevator to a hall request", () => {
    const assigned = service.handleRequest(5, "UP");
    expect(assigned).not.toBeNull();
    expect(assigned?.targetFloors).toContain(5);
  });

  it("CRITICAL: When an elevator is moving from 1 to 10, a DOWN request at floor 4 must be assigned to an IDLE elevator, NOT the busy elevator", () => {
    // 1. Gán Thang #0 đi lên tầng 10
    const el0 = service.handleRequest(10, "UP");
    expect(el0?.id).toBe(0);
    expect(el0?.direction).toBe("UP");

    // 2. Khách ở tầng 4 bấm XUỐNG
    const assignedForFloor4 = service.handleRequest(4, "DOWN");

    // 3. Hệ thống PHẢI chọn 1 trong 2 thang đang rảnh (Thang 1 hoặc Thang 2)
    // KHÔNG ĐƯỢC gán cho Thang 0 vì Thang 0 đang chạy lên 10
    expect(assignedForFloor4).not.toBeNull();
    expect(assignedForFloor4?.id).not.toBe(0);
    expect([1, 2]).toContain(assignedForFloor4?.id);
    expect(assignedForFloor4?.targetFloors).toContain(4);
  });

  it("should reject destination selection if elevator is not at floor with door open", () => {
    // Thang đang đóng cửa ở tầng 1
    const result = service.handleDestination(0, 7);
    expect(result.success).toBe(false);
    expect(result.message).toContain("Destination can only be selected once the elevator arrives and opens its doors");
  });

  it("should accept destination selection once elevator arrives and opens its doors", () => {
    const el0 = service.elevators[0];
    el0.openDoor(); // Mô phỏng thang đã đến và mở cửa

    const result = service.handleDestination(0, 7);
    expect(result.success).toBe(true);
    expect(el0.targetFloors).toContain(7);
  });

  it("should reset all elevators back to Floor 1", () => {
    service.elevators[0].addRequest(8, "UP");
    service.elevators[1].addRequest(4, "UP");

    service.resetAll();

    const states = service.getElevatorStates();
    for (const state of states) {
      expect(state.currentFloor).toBe(1);
      expect(state.status).toBe("IDLE");
      expect(state.targetFloors).toEqual([]);
    }
  });
});
