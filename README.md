# Elevator System Simulator 🏢🛗

A full-stack, realtime Elevator Simulator web application built with **Node.js/Express + TypeScript** backend and **React.js + Vite + Tailwind CSS** frontend. The system simulates 3 elevators working in parallel across 10 floors, engineered using Object-Oriented Programming (OOP) principles and efficient dispatching algorithms to minimize passenger wait times.

---

## 🌟 Key Features

- **Parallel Multi-Elevator Simulation**: 3 elevators operating independently in a 10-floor office building.
- **Realtime Synchronization**: Bi-directional communication powered by **Socket.IO** (with REST API fallback).
- **Directional Hall Calls (⬆️ / ⬇️)**: Smart hall call buttons on each floor with active LED indicators.
- **Strict Destination Selection Rule**: Passengers can select destination floors (1–10) inside the cabin **only after the elevator arrives and doors open (`DOOR_OPEN`)**.
- **Door Hold & Quick Close Controls**:
  - `◀️▶️`: Extends door open duration (Door Hold).
  - `▶️◀️`: Closes the door immediately for fast departure.
- **Comprehensive Unit Test Suite**: 25 automated tests covering OOP rules, directional stopping logic, and scheduling algorithms via Jest.

---

## 🏗️ Object-Oriented Programming (OOP) Architecture

The backend core is designed with strict adherence to OOP paradigms:

### 1. Encapsulation (Tính đóng gói)
- All core attributes inside `Elevator` (`_state`, `_doorTicksLeft`, `_requests`) are declared `private` to protect data integrity.
- Safe public getters (`id`, `floor`, `direction`, `doorState`, `status`, `targetFloors`) and `getState()` return immutable snapshots, preventing unwanted external mutations.

### 2. Inheritance (Tính kế thừa)
- `ElevatorRequest` serves as an abstract base class.
- Extended by specialized request classes:
  - `UpHallRequest`: Hall calls requesting upward travel.
  - `DownHallRequest`: Hall calls requesting downward travel.
  - `DestinationRequest`: Passenger destination choices from inside the cabin.

### 3. Polymorphism (Tính đa hình)
- Each subclass overrides the abstract `shouldStop(currentFloor, currentDirection, hasTargetsAhead)` method.
- **Directional Stopping Rule**:
  - `UpHallRequest`: Stops when moving `UP`. If moving `DOWN`, it ignores the stop unless no further targets exist ahead (end of trip turnaround).
  - `DownHallRequest`: Stops when moving `DOWN`. If moving `UP`, it ignores the stop unless no further targets exist ahead.
  - `DestinationRequest`: Always stops when reaching the passenger's desired floor.

---

## 🧠 Elevator Scheduling & Dispatch Strategy

The system uses a modified **LOOK (SCAN) Algorithm** combined with a **Cost-Based Dispatcher Score (`calculateScore`)** to select the optimal elevator:

```
Score = Distance + (StopsAhead * STOP_PENALTY) + (ReverseDirection ? REVERSE_DIRECTION_PENALTY : 0)
```

1. **On-The-Way Passenger Pickup**: Elevators traveling in the requested direction pick up matching hall requests along their trajectory.
2. **Truly Idle Elevator Preference**: An elevator is considered `Truly Idle` only if it has zero pending targets. Idle elevators receive lowest score priority for new calls.
3. **Reverse Direction Penalty (`REVERSE_DIRECTION_PENALTY = 15`)**:
   - *Scenario*: Elevator #1 is traveling up to Floor 10. A passenger at Floor 4 calls `DOWN`.
   - *Behavior*: Assigning Elevator #1 would force the passenger to wait for Elevator #1 to complete its entire upward trip to 10 and return. Applying a heavy reverse penalty ensures the system **dispatches a truly idle elevator (Elevator #2 or #3)** to pick up the passenger at Floor 4 immediately.
4. **Tie-Breaking Load Distribution**: When multiple elevators have equal distance scores, the dispatcher picks the elevator with the fewest pending target floors.

---

## 📁 Repository Structure

```text
CHADtest/
├── api/                    # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── constants/      # Elevator constants (FLOORS, PENALTIES, TIMINGS)
│   │   ├── controllers/    # Express REST API controllers
│   │   ├── models/         # OOP models (Elevator, ElevatorRequest subclasses)
│   │   ├── routes/         # Express API routing
│   │   ├── services/       # ElevatorService (Simulation & Dispatcher)
│   │   ├── sockets/        # Socket.IO realtime event handlers
│   │   ├── types/          # TypeScript interfaces & types
│   │   └── __tests__/      # Jest Unit Test Suites (25 tests)
│   ├── jest.config.js      # Jest configuration
│   └── package.json
└── web/                    # React.js + Vite + TypeScript Frontend
    ├── src/
    │   ├── components/     # UI Components (Building, ElevatorColumn, ElevatorDoorCell, CabinKeypad)
    │   ├── services/       # Socket.IO client & REST API service helpers
    │   ├── types/          # Shared TypeScript interfaces
    │   ├── App.tsx         # Main application container & state management
    │   └── main.tsx
    └── package.json
```

---

## 🛠️ How to Run Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 1. Start the Backend API (Port 5001)
```bash
cd api
npm install
npm run dev
```

### 2. Start the Frontend App (Port 3000)
```bash
cd web
npm install
npm run dev
```

Open your browser at `http://localhost:3000` to view the interactive simulator.

---

## 🧪 Running Unit Tests (Jest)

To run the automated test suite covering OOP principles and elevator dispatching logic:

```bash
cd api
npm test
```

### Test Coverage Summary:
- ✅ `request.model.test.ts`: Tests polymorphic `shouldStop()` rules across `UpHallRequest`, `DownHallRequest`, and `DestinationRequest`.
- ✅ `elevator.model.test.ts`: Tests `Elevator` encapsulation, state immutability, destination selection rules, and door timing.
- ✅ `elevator.service.test.ts`: Tests multi-elevator dispatching, reverse call penalty, idle preference, and system reset.

---

## 📄 License
ISC License