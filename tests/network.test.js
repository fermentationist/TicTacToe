const NeuralNetwork = require("../tictactoe-ai.js");
const {
	math,
	clipOutput,
	adjustedRandomGaussian,
	reLu,
	jacobianMatrix,
	softmax,
	// softmax2,
	crossEntropyCostFunction,
	loadState,
	Layer,
	InputLayer,
	HiddenLayer,
	OutputLayer,
	Network} = NeuralNetwork;
const {readFileSync} = require("fs");
const trainingData = require("../prepped-ttt-data.json");
const testLayer1 = new Layer(1, {inputVector: [0]});
const testLayer2 = new Layer(5, {inputVector: [0, 1, 2, 3, 4]});

const testLayer3 = new Layer(3, {inputVector: [0, 1, 2], activationFn: reLu});
const testLayer4 = new Layer(5, {inputVector: testLayer3.outputSignal, activationFn: reLu});
const testLayer5 = new InputLayer(9, {inputVector: [0, 0, 0, 0, 0, 0, 0, 0, 0], activationFn: reLu});
const testLayer6 = new HiddenLayer(5, {inputVector: [0, 0, 0, 0, 0, 0, 0, 0, 0]});
const testLayer7 = new OutputLayer(3, {inputVector: [0, 0, 0, 0, 0]});
const testNet1 = new Network([testLayer1]);
const testNet2 = new Network([testLayer2]);
const testNet3 = new Network([testLayer1, testLayer2]);
const testNet4 = new Network([testLayer3, testLayer4]);
const testNet5 = new Network([testLayer5, testLayer6, testLayer7]);
test("01. Network.layers === testLayer1", () =>{
	expect(testNet1.layers).toEqual([testLayer1]);
});

test("02. Network.output === []", () =>{
	expect(testNet1.output).toEqual([]);
});

test("03. Network.layers === testLayer2", () =>{
	expect(testNet2.layers).toEqual([testLayer2]);
});

test("04. Network.layers === [testLayer1, testLayer2]", () =>{
	expect(testNet3.layers).toEqual([testLayer1, testLayer2]);
});

test("05. activations.length === weights.length", () =>{
	testNet1.layers.map((layer => {
		expect(layer.activations.length).toEqual(layer.weights.length);
	}));
	testNet2.layers.map((layer => {
		expect(layer.activations.length).toEqual(layer.weights.length);
	}));
	testNet3.layers.map((layer => {
		expect(layer.activations.length).toEqual(layer.weights.length);
	}));
});

test("06. Network.feedForward(testExample)", () =>{
	const testExample = {boardState: [6, 6, 6]};
	testNet4.feedForward(testExample);
	expect(testNet4.layers[0].activations).toEqual(testExample.boardState);
	expect(testNet4.layers[1].activations).toEqual(testNet4.layers[0].outputSignal);
});

test("07. reLu activation function", () => {
	expect(reLu(5)).toEqual(5);
	expect(reLu(-2.5)).toEqual(-.025);
	expect(reLu([0, -2.5, 5, 200])).toEqual([0, -.025, 5, 200]);
});

test("08. softmax activation function", () => {
	expect(softmax([2, 1, 0.1])).toEqual([0.6590011388859679, 0.24243297070471395, 0.09856589040931818]);
});

// test("07. Network.backpropagate(actuals)", async () =>{
// 	const testExample = {boardState: [0, 1, 2], actuals: [0, 0, 1]};
// 	console.log("weights before:", JSON.stringify(testNet5.layers[1].weights, null, 2));
// 	const actuals = testNet5.feedForward(testExample);
// 	expect(testNet5.layers[0].activations).toEqual(testExample.boardState);
// 	expect(testNet5.layers[1].activations).toEqual(testNet5.layers[0].outputSignal);
// 	const results = testNet5.backpropagate(actuals);
// 	console.log("results:", results);
// 	console.log("weights after:", JSON.stringify(testNet5.layers[1].weights, null, 2));
// });

// test("08. Network.train(trainingData, epochs)", async () =>{
// 	const trainingData = JSON.parse(readFileSync("./prepped-ttt-data.json", "utf8")).slice(0, 100);
// 	testNet5.train(trainingData, 1);
// });




