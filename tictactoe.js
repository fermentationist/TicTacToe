const inquirer = require("inquirer");

// process.stdout.write("\033c");//clear terminal

const Game = (() => {
	const grid = ["","","","","","","","",""];

	
	return {
		grid,
		get openSquares () {
			let opens = [];
			console.log('this.grid', grid);
			grid.map((square, index) => {
				!square.length ? opens.push(`${index + 1}`):null;
				console.log(opens);
			});
			return opens;
		},

		getPlayerMove (player) {
			console.log(`\n\n\nopenSquares = ${this.openSquares}`);
			const inquiry = [{
				type: "list",
				message: `Choose a square to place your ${player.name}`,
				name: "choice",
				choices: this.openSquares
			}];
			inquirer.prompt(inquiry)
				.then(answer => {
					console.log(`You chose ${answer.choice}`);
					this.grid[parseInt(answer.choice) - 1] = player.name;
					console.log('grid', this.grid);
				});
		}
	}
	
	// let openSquares = [];
	// grid.map((square, index) => {
	// 	if (!square.length){
	// 		openSquares.push(index + 1);
	// 	}
	// });
	// get openSquares () {
	// 	let opens = [];
	// 	this.grid.map((square, index) => {
	// 		!square.length ? opens.push(index + 1):null;
	// 		return opens;
	// 	});
	// }


	// toExport.getPlayerMove = (player) => {
	// 	console.log("\n\n\n");
	// 	const inquiry = [{
	// 		type: "list",
	// 		message: `Choose a square to place your ${player.name}`,
	// 		name: "choice",
	// 		choices: openSquares
	// 	}];
	// 	inquirer.prompt(inquiry)
	// 		.then(answer => {
	// 			console.log(`You chose ${answer.choice}`);
	// 			this.grid[parseInt(answer.choice) - 1] = player.name;
	// 			console.log('grid', this.grid);
	// 		});
	// }

	// // const gameIsOver = (grid, openSquares) => {
	// // 	if (!openSquares.length){
	// // 		return true;
	// // 	}

	// // }
	// console.log("grid=",toExport.grid);

	// return toExport;//
	// 	{
	// 	// openSquares,
	// 	get openSquares () {
	// 		let opens = [];
	// 		this.grid.map((square, index) => {
	// 			!square.length ? opens.push(index + 1):null;
	// 			console.log(opens);
	// 			return opens;
	// 		});
	// 	},
	// 	grid: this.grid,
	// 	getPlayerMove: getPlayerMove
	// }
})();

console.log('Game', Game.openSquares);
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

const playerX = Object.create(Player).init("X");
const playerO = Object.create(Player);

console.log("PlayerX = ", playerX);


console.log(`playerX moves: ${playerX.moves}`);

Game.getPlayerMove(playerX);


console.log('Game.openSquares', Game.openSquares);




















