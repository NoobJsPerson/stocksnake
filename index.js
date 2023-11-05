// Welcome to
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// This file can be a nice home for your Battlesnake logic and helper functions.
//
// To get you started we've included code to prevent your Battlesnake from moving backwards.
// For more info see docs.battlesnake.com

import runServer from './server.js';

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data
function info() {
	console.log("INFO");

	return {
		apiversion: "1",
		author: "StockSnake",       // TODO: Your Battlesnake Username
		color: "#ff0000", // TODO: Choose color
		head: "default",  // TODO: Choose head
		tail: "default",  // TODO: Choose tail
	};
}

function getTaxicabDistance(a, b) {
	return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstructPath(cameFrom, current) {
	const totalPath = [current];
	while (cameFrom.get(current)) {
		current = cameFrom.get(current);
		totalPath.unshift(current);
	}
	return totalPath;
}
function getNeighbors(gameState, node) {
	const neighbors = [];
	let isMoveSafe = {
		up: true,
		down: true,
		left: true,
		right: true
	};
	// TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
	const boardWidth = gameState.board.width;
	const boardHeight = gameState.board.height;
	if (node.x == 0) {
		console.log("Head is at left edge");
		isMoveSafe.left = false;
	}
	if (node.x == boardWidth - 1) {
		console.log("Head is at right edge");
		isMoveSafe.right = false;
	}
	if (node.y == 0) {
		console.log("Head is at bottom edge");
		isMoveSafe.down = false;
	}
	if (node.y == boardHeight - 1) {
		console.log("Head is at top edge");
		isMoveSafe.up = false;
	}


	// TODO: Step 2 - Prevent your Battlesnake from colliding with itself
	const { snakes } = gameState.board;
	for (let i = 0; i < snakes.length; i++) {
		for (let j = 0; j < snakes[i].body.length; j++) {
			const bodyPart = snakes[i].body[j];
			if (bodyPart.x == node.x - 1 && bodyPart.y == node.y) {
				console.log("Body is left of head");
				isMoveSafe.left = false;
			}
			if (bodyPart.x == node.x + 1 && bodyPart.y == node.y) {
				console.log("Body is right of head");
				isMoveSafe.right = false;
			}
			if (bodyPart.y == node.y - 1 && bodyPart.x == node.x) {
				console.log("Body is below of head");
				isMoveSafe.down = false;
			}
			if (bodyPart.y == node.y + 1 && bodyPart.x == node.x) {
				console.log("Body is above of head");
				isMoveSafe.up = false;
			}
		}
	}
	if (isMoveSafe.up) neighbors.push({ x: node.x, y: node.y + 1 })
	if (isMoveSafe.down) neighbors.push({ x: node.x, y: node.y - 1 })
	if (isMoveSafe.right) neighbors.push({ x: node.x + 1, y: node.y })
	if (isMoveSafe.left) neighbors.push({ x: node.x - 1, y: node.y })
	return neighbors
}
function aStar(start, goal, h, gameState) {
	const openSet = new Set([start]);
	const cameFrom = new Map();
	const gScore = new Map();
	const fScore = new Map();

	gScore.set(start, 0);
	fScore.set(start, h(start, goal));

	while (openSet.size > 0) {
		let current = null;
		let lowestFScore = Infinity;
		for (const node of openSet) {
			if (fScore.get(node) < lowestFScore) {
				current = node;
				lowestFScore = fScore.get(node);
			}
		}

		if (current.x === goal.x && current.y === goal.y) {
			return reconstructPath(cameFrom, current);
		}

		openSet.delete(current);

		// Replace 'neighbor' with your actual neighbor retrieval logic
		for (const neighbor of getNeighbors(gameState, current)) {
			const tentativeGScore = gScore.get(current) + 1;
			if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
				cameFrom.set(neighbor, current);
				gScore.set(neighbor, tentativeGScore);
				fScore.set(neighbor, tentativeGScore + h(neighbor, goal));
				if (!openSet.has(neighbor)) {
					openSet.add(neighbor);
				}
			}
		}
	}

	// Open set is empty, but the goal was never reached
	return null; // or handle the failure case as needed
}

// start is called when your Battlesnake begins a game
function start(_gameState) {
	console.log("GAME START");
}

// end is called when your Battlesnake finishes a game
function end(_gameState) {
	console.log("GAME OVER\n");
}

// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data
function move(gameState) {
	// We've included code to prevent your Battlesnake from moving backwards
	const myHead = gameState.you.body[0];
	const { food } = gameState.board.food;
	if (food.length > 1) {
		food.sort((a, b) => {
			getTaxicabDistance(myHead, a) - getTaxicabDistance(myHead, b);
		})
	}
	let apple = food[0];
	console.log(path[0], myHead)
	const path = aStar(myHead, apple, getTaxicabDistance, gameState);
	if (path.length > 2) {
		if (path[1].x - path[0].x == 1) return { move: 'right' }
		if (path[1].x - path[0].x == -1) return { move: 'left' }
		if (path[1].y - path[0].y == 1) return { move: 'up' }
		if (path[1].y - path[0].y == -1) return { move: 'down' }
	}
	return { move: "down" };

	// TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
	// Are there any safe moves left?
}

runServer({
	info: info,
	start: start,
	move: move,
	end: end
});
