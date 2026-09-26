import { useState } from "react";
import type { Direction, Elevator } from "./types/elevator";
import { mockElevators } from "./mocks/elevator";
import Building from "./components/Building/Building";

function App() {
  const [elevators] = useState<Elevator[]>(mockElevators)

  const handleCallElevator = (floor: number, direction: Exclude<Direction, 'IDLE'>) => {
    console.log('Elevator requested: ', floor, direction)
  }

  return (
    <main className="h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <header className="flex justify-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Elevator System</h1>
      </header>
      <section className="px-12">
        <Building elevators={elevators} onCallElevator={handleCallElevator} activeRequests={{}} />
      </section>
    </main>
  );
}

export default App;