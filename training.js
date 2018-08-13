 const NeuralNetwork = require("./tictactoe-ai.js");
 const trainingData = require("./prep-data.js");
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

const inputLayer0 = new InputLayer(9, {inputVector: [1,2,0,1,2,1,1,0,1]});
const hiddenLayer1 = new HiddenLayer(8, {inputVector: inputLayer0.outputSignal});

const outputLayer2 = new OutputLayer(3, {inputVector: hiddenLayer1.outputSignal});
const net = new Network([inputLayer0, hiddenLayer1, outputLayer2]);

const trainingTest = async (data, epochs) =>{
	let out = await net.train(epochs,data);
	return out;
}

const sample = trainingData.slice(100,200);
trainingTest(sample, 10000);
// console.log('trainingData', trainingData);
