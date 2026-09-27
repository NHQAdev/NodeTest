import { TOTAL_FLOORS } from "../../constants/elevator";
import type { Elevator } from "../../types/elevator";

interface CabinKeypadProps {
  elevator: Elevator;
  onSelectDestination: (elevatorId: number, floor: number) => void;
  compact?: boolean;
}

export default function CabinKeypad({
  elevator,
  onSelectDestination,
  compact = false,
}: CabinKeypadProps) {
  const isDoorOpen = elevator.status === "DOOR_OPEN" && elevator.doorState === "OPEN";
  const floors = Array.from({ length: TOTAL_FLOORS }, (_, i) => i + 1);

  return (
    <div className={`cabin-keypad ${compact ? "p-1.5" : "p-3"} bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Cabin Keypad (Tầng đích)
        </span>
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            isDoorOpen
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          }`}
        >
          {isDoorOpen ? "Cửa đang mở - Chọn tầng" : "Chờ thang đến & mở cửa"}
        </span>
      </div>

      <div className={`grid ${compact ? "grid-cols-5 gap-1" : "grid-cols-5 gap-1.5"}`}>
        {floors.map((floor) => {
          const isCurrent = elevator.currentFloor === floor;
          const isTarget = elevator.targetFloors.includes(floor);

          let btnClass = "border text-xs font-bold rounded flex items-center justify-center transition-all ";

          if (isCurrent) {
            btnClass += "bg-red-500 text-white border-red-600 cursor-not-allowed opacity-90 ";
          } else if (isTarget) {
            btnClass += "bg-amber-400 text-gray-900 border-amber-500 animate-pulse font-extrabold ";
          } else if (isDoorOpen) {
            btnClass += "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-blue-500 hover:text-white hover:border-blue-600 active:scale-95 shadow-sm ";
          } else {
            btnClass += "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed ";
          }

          return (
            <button
              key={floor}
              disabled={isCurrent || !isDoorOpen}
              onClick={() => onSelectDestination(elevator.id, floor)}
              title={
                isCurrent
                  ? `Thang ${elevator.id} đang ở tầng ${floor}`
                  : isTarget
                  ? `Tầng ${floor} đã được chọn`
                  : isDoorOpen
                  ? `Bấm để đi đến tầng ${floor}`
                  : `Cần chờ thang máy đến nơi và mở cửa để chọn tầng`
              }
              className={`${btnClass} ${compact ? "h-7 text-xs" : "h-9 text-sm"}`}
            >
              {floor}
            </button>
          );
        })}
      </div>
    </div>
  );
}
