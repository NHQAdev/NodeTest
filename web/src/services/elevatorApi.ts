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

export const selectDestination = async (
  elevatorId: number,
  floor: number
): Promise<{ success: boolean; message?: string }> => {
  const res = await fetch(`${API_BASE}/destination`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ elevatorId, floor }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to select destination: ${res.statusText}`);
  }
  return data;
};

export const holdDoor = async (elevatorId: number): Promise<{ success: boolean }> => {
  const res = await fetch(`${API_BASE}/elevators/${elevatorId}/hold-door`, {
    method: "POST",
  });
  return res.json();
};

export const closeDoor = async (elevatorId: number): Promise<{ success: boolean }> => {
  const res = await fetch(`${API_BASE}/elevators/${elevatorId}/close-door`, {
    method: "POST",
  });
  return res.json();
};

export const resetElevators = async (): Promise<{ success: boolean; message: string; elevators: Elevator[] }> => {
  const res = await fetch(`${API_BASE}/reset`, {
    method: "POST",
  });
  return res.json();
};


