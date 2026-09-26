import type { Direction, Elevator } from '../../types/elevator';
import FloorControls from '../FloorControls/FloorControls';
import ElevatorCar from '../Elevator/ElevatorCar';
import './Floor.css';

export interface FloorProps {
  floor: number;
  elevators: Elevator[];
  onCallElevator: (floor: number, direction: Exclude<Direction, 'IDLE'>) => void;
  activeRequests?: { [key: number]: Direction };
}

export default function Floor({
  floor,
  elevators,
  onCallElevator,
  activeRequests = {},
}: FloorProps) {
  return (
    <div className="floor-row flex items-center border-b border-gray-200 dark:border-gray-700 py-3 px-4 gap-6 bg-white dark:bg-gray-900 transition-colors">
      {/* Cột điều khiển tầng (Floor Controls) */}
      <div className="w-36 flex-shrink-0">
        <FloorControls
          floor={floor}
          onCallElevator={onCallElevator}
          activeRequests={activeRequests}
        />
      </div>

      {/* Cột các trục giếng thang máy (Elevator Shafts) */}
      <div className="flex-1 grid grid-flow-col auto-cols-fr gap-4">
        {elevators.map((elevator) => {
          const isAtCurrentFloor = elevator.currentFloor === floor;
          return (
            <div
              key={elevator.id}
              className={`elevator-shaft ${isAtCurrentFloor ? 'has-car' : 'is-empty'}`}
            >
              {isAtCurrentFloor ? (
                <div className="car-container w-full">
                  <ElevatorCar elevator={elevator} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
