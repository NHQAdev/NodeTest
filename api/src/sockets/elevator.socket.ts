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

    // Nhận lệnh gọi thang từ client
    socket.on("call_elevator", ({ floor, direction }: CallElevatorPayload) => {
      if (typeof floor === "number" && direction) {
        service.handleRequest(floor, direction);
      }
    });
  });
};
