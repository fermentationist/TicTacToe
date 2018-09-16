const TicTacToe = (() => {
	const inquirer = require("inquirer");
	const fs = require("fs");
	const Game = {
		grid: ["","","","","","","","",""],
		nextPlayer: "X",
		humanPlayer: undefined,
		winningPatterns: [
			[0,1,2], [0,4,8], [0,3,6], [1,4,7], [2,4,6], [2,5,8], [3,4,5], [6,7,8]
		],
		history: {
			playerOne: null,
			moves: [],
			outcome: null	
		}
	}

	const clearTerminal = () => {
		// return process.stdout.write("\033c");//clear terminal
	}

	const displayGrid = (game) => {
		const _ = game.grid;
		const underlined = "\x1b[4m";
		const white = "\x1b[37m";
		const resetStyle = "\x1b[0m";
		let firstRow =  `${_[0]||1}|${_[1]||2}|${_[2]||3}`;
		let secondRow = `${_[3]||4}|${_[4]||5}|${_[5]||6}`;
		let thirdRow =  `${_[6]||7}|${_[7]||8}|${_[8]||9}`;
		console.log("\n");
		console.log(underlined + white, firstRow, resetStyle);
		console.log(underlined + white, secondRow, resetStyle);
		console.log(white, thirdRow, resetStyle);
		return console.log("\n");
	}

	const deepCopy = (obj) => {
		// return {... obj};// now we can maybe do this instead? 
		return JSON.parse(JSON.stringify(obj))
	}

	const newGame = () => {
		return Object.create(deepCopy(Game));
	}

	const startGame = () => {
		const game = newGame();
		console.log('game.history', game.history);
		clearTerminal();
		const inquiry = [{
			type: "list",
			message: "Play as 'X' or 'O'?\n('X' will play first)",
			name: "choice",
			choices: ["X", "O"]
		}];
		inquirer.prompt(inquiry)
			.then(answer => {
				game.humanPlayer = answer.choice;
				game.history.humanPlayer = answer.choice;
				let welcome = `Welcome, Player ${game.humanPlayer}!\n`;
				if (game.humanPlayer === "O") {
					welcome += "The computer will play first.";
				} else {
					welcome += "You will play first.";
				}
				clearTerminal();
				displayGrid(game);
				console.log(welcome);
				setTimeout(() =>{turnLoop(game)}, 1000);
			});
	}

	const runRandomSimulations = async function (reps, playerOne = "X") {
		const simulations = [];
		for (let i = 0; i < reps; i++){
			const game = newGame();
			game.humanPlayer = game.history.playerOne = playerOne;
			const gameResult = await simulationTurnLoop(game);
			simulations.push(gameResult);
		}

		fs.writeFile("tictactoe-simulations.json", JSON.stringify(simulations), "utf8", (err) => console.error(err));
		return simulations;
	}

	const simulationTurnLoop = async function (game) {
		let winner = determineWinner(game);
		if (winner){
			game.history.outcome = winner;
			return game.history;
		}
		const move =  await getStupidComputerMove(game);
		recordMove(game);
		game.grid[move - 1] = game.nextPlayer;
		game.nextPlayer = game.nextPlayer === "X" ? "O" : "X";
		return simulationTurnLoop(game);
	}


	const turnLoop = async function (game) {
		let winner = determineWinner(game);
		if (winner){
			game.history.outcome = winner;
			clearTerminal();
			displayGrid(game);
			console.log("\n\nGame over!");
			let message = winner === game.humanPlayer ? `\nCongratulations, Player ${winner}, you win! 🏆` : winner === "draw" ? "\nThe game was a draw. 😐" : "You were defeated by the computer. 😖"
			console.log(message);
			return playAgain(game);
		}
		clearTerminal();
		displayGrid(game);
		const move =  await getMove(game);
		recordMove(game);
		clearTerminal();
		displayGrid(game);
		game.grid[move - 1] = game.nextPlayer;
		game.nextPlayer = game.nextPlayer === "X" ? "O" : "X";
		setTimeout(() => {
			return turnLoop(game);
		}, 999)
	}

	const getMove = (game) => {
		let func = game.nextPlayer === game.humanPlayer ? getPlayerMove : getStupidComputerMove;
		return func(game);
	}

	const getPlayerMove = async function (game) {
		const inquiry = [{
			type: "list",
			message: `Choose a square to place your ${game.humanPlayer}`,
			name: "move",
			choices: getOpenSquares(game.grid)
		}];
		const move = await inquirer.prompt(inquiry)
			.then(answer => {
				console.log(`You chose ${answer.move}`);
				return answer.move;
			});	
		return move;
	}

	//currently returns a random move
	const getStupidComputerMove = (game) => {
		const openSquares = getOpenSquares(game.grid);
		const guessIndex = Math.floor(Math.random() * openSquares.length);
		// console.log(`The computer chooses square ${openSquares[guessIndex]}`);
		return openSquares[guessIndex];
	}

	const getOpenSquares = (grid) => {
		let opens = [];
		grid.map((square, index) => {
			!square.length ? opens.push(`${index + 1}`):null;
		});
		return opens;
	}

	const determineWinner = (game) => {
		let patternResult, winner;
		game.winningPatterns.map((pattern) => {
			patternResult = pattern.reduce((accumulator, currentValue) => {
				let player = game.grid[currentValue];
				if (accumulator === 0){
					return player;
				}
				if (accumulator === false){
					return false;
				}
				return player !== accumulator ? false : player;
			}, 0);// 0 sets initialValue of reduce so it won't skip first index
			if (patternResult !== false){
				winner = patternResult;
			}
		});
		return winner ? winner : !getOpenSquares(game.grid).length ? "draw" : null;//return winner, if any, null if game is not over, draw if all squares are filled and there is still no winner
	}

	const playAgain = (game) => {
		console.log("\nhistory:", game.history)
		const inquiry = [{
			type: "confirm",
			message: "Would you like to play again?",
			name: "choice"
		}];
		inquirer.prompt(inquiry).then((answer) => {
			return answer.choice ? startGame() : process.exit();
		});
	}

	const recordMove = (game) => {
		return game.history.moves.push(deepCopy(game.grid));
	}

	return {
		clearTerminal,
		deepCopy,
		Game,
		startGame,
		newGame,
		runRandomSimulations
	}
})();

module.exports = TicTacToe
// TicTacToe.startGame();

TicTacToe.runRandomSimulations(10000);

// const sims = require("./tictactoe-simulations.json");
// console.log("sims[0] = ", sims[1000]);

