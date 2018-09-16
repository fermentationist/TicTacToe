const NeuralNetwork = require("../tictactoe-ai.js");
const {game,
	clearTerminal,
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

// test("fake", () => expect(true).toBe(true));

const testLayer1 = new Layer(1, {inputVector: [0]});
const testLayer2 = new Layer(5, {inputVector: [0, 1, 2, 3, 4]});

const testLayer3 = new Layer(3, {inputVector: [0, 1, 2], activationFn: reLu});
const testLayer4 = new Layer(5, {inputVector: testLayer3.outputSignal, activationFn: reLu});

console.log('testLayer1', testLayer1);
const testNet1 = new Network([testLayer1]);
const testNet2 = new Network([testLayer2]);
const testNet3 = new Network([testLayer1, testLayer2]);
const testNet4 = new Network([testLayer3, testLayer4]);

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
	console.log('testNet1', testNet1);
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

// const test = (title, fn) => {
// 	console.log(title);
// 	return fn();
// 	}

test("06. Network.feedForward(testExample)", () =>{
	const testExample = {boardState: [6, 6, 6]};
	console.log('testExample.boardState', testExample.boardState);
	console.log('testNet4.layers[0].weights', testNet4.layers[0].weights);
	testNet4.feedForward(testExample);
	expect(testNet4.layers[0].activations).toEqual(testExample.boardState);
	console.log('testNet4.layers[0].outputSignal', testNet4.layers[0].outputSignal);
	expect(testNet4.layers[1].activations).toEqual(testNet4.layers[0].outputSignal);
});




