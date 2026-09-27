import { useState, useEffect } from "react";
import type { ActiveRequests, Direction, Elevator } from "./types/elevator";
import { mockElevators } from "./mocks/elevator";
import Building from "./components/Building/Building";
import {
  socket,
  subscribeToElevators,
  callElevatorSocket,
  selectDestinationSocket,
  holdDoorSocket,
  closeDoorSocket,
} from "./services/socket";
import { fetchElevators, resetElevators } from "./services/elevatorApi";

interface Notification {
  type: "success" | "error" | "info";
  message: string;
}

function App() {
  const [elevators, setElevators] = useState<Elevator[]>(mockElevators);
  const [activeRequests, setActiveRequests] = useState<ActiveRequests>({});
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  useEffect(() => {
    // 1. Tải trạng thái ban đầu qua REST API
    fetchElevators()
      .then((data) => {
        if (data && data.length > 0) {
          setElevators(data);
        }
      })
      .catch((err) => {
        console.warn("Không thể tải trạng thái từ API, đang dùng dữ liệu mặc định:", err);
      });

    // 2. Theo dõi kết nối Socket.IO
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // 3. Lắng nghe cập nhật realtime từ backend khi thang máy di chuyển
    const unsubscribe = subscribeToElevators((updatedElevators) => {
      setElevators(updatedElevators);

      // Tắt nút gọi tầng tương ứng khi thang máy đã tới và mở cửa đón khách
      setActiveRequests((prev) => {
        let changed = false;
        const next = { ...prev };

        for (const el of updatedElevators) {
          if (el.status === "DOOR_OPEN" && next[el.currentFloor]) {
            const floorReqs = { ...next[el.currentFloor] };

            // Nếu thang phục vụ chiều UP
            if (el.direction === "UP" && floorReqs.UP) {
              delete floorReqs.UP;
              changed = true;
            }
            // Nếu thang phục vụ chiều DOWN
            else if (el.direction === "DOWN" && floorReqs.DOWN) {
              delete floorReqs.DOWN;
              changed = true;
            }
            // Nếu thang rảnh (IDLE) đến đón
            else if (el.direction === "IDLE") {
              if (floorReqs.UP || floorReqs.DOWN) {
                delete floorReqs.UP;
                delete floorReqs.DOWN;
                changed = true;
              }
            }

            if (Object.keys(floorReqs).length === 0) {
              delete next[el.currentFloor];
            } else {
              next[el.currentFloor] = floorReqs;
            }
          }
        }

        return changed ? next : prev;
      });
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      unsubscribe();
    };
  }, []);

  // Xử lý gọi thang từ sảnh (UP / DOWN)
  const handleCallElevator = (floor: number, direction: Exclude<Direction, "IDLE">) => {
    setActiveRequests((prev) => ({
      ...prev,
      [floor]: {
        ...prev[floor],
        [direction]: true,
      },
    }));

    callElevatorSocket(floor, direction);
    showNotification("info", `Đã gọi thang máy tại tầng ${floor} (hướng ${direction === "UP" ? "LÊN" : "XUỐNG"})`);
  };

  // Xử lý chọn tầng đích trong cabin
  const handleSelectDestination = (elevatorId: number, floor: number) => {
    selectDestinationSocket(elevatorId, floor, (res) => {
      if (res && !res.success) {
        showNotification("error", res.message || `Không thể chọn tầng ${floor}`);
      } else {
        showNotification("success", `Đã chọn tầng đích ${floor} cho Thang #${elevatorId + 1}`);
      }
    });
  };

  // Xử lý giữ cửa mở ◀️▶️
  const handleHoldDoor = (elevatorId: number) => {
    holdDoorSocket(elevatorId);
    showNotification("info", `Thang #${elevatorId + 1}: Đang giữ mở cửa ◀▶`);
  };

  // Xử lý đóng cửa ngay ▶️◀️
  const handleCloseDoor = (elevatorId: number) => {
    closeDoorSocket(elevatorId);
    showNotification("info", `Thang #${elevatorId + 1}: Đang đóng cửa ngay ▶◀`);
  };

  // Reset toàn bộ thang về tầng 1
  const handleReset = async () => {
    try {
      const data = await resetElevators();
      if (data.elevators) {
        setElevators(data.elevators);
      }
      setActiveRequests({});
      showNotification("success", "Đã reset toàn bộ 3 thang máy về Tầng 1");
    } catch (err) {
      showNotification("error", "Lỗi khi reset thang máy");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors py-6 px-4 sm:px-6 lg:px-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Elevator Simulator
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            3 Thang máy chạy song song • 10 Tầng • Thuật toán LOOK + Tính đa hình OOP
          </p>
        </div>

        {/* Trạng thái kết nối Socket & Nút Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {isConnected ? "Socket.IO Realtime" : "Mất kết nối backend"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-gray-50 text-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-700 transition-all active:scale-95 shadow-xs"
          >
            🔄 Reset hệ thống
          </button>
        </div>
      </header>

      {/* Toast thông báo phản hồi thao tác */}
      {notification && (
        <div className="max-w-7xl mx-auto mb-4 animate-fade-in">
          <div
            className={`p-3 rounded-lg text-xs font-bold flex items-center justify-between shadow-md border ${
              notification.type === "success"
                ? "bg-green-50 text-green-900 border-green-300 dark:bg-green-950/80 dark:text-green-200 dark:border-green-800"
                : notification.type === "error"
                ? "bg-red-50 text-red-900 border-red-300 dark:bg-red-950/80 dark:text-red-200 dark:border-red-800"
                : "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800"
            }`}
          >
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 ml-4 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Khu vực mô phỏng toà nhà */}
      <section className="max-w-7xl mx-auto">
        <Building
          elevators={elevators}
          activeRequests={activeRequests}
          onCallElevator={handleCallElevator}
          onSelectDestination={handleSelectDestination}
          onHoldDoor={handleHoldDoor}
          onCloseDoor={handleCloseDoor}
          onReset={handleReset}
        />
      </section>
    </main>
  );
}

export default App;