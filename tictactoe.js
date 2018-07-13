const inquirer = require("inquirer");

// process.stdout.write("\033c");//clear terminal

const Game = (() => {
	const grid = ["","","","","","","","",""];
	let currentPlayer;
	const winningPatterns = [
	[0,1,2], [0,4,8], [0,3,6], [1,4,7], [2,4,6], [2,5,8], [3,4,5], [6,7,8]
	];

	const displayGrid = () => {
		const _ = grid;
		const underlined = "\x1b[4m";
		const white = "\x1b[37m"
		const resetStyle = "\x1b[0m";
		let firstRow =  `${_[0]||1}|${_[1]||2}|${_[2]||3}`;
		let secondRow = `${_[3]||4}|${_[4]||5}|${_[5]||6}`;
		let thirdRow =  `${_[6]||7}|${_[7]||8}|${_[8]||9}`;
		console.log(underlined + white, firstRow, resetStyle);
		console.log(underlined + white, secondRow, resetStyle);
		console.log(white, thirdRow, resetStyle);
	}

	const start = () => {
		process.stdout.write("\033c");//clear terminal
		displayGrid();
	}

	const getPlayerMove = (player) => {
		console.log("\x1b[31m\x1b[5m", `\n\n\nopenSquares = ${getOpenSquares()}`, "\x1b[0m");
		// console.log("\x1b[0m", "");
		const inquiry = [{
			type: "list",
			message: `Choose a square to place your ${player.name}`,
			name: "choice",
			choices: getOpenSquares()
		}];
		inquirer.prompt(inquiry)
			.then(answer => {
				console.log(`You chose ${answer.choice}`);
				grid[parseInt(answer.choice) - 1] = player.name;
				console.log('grid', grid);
			});
	}

	const getOpenSquares = () => {
		let opens = [];
		grid.map((square, index) => {
			!square.length ? opens.push(`${index + 1}`):null;
		});
		return opens;
	}

	const determineWinner = () => {
		let patternResult, winner;
		winningPatterns.map((pattern) => {
			patternResult = pattern.reduce((accumulator, currentValue) => {
				let player = grid[currentValue];
				if (accumulator === false){
					return false;
				}
				if (accumulator === 0){
					return player;
				}
				return player !== accumulator ? false : player;
			}, 0);// 0 sets initialValue of reduce so it won't skip first index
			console.log("patternResult:", patternResult);
			if (patternResult !== false){
				winner = patternResult;
			}
		});
		console.log("winner=", winner)
		return winner || !getOpenSquares().length ? "draw" : null;//winner name or "draw" or null if game is incomplete
	}

	const turnLoop = () => {
		let winner = determineWinner();
		if (winner){
			console.log("\n\n\nGame over!");
			let message = winner === "draw" ? "\nThe game was a draw.\nThanks for playing." : `Player ${winner} wins!\nCongratulations!`;
			return console.log(message);
		}
		displayGrid();
		getPlayerMove(currentPlayer);
		return turnLoop();
	}
	// console.log("determineWinner test", determineWinner(["O","O","X","X","O","O","O","X","X"], winningPatterns))
	return {
		grid,
		getPlayerMove,
		getOpenSquares,
		determineWinner,
		displayGrid
	}
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

Game.displayGrid();

















