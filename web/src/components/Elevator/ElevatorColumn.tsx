import { FLOOR_NUMBERS } from "../../constants/elevator";
import type { ActiveRequests, Direction, Elevator } from "../../types/elevator";
import CabinKeypad from "./CabinKeypad";
import ElevatorDoorCell from "./ElevatorDoorCell";

interface ElevatorColumnProps {
  elevator: Elevator;
  activeRequests: ActiveRequests;
  onCallElevator: (floor: number, direction: Exclude<Direction, "IDLE">) => void;
  onSelectDestination: (elevatorId: number, floor: number) => void;
  onHoldDoor: (elevatorId: number) => void;
  onCloseDoor: (elevatorId: number) => void;
}

export default function ElevatorColumn({
  elevator,
  activeRequests,
  onCallElevator,
  onSelectDestination,
  onHoldDoor,
  onCloseDoor,
}: ElevatorColumnProps) {
  const isDoorOpen = elevator.status === "DOOR_OPEN" && elevator.doorState === "OPEN";

  return (
    <div className="elevator-column flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* 1. Header: Bảng điều khiển Cabin của thang máy */}
      <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-850 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-base">
              Thang máy #{elevator.id + 1}
            </h3>
          </div>

          {/* Badge trạng thái */}
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              elevator.status === "DOOR_OPEN"
                ? "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300 border border-green-300"
                : elevator.status === "MOVING"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 animate-pulse"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {elevator.status === "DOOR_OPEN"
              ? "Cửa đang mở"
              : elevator.status === "MOVING"
              ? `Đang chạy (${elevator.direction})`
              : "Sẵn sàng (IDLE)"}
          </span>
        </div>

        {/* Màn hình hiển thị LCD: Tầng hiện tại & Hướng */}
        <div className="flex items-center justify-between bg-black text-green-400 font-mono px-3 py-1.5 rounded-md shadow-inner my-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">FLOOR</span>
            <span className="text-xl font-bold">{elevator.currentFloor}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">DIR</span>
            <span className="text-lg font-bold">
              {elevator.direction === "UP" ? "▲ UP" : elevator.direction === "DOWN" ? "▼ DOWN" : "— IDLE"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">DOOR</span>
            <span className={`text-xs font-bold ${isDoorOpen ? "text-green-400" : "text-gray-400"}`}>
              {elevator.doorState}
            </span>
          </div>
        </div>

        {/* Danh sách tầng đích đang chờ */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-2">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Tầng đích:</span>
          {elevator.targetFloors.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {elevator.targetFloors.map((target) => (
                <span
                  key={target}
                  className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-bold px-1.5 py-0.2 rounded text-[11px] border border-amber-300 dark:border-amber-700"
                >
                  {target}
                </span>
              ))}
            </div>
          ) : (
            <span className="italic text-gray-400 text-[11px]">Trống</span>
          )}
        </div>

        {/* Nút giữ cửa & đóng cửa ngay */}
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => onHoldDoor(elevator.id)}
            title="Giữ cửa mở"
            className={`flex-1 py-1 px-2 rounded text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
              isDoorOpen
                ? "bg-green-600 hover:bg-green-700 text-white border-green-700 active:scale-95 shadow-xs"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            }`}
          >
            ◀▶ Giữ mở cửa
          </button>
          <button
            type="button"
            onClick={() => onCloseDoor(elevator.id)}
            title="Đóng cửa ngay lập tức"
            className={`flex-1 py-1 px-2 rounded text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
              isDoorOpen
                ? "bg-red-600 hover:bg-red-700 text-white border-red-700 active:scale-95 shadow-xs"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            }`}
          >
            ▶◀ Đóng cửa ngay
          </button>
        </div>

        {/* Bàn phím chọn tầng đích (Cabin Keypad) */}
        <CabinKeypad
          elevator={elevator}
          onSelectDestination={onSelectDestination}
          compact
        />
      </div>

      {/* 2. Danh sách 10 tầng của giếng thang (Floors 10 down to 1) */}
      <div className="p-2 space-y-1 divide-y divide-gray-100 dark:divide-gray-800">
        {FLOOR_NUMBERS.map((floor) => (
          <ElevatorDoorCell
            key={floor}
            elevator={elevator}
            floor={floor}
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
