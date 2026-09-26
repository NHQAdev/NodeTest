import http from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import app from "./app";
import { elevatorService } from "./services/elevator.service";
import { registerElevatorSockets } from "./sockets/elevator.socket";

dotenv.config();

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

registerElevatorSockets(io, elevatorService);
elevatorService.startSimulation();

server.listen(PORT, () => {
  console.log(`Elevator API server is running on port ${PORT}`);
});