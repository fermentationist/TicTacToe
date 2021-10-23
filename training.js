 const NeuralNetwork = require("./tictactoe-ai.js");
 const trainingData = require("./prepped-ttt-data.json");
 const fs = require("fs");
 const {game,
		clearTerminal,
		cTable,
		math,
		loadState,
		// rehydrate,
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

const inputLayer0 = new InputLayer(9, {inputVector: [1, 1, 1, 1, 1, 1, 1, 1, 1] });
const hiddenLayer1 = new HiddenLayer(8, {inputVector: inputLayer0.outputSignal});
// const hiddenLayer2 = new HiddenLayer(7, {inputVector: hiddenLayer1.outputSignal});
const hiddenLayer3 = new HiddenLayer(6, {inputVector: hiddenLayer1.outputSignal});
const outputLayer4 = new OutputLayer(3, {inputVector: hiddenLayer3.outputSignal});
const net = new Network([inputLayer0, hiddenLayer1, hiddenLayer3, outputLayer4]);

const outputLayer1 = new OutputLayer(3, {inputVector: inputLayer0.outputSignal});
const net2 =  new Network([{...inputLayer0}, outputLayer1])


// const sample = trainingData.slice(100,200);
// trainingTest(sample, 1).then(()=>net.saveState("testfile.json"));
// let net = new Network();
// let loadedNet;
// loadState("testfile.json").then(rehydratedNetwork => {
// 	console.log('rehydratedNetwork', rehydratedNetwork);
// 	rehydratedNetwork.train(sample, 1);
// });
// const rehydratedNetwork = loadState(fileName);

if (require.main === module) {
	// console.log("net.layers[1].weights", net.layers[1].weights);
	const sample = trainingData.slice(0, 10000);
	if (true) {
		const loadedNet = loadState("testfile.json");
		loadedNet.train(sample, 1);
	} else {
		net.train(sample, 1);
		// console.log("net.layers[1].weights", net.layers[1].weights);
		net.saveState("testfile.json");
		process.exit(0);
	}
}
