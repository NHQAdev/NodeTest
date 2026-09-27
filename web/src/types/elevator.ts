export type Direction = 'UP' | 'DOWN' | 'IDLE';

export type DoorState = 'OPEN' | 'CLOSED';

export type ElevatorStatus =
  | 'IDLE'
  | 'MOVING'
  | 'DOOR_OPEN';

export interface Elevator {
  id: number;
  currentFloor: number;
  direction: Direction;
  doorState: DoorState;
  status: ElevatorStatus;
  targetFloors: number[];
}

export interface HallRequest {
  floor: number;
  direction: Exclude<Direction, 'IDLE'>;
}

export type ActiveRequests = {
  [floor: number]: {
    UP?: boolean;
    DOWN?: boolean;
  };
};