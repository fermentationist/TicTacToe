console.log(process.argv[2]);

const Player = {
	moves: [],
	init: (name) => {
		this.name = name;
		return this;//allows chaining, i.e. Object.create(Proto).init(value)
	},
	set turn (square) {
		this.moves.push(square);
		return console.log(``);
	}
}

const playerX = Object.create(Player);
const playerO = Object.create(Player);

console.log("PlayerX = ", playerX);

const grid = [
	[["1"],["2"],["3"]],
	[["4"],["5"],["6"]],
	[["7"],["8"],["9"]]
	];

let winningPatterns = [
	["1", "2", "3"],
	["1", "5", "9"],
	["1", "4", "7"],
	["2", "5", "8"],
	["3", "5", "7"],
	["3", "6", "9"],
	["4", "5", "6"],
	["7", "8", "9"]
	];

const playTurn = (grid, player, square) => {
	console.log(`playTurn(${grid}, ${player}, ${square}) called.`)
	player.turn = square;
	console.log(player.moves);
}

const repeat = (func, n) => {
	return Array(n).map(() => func());
}

const d = grid[1][0];
console.log(`d = ${d}`);


// (playTurn(grid, playerX, "11").repeat(3));
let thingy =  Array(30, 0).map(() => {
	playTurn(grid, playerX, "11");
	return "O";
});
console.log(thingy);
console.log(`playerX moves: ${playerX.moves}`);