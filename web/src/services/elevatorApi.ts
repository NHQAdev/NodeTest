import type { Direction, Elevator } from "../types/elevator";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const fetchElevators = async (): Promise<Elevator[]> => {
  const res = await fetch(`${API_BASE}/elevators`);
  if (!res.ok) {
    throw new Error(`Failed to fetch elevators: ${res.statusText}`);
  }
  return res.json();
};

export const requestElevator = async (
  floor: number,
  direction: Exclude<Direction, "IDLE">
): Promise<{ success: boolean; assignedElevatorId: number; elevator: Elevator }> => {
  const res = await fetch(`${API_BASE}/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ floor, direction }),
  });
  if (!res.ok) {
    throw new Error(`Failed to request elevator: ${res.statusText}`);
  }
  return res.json();
};
