import { Server, Socket } from "socket.io";
import { ElevatorService } from "../services/elevator.service";
import { Direction } from "../types/elevator.type";

interface CallElevatorPayload {
  floor: number;
  direction: Direction;
}

export const registerElevatorSockets = (io: Server, service: ElevatorService): void => {
  // Lắng nghe cập nhật từ service và phát sóng cho tất cả clients
  service.on("update", (elevators) => {
    io.emit("elevators_updated", elevators);
  });

  io.on("connection", (socket: Socket) => {
    // Gửi trạng thái ban đầu cho client vừa kết nối
    socket.emit("elevators_updated", service.getElevatorStates());

    // Nhận lệnh gọi thang từ sảnh
    socket.on("call_elevator", ({ floor, direction }: CallElevatorPayload) => {
      if (typeof floor === "number" && direction) {
        service.handleRequest(floor, direction);
      }
    });

    // Nhận lệnh chọn tầng đích từ trong cabin
    socket.on(
      "select_destination",
      (
        { elevatorId, floor }: { elevatorId: number; floor: number },
        callback?: (res: { success: boolean; message?: string }) => void
      ) => {
        if (typeof elevatorId === "number" && typeof floor === "number") {
          const result = service.handleDestination(elevatorId, floor);
          if (typeof callback === "function") {
            callback(result);
          }
        } else if (typeof callback === "function") {
          callback({ success: false, message: "Invalid payload parameters" });
        }
      }
    );

    // Nút ◀️▶️ giữ cửa mở
    socket.on("hold_door", ({ elevatorId }: { elevatorId: number }) => {
      if (typeof elevatorId === "number") {
        service.holdDoor(elevatorId);
      }
    });

    // Nút ▶️◀️ đóng cửa ngay
    socket.on("close_door", ({ elevatorId }: { elevatorId: number }) => {
      if (typeof elevatorId === "number") {
        service.closeDoorImmediately(elevatorId);
      }
    });
  });
};
