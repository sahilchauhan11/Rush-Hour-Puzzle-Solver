// ===============================
// A* Rush Hour Solver
// ===============================

function canMove(car, cars, step, size) {
  const occupied = Array.from({ length: size }, () =>
    Array(size).fill(".")
  );

  // Fill grid
  for (let c of cars) {
    for (let i = 0; i < c.length; i++) {
      const r = c.dir === "H" ? c.row : c.row + i;
      const col = c.dir === "H" ? c.col + i : c.col;
      occupied[r][col] = c.id;
    }
  }

  if (car.dir === "H") {
    const newCol = car.col + step;

    for (let i = 0; i < car.length; i++) {
      if (newCol + i < 0 || newCol + i >= size) return false;
      if (
        occupied[car.row][newCol + i] !== "." &&
        occupied[car.row][newCol + i] !== car.id
      )
        return false;
    }
  } else {
    const newRow = car.row + step;

    for (let i = 0; i < car.length; i++) {
      if (newRow + i < 0 || newRow + i >= size) return false;
      if (
        occupied[newRow + i][car.col] !== "." &&
        occupied[newRow + i][car.col] !== car.id
      )
        return false;
    }
  }

  return true;
}

function heuristic(cars, size) {
  const red = cars.find(c => c.id === "X");

  let distance = size - (red.col + red.length);
  let blockers = 0;

  for (let c of cars) {
    if (
      c.id !== "X" &&
      c.dir === "V" &&
      c.col >= red.col + red.length
    ) {
      if (c.row <= red.row && c.row + c.length > red.row)
        blockers++;
    }
  }

  return distance + blockers;
}

function hashState(cars) {
  return cars
    .map(c => `${c.id}:${c.row},${c.col}`)
    .sort()
    .join("|");
}

function neighbors(cars, size) {
  const result = [];

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];

    if (canMove(car, cars, 1, size)) {
      const copy = cars.map(c => ({ ...c }));
      if (car.dir === "H") copy[i].col += 1;
      else copy[i].row += 1;
      result.push(copy);
    }

    if (canMove(car, cars, -1, size)) {
      const copy = cars.map(c => ({ ...c }));
      if (car.dir === "H") copy[i].col -= 1;
      else copy[i].row -= 1;
      result.push(copy);
    }
  }

  return result;
}

function isGoal(cars, size) {
  const red = cars.find(c => c.id === "X");
  return red.col + red.length === size;
}

// ===============================
// MAIN A*
// ===============================

export function aStar(initialCars, size ) {
  const openSet = [
    {
      cars: initialCars.map(c => ({ ...c })),
      g: 0,
      f: heuristic(initialCars, size),
      path: [initialCars.map(c => ({ ...c }))]
    }
  ];

  const visited = new Set();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    if (isGoal(current.cars, size)) {
      return { path: current.path };
    }

    visited.add(hashState(current.cars));

    for (let next of neighbors(current.cars, size)) {
      const key = hashState(next);

      if (!visited.has(key)) {
        openSet.push({
          cars: next.map(c => ({ ...c })),
          g: current.g + 1,
          f: current.g + 1 + heuristic(next, size),
          path: [
            ...current.path.map(p =>
              p.map(c => ({ ...c }))
            ),
            next.map(c => ({ ...c }))
          ]
        });
      }
    }
  }

  return { path: [] };
}
