import { io, Socket } from "socket.io-client";
import type { Direction, Elevator } from "../types/elevator";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export const subscribeToElevators = (callback: (elevators: Elevator[]) => void) => {
  socket.on("elevators_updated", callback);
  return () => {
    socket.off("elevators_updated", callback);
  };
};

export const callElevatorSocket = (floor: number, direction: Exclude<Direction, "IDLE">) => {
  socket.emit("call_elevator", { floor, direction });
};
