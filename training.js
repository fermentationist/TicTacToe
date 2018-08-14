 const NeuralNetwork = require("./tictactoe-ai.js");
 const trainingData = require("./prep-data.js");
 const fs = require("fs");
 const {game,
		clearTerminal,
		cTable,
		math,
		clipOutput,
		adjustedRandomGaussian,
		reLu,
		jacobianMatrix,
		softmax,
		// softmax2,
		crossEntropyCostFunction,
		Layer,
		InputLayer,
		HiddenLayer,
		OutputLayer,
		Network} = NeuralNetwork;

const inputLayer0 = new InputLayer(9, {inputVector: [0,0,0,0,0,0,0,0,0]});
const hiddenLayer1 = new HiddenLayer(8, {inputVector: inputLayer0.outputSignal});
const hiddenLayer2 = new HiddenLayer(7, {inputVector: hiddenLayer1.outputSignal})
const outputLayer2 = new OutputLayer(3, {inputVector: hiddenLayer2.outputSignal});
const net = new Network([inputLayer0, hiddenLayer1, hiddenLayer2, outputLayer2]);

const trainingTest = async (data, epochs) =>{
	let out = await net.train(epochs,data);
	return out;
}

const sample = trainingData.slice(100,200);
trainingTest(trainingData, 1);
// net.saveState("test-save.json");
const data = JSON.stringify(net.layers);
fs.writeFile("saveState.json", outputLayer2.biases, "utf8", (err) => {
				console.log('data', data);
				console.error(err);
			});
// console.log('trainingData', trainingData);
