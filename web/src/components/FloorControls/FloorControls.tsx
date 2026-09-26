import { TOTAL_FLOORS } from '../../constants/elevator';
import type { Direction } from '../../types/elevator';

export interface FloorControlsProps {
  floor: number;
  onCallElevator: (floor: number, direction: Exclude<Direction, 'IDLE'>) => void;
  activeRequests: { [key: number]: Direction };
}

export default function FloorControls({ floor, onCallElevator, activeRequests }: FloorControlsProps) {
  const isActiveUp = activeRequests[floor] === 'UP';
  const isActiveDown = activeRequests[floor] === 'DOWN';

  return (
    <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
      <span className="font-bold text-gray-900 dark:text-gray-100">{floor}</span>
      <div className="flex space-x-2">
        {
          floor !== TOTAL_FLOORS && <button
            onClick={() => onCallElevator(floor, 'UP')}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${isActiveUp
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            ↑
          </button>
        }
        {
          floor !== 1 && <button
            onClick={() => onCallElevator(floor, 'DOWN')}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${isActiveDown
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            ↓
          </button>
        }
      </div>
    </div>
  );
}
