import type { Direction, Elevator } from "../../types/elevator";
import Floor from "../Floor/Floor";
import { FLOOR_NUMBERS } from "../../constants/elevator";

interface BuildingProps {
  elevators: Elevator[];
  onCallElevator: (floor: number, direction: Exclude<Direction, 'IDLE'>) => void;
  activeRequests: { [key: number]: Direction };
}

export default function Building({ elevators, onCallElevator, activeRequests }: BuildingProps) {
  return (
    <div>
      {
        FLOOR_NUMBERS.map((floor) => (
          <Floor
            key={floor}
            floor={floor}
            elevators={elevators}
            onCallElevator={onCallElevator}
            activeRequests={activeRequests}
          />
        ))
      }
    </div>
  );
}
