 const NeuralNetwork = require("./tictactoe-ai.js");
 const trainingData = require("./prep-data.js");
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

const inputLayer0 = new InputLayer(9, {inputVector: [0,0,0,0,0,0,0,0,0]});
const hiddenLayer1 = new HiddenLayer(8, {inputVector: inputLayer0.outputSignal});
const hiddenLayer2 = new HiddenLayer(7, {inputVector: hiddenLayer1.outputSignal})
const outputLayer2 = new OutputLayer(3, {inputVector: hiddenLayer2.outputSignal});
const net = new Network([inputLayer0, hiddenLayer1, hiddenLayer2, outputLayer2]);



const sample = trainingData.slice(100,200);
// trainingTest(sample, 1).then(()=>net.saveState("testfile.json"));
// let net = new Network();
// let loadedNet;
// loadState("testfile.json").then(rehydratedNetwork => {
// 	console.log('rehydratedNetwork', rehydratedNetwork);
// 	rehydratedNetwork.train(sample, 1);
// });


const trainingTest = async (data, epochs) =>{
	let out = await net.train(data, epochs);
	return out;
}
// loadedNet.train(sample,1)
trainingTest(sample, 1)
