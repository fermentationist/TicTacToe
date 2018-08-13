const jsonTrainingData = require ("./tictactoe-simulations.json");
const fs = require("fs");
let numberOfBoards = jsonTrainingData.length;
let outputArray = Array(numberOfBoards).fill(null);

const randomArrayIndex = (arrayLength) => {
	return Math.floor(Math.random() * (arrayLength + 1));
}
const outcomeKey = {
	"X": [0, 0, 1],
	"draw": [0, 1, 0],
	"O": [1, 0, 0]
}
const squareValues = {
	"O": 0,
	"": 1,
	"X": 2
}
jsonTrainingData.map(game => {
	let actuals = outcomeKey[game.outcome];
	
	game.moves.map(move => {
		let boardState = move.map(square => {
			return squareValues[square];
		});
		let board = {boardState, actuals};
		let randomSlot = randomArrayIndex(outputArray.length);
		outputArray[randomSlot] = board;
	});
});

module.exports = outputArray;

// fs.writeFile("prepped-ttt-data.json", JSON.stringify(outputArray), "utf8", (err) => console.error(err));
