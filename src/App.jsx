import { useState } from "react";
import { aStar } from "./astar";

export default function App() {
  const [gridSize, setGridSize] = useState(null);
  const [gridInput, setGridInput] = useState("");

  const [carsInput, setCarsInput] = useState([]);
  const [path, setPath] = useState([]);
  const [step, setStep] = useState(0);
  const [moveLog, setMoveLog] = useState([]);

  // Car form inputs
  const [id, setId] = useState("");
  const [row, setRow] = useState(0);
  const [col, setCol] = useState(0);
  const [length, setLength] = useState(2);
  const [dir, setDir] = useState("H");

  // ===============================
  // Set Grid Size First
  // ===============================
  const handleGridSubmit = () => {
    const size = parseInt(gridInput);
    if (isNaN(size) || size < 4) {
      alert("Enter grid size >= 4");
      return;
    }
    setGridSize(size);
  };

  // ===============================
  // Add Car
  // ===============================
  const addCar = () => {
  if (!id) {
    alert("Car ID required");
    return;
  }

  // Only one X allowed
  if (id === "X" && carsInput.some(c => c.id === "X")) {
    alert("Target car X already exists!");
    return;
  }

  const newCar = {
    id,
    row: Number(row),
    col: Number(col),
    length: Number(length),
    dir
  };

  // ===============================
  // CHECK OUT OF BOUNDS
  // ===============================
  if (dir === "H") {
    if (newCar.col + newCar.length > gridSize) {
      alert("Car goes outside grid!");
      return;
    }
  } else {
    if (newCar.row + newCar.length > gridSize) {
      alert("Car goes outside grid!");
      return;
    }
  }

  // ===============================
  // CHECK OVERLAPPING
  // ===============================
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {

      const newCarOccupies =
        (dir === "H" &&
          r === newCar.row &&
          c >= newCar.col &&
          c < newCar.col + newCar.length) ||
        (dir === "V" &&
          c === newCar.col &&
          r >= newCar.row &&
          r < newCar.row + newCar.length);

      if (!newCarOccupies) continue;

      const overlappingCar = carsInput.find(car =>
        (car.dir === "H" &&
          r === car.row &&
          c >= car.col &&
          c < car.col + car.length) ||
        (car.dir === "V" &&
          c === car.col &&
          r >= car.row &&
          r < car.row + car.length)
      );

      if (overlappingCar) {
        alert("Car overlaps with another vehicle!");
        return;
      }
    }
  }

  setCarsInput([...carsInput, newCar]);

  setId("");
  setRow(0);
  setCol(0);
  setLength(2);
  setDir("H");
};


  // ===============================
  // Run Solver
  // ===============================
  const runSolver = () => {
    if (carsInput.length === 0) return;

    const result = aStar(carsInput, gridSize); // 🔥 pass size
    setPath(result.path);

    const log = [];
    for (let i = 1; i < result.path.length; i++) {
      const prev = result.path[i - 1];
      const curr = result.path[i];
      for (let j = 0; j < prev.length; j++) {
        if (prev[j].row !== curr[j].row || prev[j].col !== curr[j].col) {
          log.push(curr[j].id);
          break;
        }
      }
    }
    setMoveLog(log);
    setStep(0);
  };

  const currentCars = step === 0 ? carsInput : path[step];

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white font-sans flex flex-col items-center p-6">

    <h1 className="text-4xl font-extrabold mb-8 tracking-wide text-center">
      🚗 Rush Hour Solver
    </h1>

    {/* ===============================
        GRID SIZE INPUT SCREEN
       =============================== */}
    {!gridSize && (
      <div className="bg-gray-800/70 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md text-center border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4">Select Grid Size</h2>
        <input
          type="number"
          className="p-3 rounded-lg bg-gray-700 w-full mb-4 text-center text-lg outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Enter size (e.g. 6)"
          value={gridInput}
          onChange={(e) => setGridInput(e.target.value)}
        />
        <button
          onClick={handleGridSubmit}
          className="w-full py-3 bg-green-500 hover:bg-green-600 active:scale-95 transition rounded-lg text-black font-bold text-lg shadow-lg"
        >
          Start Game
        </button>
      </div>
    )}

    {/* ===============================
        MAIN APP
       =============================== */}
    {gridSize && (
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">

        {/* LEFT PANEL */}
        <div className="flex-1 bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-700">

          <h2 className="text-xl font-bold mb-4">➕ Add Vehicle</h2>
<p className="text-sm text-red-400 mb-2">
  🚗 Car with ID <b>X</b> is the TARGET car (must reach right side)
</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <input
              placeholder="ID"
              className="p-2 rounded bg-gray-700 outline-none focus:ring-2 focus:ring-blue-400"
              value={id}
              onChange={(e) => setId(e.target.value.toUpperCase())}
            />

            <select
              className="p-2 rounded bg-gray-700"
              value={dir}
              onChange={(e) => setDir(e.target.value)}
            >
              <option value="H">Horizontal</option>
              <option value="V">Vertical</option>
            </select>

            <input
              type="number"
              min="0"
              max={gridSize - 1}
              placeholder="Row"
              className="p-2 rounded bg-gray-700"
              value={row}
              onChange={(e) => setRow(e.target.value)}
            />

            <input
              type="number"
              min="0"
              max={gridSize - 1}
              placeholder="Col"
              className="p-2 rounded bg-gray-700"
              value={col}
              onChange={(e) => setCol(e.target.value)}
            />

            <input
              type="number"
              min="2"
              max="3"
              placeholder="Length"
              className="p-2 rounded bg-gray-700 col-span-2"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>

          <button
            onClick={addCar}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 active:scale-95 transition rounded-lg font-bold"
          >
            Add Car
          </button>

          <button
            onClick={runSolver}
            className="w-full mt-4 py-3 bg-green-500 hover:bg-green-600 active:scale-95 transition rounded-lg text-black font-bold text-lg"
          >
            Solve Puzzle
          </button>

          <button
            onClick={() => {
              setGridSize(null);
              setCarsInput([]);
              setPath([]);
              setStep(0);
            }}
            className="w-full mt-3 py-2 bg-red-500 hover:bg-red-600 active:scale-95 transition rounded-lg font-bold"
          >
            Reset
          </button>
        </div>

        {/* RIGHT PANEL - GRID */}
        <div className="flex-1 flex flex-col items-center">

          <div
            className="grid gap-1 bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-700"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 3rem)`
            }}
          >
            {Array.from({ length: gridSize }).map((_, r) =>
              Array.from({ length: gridSize }).map((_, c) => {
                const car = currentCars?.find(
                  x =>
                    (x.dir === "H" &&
                      r === x.row &&
                      c >= x.col &&
                      c < x.col + x.length) ||
                    (x.dir === "V" &&
                      c === x.col &&
                      r >= x.row &&
                      r < x.row + x.length)
                );

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-12 h-12 flex items-center justify-center rounded-md border transition-all duration-200 ${
                      car
                        ? car.id === "X"
                          ? "bg-red-500 shadow-lg scale-105 text-black font-bold"
                          : "bg-blue-400 text-black font-bold"
                        : "bg-gray-700"
                    }`}
                  >
                    {car ? car.id : ""}
                  </div>
                );
              })
            )}
          </div>

          {/* Step Controls */}
          {path.length > 0 && (
            <div className="mt-6 text-center">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setStep(s => Math.max(s - 1, 0))}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
                >
                  ◀ Prev
                </button>
                <button
                  onClick={() =>
                    setStep(s => Math.min(s + 1, path.length - 1))
                  }
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
                >
                  Next ▶
                </button>
              </div>

              <p className="mt-3 text-gray-300">
                Step {step} / {path.length - 1}
              </p>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

}
