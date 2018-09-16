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
console.log('inputLayer0.outputSignal', inputLayer0.outputSignal);
const hiddenLayer1 = new HiddenLayer(8, {inputVector: inputLayer0.outputSignal});
console.log('hiddenLayer1.outputSignal', hiddenLayer1.outputSignal);
const hiddenLayer2 = new HiddenLayer(7, {inputVector: hiddenLayer1.outputSignal})
const outputLayer3 = new OutputLayer(3, {inputVector: hiddenLayer2.outputSignal});
const net = new Network([inputLayer0, hiddenLayer1, hiddenLayer2, outputLayer3]);

const outputLayer1 = new OutputLayer(3, {inputVector: inputLayer0.outputSignal});
const net2 =  new Network([inputLayer0, outputLayer1])


const sample = trainingData.slice(100,200);
// trainingTest(sample, 1).then(()=>net.saveState("testfile.json"));
// let net = new Network();
// let loadedNet;
loadState("testfile.json").then(rehydratedNetwork => {
	console.log('rehydratedNetwork', rehydratedNetwork);
	rehydratedNetwork.train(sample, 1);
});


// const trainingTest = async (data, epochs) =>{
// 	let out = await net2.train(data, epochs);
// 	return out;
// }
// loadedNet.train(sample,1)
// trainingTest(sample, 1)
