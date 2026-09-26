import { useState, useEffect } from "react";
import type { Direction, Elevator } from "./types/elevator";
import { mockElevators } from "./mocks/elevator";
import Building from "./components/Building/Building";
import { socket, subscribeToElevators, callElevatorSocket } from "./services/socket";
import { fetchElevators } from "./services/elevatorApi";

function App() {
  const [elevators, setElevators] = useState<Elevator[]>(mockElevators);
  const [activeRequests, setActiveRequests] = useState<{ [key: number]: Direction }>({});
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

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

      // Tắt nút gọi tầng khi thang máy đã tới và mở cửa đón khách
      setActiveRequests((prev) => {
        const next = { ...prev };
        for (const el of updatedElevators) {
          if (el.status === "DOOR_OPEN" && next[el.currentFloor]) {
            delete next[el.currentFloor];
          }
        }
        return next;
      });
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      unsubscribe();
    };
  }, []);

  const handleCallElevator = (floor: number, direction: Exclude<Direction, "IDLE">) => {
    // Đánh dấu nút gọi đang sáng đèn
    setActiveRequests((prev) => ({ ...prev, [floor]: direction }));

    // Gửi sự kiện gọi thang tới backend
    callElevatorSocket(floor, direction);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors py-6">
      <header className="flex flex-col items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Elevator System</h1>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {isConnected ? "Realtime Connected (Backend Port 5001)" : "Connecting to Backend..."}
          </span>
        </div>
      </header>
      <section className="px-12 max-w-7xl mx-auto">
        <Building
          elevators={elevators}
          onCallElevator={handleCallElevator}
          activeRequests={activeRequests}
        />
      </section>
    </main>
  );
}

export default App;