import type { ActiveRequests, Direction, Elevator } from "../../types/elevator";
import ElevatorColumn from "../Elevator/ElevatorColumn";

interface BuildingProps {
  elevators: Elevator[];
  activeRequests: ActiveRequests;
  onCallElevator: (floor: number, direction: Exclude<Direction, "IDLE">) => void;
  onSelectDestination: (elevatorId: number, floor: number) => void;
  onHoldDoor: (elevatorId: number) => void;
  onCloseDoor: (elevatorId: number) => void;
  onReset?: () => void;
}

export default function Building({
  elevators,
  activeRequests,
  onCallElevator,
  onSelectDestination,
  onHoldDoor,
  onCloseDoor,
  onReset,
}: BuildingProps) {
  return (
    <div className="space-y-6">
      {/* Thanh thông tin hướng dẫn và nút Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border-2 border-red-500 rounded-xs bg-red-50 dark:bg-red-950/40 inline-block" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">Viền đỏ:</span>
            <span className="text-gray-500">Vị trí thang máy hiện tại</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              ▲
            </span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Nút gọi sảnh:</span>
            <span className="text-gray-500">Bấm ▲ hoặc ▼ để gọi thang đón</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-green-600 font-bold">🚪 Cửa Mở:</span>
            <span className="text-gray-500">Bấm số 1-10 để chọn tầng đích</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">◀▶ / ▶◀ :</span>
            <span className="text-gray-500">Giữ cửa mở / Đóng cửa ngay</span>
          </div>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-700 transition-all active:scale-95 flex items-center gap-1.5"
          >
            🔄 Reset 3 thang về tầng 1
          </button>
        )}
      </div>

      {/* Sơ đồ 3 cột giếng thang máy (3 Elevators working in parallel) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {elevators.map((elevator) => (
          <ElevatorColumn
            key={elevator.id}
            elevator={elevator}
            activeRequests={activeRequests}
            onCallElevator={onCallElevator}
            onSelectDestination={onSelectDestination}
            onHoldDoor={onHoldDoor}
            onCloseDoor={onCloseDoor}
          />
        ))}
      </div>
    </div>
  );
}
