export type Direction = 'UP' | 'DOWN' | 'IDLE';

export type DoorState = 'OPEN' | 'CLOSED';

export type ElevatorStatus =
  | 'IDLE'
  | 'MOVING'
  | 'DOOR_OPEN';

export interface ElevatorState {
  id: number;
  currentFloor: number;
  direction: Direction;
  doorState: DoorState;
  status: ElevatorStatus;
  targetFloors: number[];
}