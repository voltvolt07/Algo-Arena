
const rows = 25;
const cols = 25;

const grid = document.getElementById("grid");
const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const endBtn = document.getElementById("endBtn");
const wallBtn = document.getElementById("wallBtn");
const clearBtn = document.getElementById("clearBtn");
const mudBtn = document.getElementById("mudBtn");
const dijkstraBtn = document.getElementById("dijkstraBtn");

// Current mode
let mode = "wall";

// Start and end positions
let startNode = null;
let endNode = null;

// Store all cells
let cells = [];

// Create the grid
function createGrid() {

    grid.innerHTML = "";
    cells = [];

    for (let row = 0; row < rows; row++) {

        cells[row] = [];

        for (let col = 0; col < cols; col++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");

            cell.dataset.row = row;
            cell.dataset.col = col;

            // Handle cell clicks
            cell.addEventListener("click", function() {
                handleCellClick(row, col);
            });

            grid.appendChild(cell);

            cells[row][col] = cell;
        }
    }
}

// Handle clicking a cell
function handleCellClick(row, col) {

    const cell = cells[row][col];

    if (mode === "start") {

        // Remove old start
        if (startNode !== null) {
            cells[startNode.row][startNode.col]
                .classList.remove("start");
        }

        startNode = { row, col };

        cell.classList.remove("wall", "end");
        cell.classList.add("start");

        message.textContent = "Start point selected!";

    } else if (mode === "end") {

        // Remove old end
        if (endNode !== null) {
            cells[endNode.row][endNode.col]
                .classList.remove("end");
        }

        endNode = { row, col };

        cell.classList.remove("wall", "start");
        cell.classList.add("end");

        message.textContent = "End point selected!";

    } else if (mode === "wall") {

        // Don't place a wall on start or end
        if (
            cell.classList.contains("start") ||
            cell.classList.contains("end")
        ) {
            return;
        }

        cell.classList.toggle("wall");

        message.textContent = "Wall added or removed!";
    }

    else if (mode === "mud") {

    if (
        cell.classList.contains("start") ||
        cell.classList.contains("end") ||
        cell.classList.contains("wall")
    ) {
        return;
    }

    cell.classList.toggle("mud");

    message.textContent = "Mud added or removed!";
}
}

// Change mode to start
startBtn.addEventListener("click", function() {

    mode = "start";

    message.textContent =
        "Click a cell to select the start point.";

});

// Change mode to end
endBtn.addEventListener("click", function() {

    mode = "end";

    message.textContent =
        "Click a cell to select the end point.";

});

// Change mode to walls
wallBtn.addEventListener("click", function() {

    mode = "wall";

    message.textContent =
        "Click cells to add or remove walls.";

});

mudBtn.addEventListener("click", function() {

    mode = "mud";

    message.textContent =
        "Click cells to add or remove mud.";

});

// Clear walls
clearBtn.addEventListener("click", function() {

    for (let row = 0; row < rows; row++) {

        for (let col = 0; col < cols; col++) {

            cells[row][col].classList.remove("wall", "mud");

        }
    }

    message.textContent = "All walls cleared!";

});


const bfsBtn = document.getElementById("bfsBtn");
const dfsBtn = document.getElementById("dfsBtn");

// BFS algorithm
function bfs() {

    if (startNode === null || endNode === null) {
        message.textContent =
            "Please select a start and end point first!";
        return null;
    }

    // Queue stores cells waiting to be explored
    const queue = [startNode];

    // Track cells already visited
    const visited = new Set();

    // Store where each cell came from
    const parent = new Map();

    // Store the order in which cells are explored
    const explored = [];

    // Start from the starting node
    visited.add(`${startNode.row},${startNode.col}`);

    let found = false;

    // Possible movement directions:
    // Up, Down, Left, Right
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    // Process the queue
    while (queue.length > 0) {

        const current = queue.shift();

        explored.push(current);

        // Check if we reached the destination
        if (
            current.row === endNode.row &&
            current.col === endNode.col
        ) {
            found = true;
            break;
        }

        // Explore neighboring cells
        for (const [dr, dc] of directions) {

            const newRow = current.row + dr;
            const newCol = current.col + dc;

            // Check grid boundaries
            if (
                newRow < 0 ||
                newRow >= rows ||
                newCol < 0 ||
                newCol >= cols
            ) {
                continue;
            }

            const neighbor = cells[newRow][newCol];

            // Skip walls
            if (neighbor.classList.contains("wall")) {
                continue;
            }

            const key = `${newRow},${newCol}`;

            // Skip already visited cells
            if (visited.has(key)) {
                continue;
            }

            // Mark as visited
            visited.add(key);

            // Remember the previous cell
            parent.set(key, current);

            // Add to queue
            queue.push({
                row: newRow,
                col: newCol
            });
        }
    }

    // If destination wasn't found
    if (!found) {
        return {
            explored,
            path: []
        };
    }

    // Reconstruct the path
    const path = [];

    let current = endNode;

    while (current !== undefined) {

        path.push(current);

        const key = `${current.row},${current.col}`;

        current = parent.get(key);
    }

    // Reverse to get start -> end
    path.reverse();

    return {
        explored,
        path
    };
}


// Animate the BFS result
function animateBFS(result) {

    if (result === null) {
        return;
    }

    const { explored, path } = result;

    // Reset previous visualization
    for (let row = 0; row < rows; row++) {

        for (let col = 0; col < cols; col++) {

            cells[row][col].classList.remove(
                "visited",
                "path"
            );
        }
    }

    // Animate explored cells
    explored.forEach((node, index) => {

        setTimeout(() => {

            const cell = cells[node.row][node.col];

            if (
                !cell.classList.contains("start") &&
                !cell.classList.contains("end")
            ) {
                cell.classList.add("visited");
            }

        }, index * 20);

    });

    // Animate final path
    setTimeout(() => {

        if (path.length === 0) {

            message.textContent =
                "No path found! Try removing some walls.";

            return;
        }

        path.forEach((node, index) => {

            setTimeout(() => {

                const cell = cells[node.row][node.col];

                if (
                    !cell.classList.contains("start") &&
                    !cell.classList.contains("end")
                ) {
                    cell.classList.remove("visited");
                    cell.classList.add("path");
                }

            }, index * 40);

        });

        message.textContent =
            `BFS found a path! Path length: ${path.length - 1}`;

    }, explored.length * 20);

}


function dfs() {

    if (startNode === null || endNode === null) {
        message.textContent =
            "Please select a start and end point first!";
        return null;
    }

    // Stack stores cells waiting to be explored
    const stack = [startNode];

    // Track visited cells
    const visited = new Set();

    // Store previous cell for path reconstruction
    const parent = new Map();

    // Store exploration order
    const explored = [];

    visited.add(`${startNode.row},${startNode.col}`);

    let found = false;

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    while (stack.length > 0) {

        // Take the last cell added
        const current = stack.pop();

        explored.push(current);

        // Check destination
        if (
            current.row === endNode.row &&
            current.col === endNode.col
        ) {
            found = true;
            break;
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {

            const newRow = current.row + dr;
            const newCol = current.col + dc;

            // Check boundaries
            if (
                newRow < 0 ||
                newRow >= rows ||
                newCol < 0 ||
                newCol >= cols
            ) {
                continue;
            }

            const neighbor = cells[newRow][newCol];

            // Avoid walls
            if (neighbor.classList.contains("wall")) {
                continue;
            }

            const key = `${newRow},${newCol}`;

            // Avoid visited cells
            if (visited.has(key)) {
                continue;
            }

            visited.add(key);

            parent.set(key, current);

            // Add neighbor to stack
            stack.push({
                row: newRow,
                col: newCol
            });
        }
    }

    // Destination not reached
    if (!found) {
        return {
            explored,
            path: []
        };
    }

    // Reconstruct path
    const path = [];

    let current = endNode;

    while (current !== undefined) {

        path.push(current);

        const key = `${current.row},${current.col}`;

        current = parent.get(key);
    }

    path.reverse();

    return {
        explored,
        path
    };
}


function dijkstra() {

    if (startNode === null || endNode === null) {
        message.textContent =
            "Please select a start and end point first!";
        return null;
    }

    // Store cells and their current costs
    const distances = new Map();

    // Store previous cells
    const parent = new Map();

    // Store visited cells
    const visited = new Set();

    // Store exploration order
    const explored = [];

    const startKey =
        `${startNode.row},${startNode.col}`;

    const endKey =
        `${endNode.row},${endNode.col}`;

    distances.set(startKey, 0);

    // Priority queue (simple array version)
    const queue = [
        {
            node: startNode,
            cost: 0
        }
    ];

    let found = false;

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    while (queue.length > 0) {

        // Sort so the lowest-cost cell comes first
        queue.sort((a, b) => a.cost - b.cost);

        // Remove lowest-cost cell
        const currentItem = queue.shift();

        const current = currentItem.node;

        const currentKey =
            `${current.row},${current.col}`;

        // Skip already visited cells
        if (visited.has(currentKey)) {
            continue;
        }

        visited.add(currentKey);

        explored.push(current);

        // Check destination
        if (currentKey === endKey) {
            found = true;
            break;
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {

            const newRow = current.row + dr;
            const newCol = current.col + dc;

            // Check boundaries
            if (
                newRow < 0 ||
                newRow >= rows ||
                newCol < 0 ||
                newCol >= cols
            ) {
                continue;
            }

            const neighbor = cells[newRow][newCol];

            // Avoid walls
            if (neighbor.classList.contains("wall")) {
                continue;
            }

            const neighborKey =
                `${newRow},${newCol}`;

            if (visited.has(neighborKey)) {
                continue;
            }

            // Normal cell costs 1
            let cellCost = 1;

            // Mud costs 5
            if (neighbor.classList.contains("mud")) {
                cellCost = 5;
            }

            // Calculate new path cost
            const newCost =
                currentItem.cost + cellCost;

            const oldCost =
                distances.get(neighborKey) ?? Infinity;

            // Update only if we found a cheaper path
            if (newCost < oldCost) {

                distances.set(neighborKey, newCost);

                parent.set(neighborKey, current);

                queue.push({
                    node: {
                        row: newRow,
                        col: newCol
                    },
                    cost: newCost
                });
            }
        }
    }

    // Destination not reached
    if (!found) {
        return {
            explored,
            path: [],
            cost: Infinity
        };
    }

    // Reconstruct path
    const path = [];

    let current = endNode;

    while (current !== undefined) {

        path.push(current);

        const key =
            `${current.row},${current.col}`;

        current = parent.get(key);
    }

    path.reverse();

    return {
        explored,
        path,
        cost: distances.get(endKey)
    };
}




// Run BFS when button is clicked
bfsBtn.addEventListener("click", function() {

    const result = bfs();

    animateBFS(result);

});

dfsBtn.addEventListener("click", function() {

    const result = dfs();

    animateBFS(result);

});

dijkstraBtn.addEventListener("click", function() {

    const result = dijkstra();

    animateBFS(result);

    if (result !== null && result.path.length > 0) {

        message.textContent =
            `Dijkstra found a path! Total cost: ${result.cost}`;

    }

});


// Start the application
createGrid();

