 const cTable = require("console.table");
 const NeuralNetwork = require("./tictactoe-ai.js");
 const {math,
 		reLu,
		softmax,
		crossEntropyCostFunction,
		Neuron,
		OutputNeuron,
		Layer,
		InputLayer,
		HiddenLayer,
		OutputLayer,
		Network} = NeuralNetwork;

const inputLayer = new InputLayer(9, [1, 0, 1, 0, -1, 0, -1, 0, 0]);
const hiddenLayer = new HiddenLayer(8, inputLayer.outputSignal);
const outputLayer = new OutputLayer(3, hiddenLayer.outputSignal);
// console.log('outputLayer.weights', outputLayer.weights)
outputLayer.actuals = [0,1,0];
const netwerk = new Network([inputLayer, hiddenLayer, outputLayer]);

netwerk.feedForward([0,0,0,1,-1,-1,0,1,0]);
// netwerk.backprop ([0, 1, 0]);
console.table('netwerk.layers[2].results', netwerk.layers[2].results);
console.table('netwerk.layers[2].totalError', netwerk.layers[2].totalError);
// console.log('netwerk.layers[2].neurons', netwerk.layers[2].neurons)
// test("outputLayer.outputSignal outputs total 1", () => {
// 	expect(outputLayer.outputSignal.reduce((accum, output) => accum + output)).toBeCloseTo(1,5);
// })

// test("fake", ()=>expect(true).toBe(true));
let mAb = [
	[0,1,2,3],
	[0,1,2,3],
	[0,1,2,3]
]

let mBb = [
	[0,.1,.2,.3],
	[0,.2,.4,.6],
	[0,.1,.2,.3]
]
let mA = mAb//math.transpose(mAb);
console.log('mA', mA)
let mB = math.transpose(mBb)
console.log('mB', mB)
console.table(math.multiply(mA, mB));
