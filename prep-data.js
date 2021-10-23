const jsonTrainingData = require ("./tictactoe-simulations.json");
const fs = require("fs");
let numberOfBoards = jsonTrainingData.length;

const randomArrayIndex = (arrayLength) => {
	return Math.floor(Math.random() * (arrayLength + 1));
}

const randomizeArray = array => {
	const inputArray = [...array];
	const outputArray = [];
	const arrayLength = inputArray.length;
	for(let i = 0; i < arrayLength; i++) {
		const randomIndex = randomArrayIndex(arrayLength);
		const randomItem = inputArray.splice(randomIndex, 1);
		outputArray.push(...randomItem);
	}
	return outputArray;
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

const outputArray = jsonTrainingData.reduce((boardArray, game) => {
	const actuals = outcomeKey[game.outcome];
	game.moves.forEach(move => {
		const boardState = move.map(square => {
			return squareValues[square];
		});
		boardArray.push({boardState, actuals});
	});
	return boardArray;
}, []);

const randomized = randomizeArray(outputArray);

module.exports = randomized;

fs.writeFile("prepped-ttt-data.json", JSON.stringify(randomized), "utf8", (err) => {
	console.error(err);
	console.log("done.")
});

