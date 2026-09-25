import type { Elevator } from '../types/elevator';

export const mockElevators: Elevator[] = [
  {
    id: 1,
    currentFloor: 1,
    direction: 'IDLE',
    doorState: 'CLOSED',
    status: 'IDLE',
    targetFloors: [],
  },
  {
    id: 2,
    currentFloor: 5,
    direction: 'IDLE',
    doorState: 'CLOSED',
    status: 'IDLE',
    targetFloors: [],
  },
  {
    id: 3,
    currentFloor: 10,
    direction: 'IDLE',
    doorState: 'CLOSED',
    status: 'IDLE',
    targetFloors: [],
  },
];