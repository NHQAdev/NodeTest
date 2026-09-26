import express from "express";
import cors from "cors";
import elevatorRouter from "./routes/elevator.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", elevatorRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;