import type { Elevator } from "../../types/elevator";

interface ElevatorCarProps {
  elevator: Elevator;
}

export default function ElevatorCar({ elevator }: ElevatorCarProps) {
  return (
    <div className="elevator-car bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <span className="text-lg font-bold">Elevator {elevator.id}</span>
        <span className={`text-xs px-2 py-1 rounded ${elevator.status === 'DOOR_OPEN' ? 'bg-green-100 text-green-800' :
          elevator.status === 'MOVING' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
          {elevator.status}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <span className="block text-xs text-gray-500 uppercase">Floor</span>
            <span className="text-2xl font-bold">{elevator.currentFloor}</span>
          </div>
          <div className="text-center">
            <span className="block text-xs text-gray-500 uppercase">Direction</span>
            <span className="text-2xl font-bold uppercase">{elevator.direction}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
