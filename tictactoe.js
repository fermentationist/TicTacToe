const inquirer = require("inquirer");

// process.stdout.write("\033c");//clear terminal

const Game = (() => {
	const grid = ["","","","","","","","",""];
	let nextPlayer = "X", playerOne;
	const winningPatterns = [
	[0,1,2], [0,4,8], [0,3,6], [1,4,7], [2,4,6], [2,5,8], [3,4,5], [6,7,8]
	];

	const clearTerminal = () => {
		return process.stdout.write("\033c");//clear terminal
	}

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
		clearTerminal();
		displayGrid();
		const inquiry = [{
			type: "list",
			message: "Play as 'X' or 'O'?\n('X' will play first)",
			name: "choice",
			choices: ["X", "O"]
		}];
		inquirer.prompt(inquiry)
			.then(answer => {
				playerOne = answer.choice;
				let welcome = `Welcome, Player ${playerOne}!\n`;
				if (playerOne === "O") {
					welcome += "Your opponent will play first.";
				} else {
					welcome += "You will play first.";
				}
				clearTerminal();
				displayGrid();
				console.log(welcome);
				setTimeout(() =>{turnLoop("X")}, 1000);
			});
	}

	const getMove = async function (player) {
		let func = player === playerOne ? getPlayerMove : getComputerMove;
		// return new Promise((resolve, reject) => {
		// 	resolve(func());
		// })
		return await func();
		
	}

	const getPlayerMove = () => {
		const inquiry = [{
			type: "list",
			message: `Choose a square to place your ${playerOne}`,
			name: "choice",
			choices: getOpenSquares()
		}];
		inquirer.prompt(inquiry)
			.then(answer => {
				console.log(`You chose ${answer.choice}`);
				return grid[parseInt(answer.choice) - 1] = playerOne;
			});	

	}

	const getComputerMove = () => {
		const options = getOpenSquares();
		const guess = Math.floor(Math.random() * options.length);
		console.log('raw guess', guess)
		console.log("computer's guess", options[guess] - 1);
		grid[parseInt(guess)] = nextPlayer;
		return displayGrid();
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
			if (patternResult !== false){
				winner = patternResult;
			}
		});
		return winner || !getOpenSquares().length ? "draw" : null;//winner name or "draw" or null if game is incomplete
	}

	function turnLoop (player) {
		let winner = determineWinner();
		if (winner){
			console.log("\n\n\nGame over!");
			let message = winner === "draw" ? "\nThe game was a draw.\nThanks for playing." : `Player ${winner} wins!\nCongratulations!`;
			return console.log(message);
		}
		// clearTerminal();
		displayGrid();
		getMove(player).then(() => {
				console.log("returned from async call.");
				console.log('nextPlayer', nextPlayer);
				nextPlayer = nextPlayer === "X" ? "O" : "X";
				console.log('nextPlayer', nextPlayer);
				return turnLoop(nextPlayer);
		});
	}
	// console.log("determineWinner test", determineWinner(["O","O","X","X","O","O","O","X","X"], winningPatterns))
	return {
		grid,
		getPlayerMove,
		getOpenSquares,
		determineWinner,
		displayGrid,
		start
	}
})();

Game.displayGrid();
Game.start();
















