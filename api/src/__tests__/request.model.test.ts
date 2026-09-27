import {
  DestinationRequest,
  DownHallRequest,
  UpHallRequest,
} from "../models/request.model";

describe("ElevatorRequest Polymorphism Tests", () => {
  describe("UpHallRequest", () => {
    it("should return direction 'UP'", () => {
      const req = new UpHallRequest(5);
      expect(req.getDirection()).toBe("UP");
      expect(req.floor).toBe(5);
    });

    it("should stop if elevator is moving UP at the same floor", () => {
      const req = new UpHallRequest(5);
      expect(req.shouldStop(5, "UP", true)).toBe(true);
      expect(req.shouldStop(5, "UP", false)).toBe(true);
    });

    it("should NOT stop if floor does not match", () => {
      const req = new UpHallRequest(5);
      expect(req.shouldStop(4, "UP", true)).toBe(false);
    });

    it("should NOT stop on the way DOWN if elevator still has targets ahead", () => {
      const req = new UpHallRequest(5);
      // Đang đi xuống, phía trước (dưới) vẫn còn tầng phải phục vụ
      expect(req.shouldStop(5, "DOWN", true)).toBe(false);
    });

    it("should stop on the way DOWN if elevator has NO targets ahead (quay đầu)", () => {
      const req = new UpHallRequest(5);
      // Đang đi xuống tới tầng 5 và hết tầng phía dưới -> quay đầu thành UP -> dừng đón
      expect(req.shouldStop(5, "DOWN", false)).toBe(true);
    });
  });

  describe("DownHallRequest", () => {
    it("should return direction 'DOWN'", () => {
      const req = new DownHallRequest(5);
      expect(req.getDirection()).toBe("DOWN");
      expect(req.floor).toBe(5);
    });

    it("should stop if elevator is moving DOWN at the same floor", () => {
      const req = new DownHallRequest(5);
      expect(req.shouldStop(5, "DOWN", true)).toBe(true);
      expect(req.shouldStop(5, "DOWN", false)).toBe(true);
    });

    it("should NOT stop on the way UP if elevator still has targets ahead", () => {
      const req = new DownHallRequest(5);
      // Ví dụ trong đề bài: Thang đang từ tầng 1 lên 10, khách ở tầng 5 bấm XUỐNG
      // Thang đi qua tầng 5 không được dừng vì còn tầng 10 phía trước
      expect(req.shouldStop(5, "UP", true)).toBe(false);
    });

    it("should stop on the way UP if elevator has reached end of trip (quay đầu)", () => {
      const req = new DownHallRequest(5);
      expect(req.shouldStop(5, "UP", false)).toBe(true);
    });
  });

  describe("DestinationRequest", () => {
    it("should always stop when elevator reaches passenger's destination floor", () => {
      const req = new DestinationRequest(7);
      expect(req.getDirection()).toBe("IDLE");
      expect(req.shouldStop(7)).toBe(true);
      expect(req.shouldStop(6)).toBe(false);
    });
  });
});
