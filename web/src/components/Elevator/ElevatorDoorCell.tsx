import { useState } from "react";
import { TOTAL_FLOORS } from "../../constants/elevator";
import type { ActiveRequests, Direction, Elevator } from "../../types/elevator";
import CabinKeypad from "./CabinKeypad";

interface ElevatorDoorCellProps {
  elevator: Elevator;
  floor: number;
  activeRequests: ActiveRequests;
  onCallElevator: (floor: number, direction: Exclude<Direction, "IDLE">) => void;
  onSelectDestination: (elevatorId: number, floor: number) => void;
  onHoldDoor: (elevatorId: number) => void;
  onCloseDoor: (elevatorId: number) => void;
}

export default function ElevatorDoorCell({
  elevator,
  floor,
  activeRequests,
  onCallElevator,
  onSelectDestination,
  onHoldDoor,
  onCloseDoor,
}: ElevatorDoorCellProps) {
  const [showInlinePicker, setShowInlinePicker] = useState(false);

  const isCarHere = elevator.currentFloor === floor;
  const isDoorOpen = isCarHere && elevator.doorState === "OPEN";
  const isMoving = isCarHere && elevator.status === "MOVING";
  const isTarget = elevator.targetFloors.includes(floor);

  const isUpActive = !!activeRequests[floor]?.UP;
  const isDownActive = !!activeRequests[floor]?.DOWN;

  const hasUpBtn = floor !== TOTAL_FLOORS;
  const hasDownBtn = floor !== 1;

  return (
    <div
      className={`elevator-door-row flex items-center justify-between gap-2 p-1.5 rounded-lg transition-colors ${isCarHere
          ? "bg-red-50/60 dark:bg-red-950/20"
          : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
        }`}
    >
      {/* 1. Bên trái: Nút gọi sảnh UP / DOWN tại tầng */}
      <div className="flex flex-col gap-1 w-7 items-center justify-center flex-shrink-0">
        {hasUpBtn && (
          <button
            type="button"
            title={`Gọi thang đi LÊN từ tầng ${floor}`}
            onClick={() => onCallElevator(floor, "UP")}
            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all shadow-xs ${isUpActive
                ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-105 animate-pulse"
                : "bg-gray-800 hover:bg-gray-700 text-white dark:bg-gray-700 dark:hover:bg-gray-600 active:scale-95"
              }`}
          >
            ▲
          </button>
        )}
        {hasDownBtn && (
          <button
            type="button"
            title={`Gọi thang đi XUỐNG từ tầng ${floor}`}
            onClick={() => onCallElevator(floor, "DOWN")}
            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all shadow-xs ${isDownActive
                ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-105 animate-pulse"
                : "bg-gray-800 hover:bg-gray-700 text-white dark:bg-gray-700 dark:hover:bg-gray-600 active:scale-95"
              }`}
          >
            ▼
          </button>
        )}
      </div>

      {/* 2. Ở giữa: Khung cửa thang máy (Elevator Door Box) */}
      <div className="flex-1 relative">
        <div
          className={`elevator-door-box relative h-16 rounded-md flex flex-col items-center justify-between p-1.5 transition-all overflow-hidden ${isCarHere
              ? "border-2 border-red-500 bg-white dark:bg-gray-900 shadow-md ring-2 ring-red-400/30"
              : isTarget
                ? "border border-amber-400 bg-amber-50/30 dark:bg-amber-950/20"
                : "border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60"
            }`}
        >
          {/* Nhãn số tầng trên đỉnh cửa */}
          <div className="w-full flex items-center justify-between px-1">
            <span
              className={`text-xs font-extrabold ${isCarHere ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
                }`}
            >
              {floor}
            </span>

            {/* Trạng thái cabin khi có mặt tại tầng này */}
            {isCarHere && (
              <span className="flex items-center gap-1 text-[10px] font-bold">
                {isMoving && (
                  <span className="text-amber-500 animate-bounce">
                    {elevator.direction === "UP" ? "▲ LÊN" : "▼ XUỐNG"}
                  </span>
                )}
                {isDoorOpen && (
                  <span className="text-green-600 dark:text-green-400 animate-pulse font-bold">
                    CỬA MỞ 🚪
                  </span>
                )}
                {elevator.status === "IDLE" && (
                  <span className="text-gray-500 text-[9px]">SẴN SÀNG</span>
                )}
              </span>
            )}
          </div>

          {/* Hai cánh cửa thang máy trực quan */}
          <div className="w-full flex-1 relative flex items-center justify-center my-0.5 overflow-hidden rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {isDoorOpen ? (
              // Cửa mở: Hai cánh trượt sang hai bên, lộ không gian cabin bên trong
              <div className="w-full h-full flex items-center justify-between relative bg-green-50 dark:bg-green-950/40">
                <div className="w-2 h-full bg-gray-300 dark:bg-gray-600 border-r border-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowInlinePicker(!showInlinePicker)}
                  className="px-2 py-0.5 text-[10px] font-bold bg-green-600 hover:bg-green-700 text-white rounded shadow-xs active:scale-95 transition-all"
                  title="Bấm để chọn tầng đích"
                >
                  {showInlinePicker ? "Ẩn bàn phím" : "Bấm chọn tầng đích 🎯"}
                </button>
                <div className="w-2 h-full bg-gray-300 dark:bg-gray-600 border-l border-gray-400" />
              </div>
            ) : (
              // Cửa đóng: Hai cánh cửa khép kín ở giữa
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="w-1/2 h-full bg-gray-200 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 flex items-center justify-end pr-1">
                  <div className="w-0.5 h-6 bg-gray-400 dark:bg-gray-500 rounded" />
                </div>
                <div className="w-1/2 h-full bg-gray-200 dark:bg-gray-700 border-l border-gray-300 dark:border-gray-600 flex items-center justify-start pl-1">
                  <div className="w-0.5 h-6 bg-gray-400 dark:bg-gray-500 rounded" />
                </div>
                {isMoving && (
                  <span className="absolute text-xs font-black text-amber-500 animate-ping">
                    {elevator.direction === "UP" ? "▲" : "▼"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Popover chọn tầng đích khi cửa mở */}
        {isDoorOpen && showInlinePicker && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 shadow-xl">
            <CabinKeypad
              elevator={elevator}
              onSelectDestination={(elId, targetFloor) => {
                onSelectDestination(elId, targetFloor);
                setShowInlinePicker(false);
              }}
              compact
            />
          </div>
        )}
      </div>

    </div>
  );
}
