const {	reLu,
		softmax,
		crossEntropyCostFunction,
		Neuron,
		InputNeuron,
		HiddenNeuron,
		OutputNeuron,
		Layer } = require("./tictactoe-ai.js");
// const HiddenNeuron = require("./tictactoe-ai.js").HiddenNeuron;
// const OutputNeuron = require("./tictactoe-ai.js").OutputNeuron;
const randomGaussian = require("random").normal(mu = 0, sigma = 1);
const mathjs = require("mathjs");
const inputNeuron = new InputNeuron([1]);
test("01 new InputNeuron([1]).inputs = [1]", () => {
	expect(inputNeuron.inputs).toEqual([1]);
	expect(Array.isArray(inputNeuron.inputs)).toEqual(true);
});
test("01.5 new InputNeuron([1]).weights.length = 0", () => {
	let numWeights = inputNeuron.weights === null ? 0 : inputNeuron.weights.length;
	expect(numWeights).toBe(0)
});

// ====================================================
const rand = Math.floor(Math.random() * 9) + 1;
const testInputs = Array(rand).fill(0);
const numInputs = testInputs.length;
const zeroedNeuron = new HiddenNeuron(testInputs);

test("06 zeroed HiddenNeuron(testInputs).inputs = testInputs", () => {
	expect(zeroedNeuron.inputs).toEqual(testInputs);
	expect(Array.isArray(inputNeuron.inputs)).toEqual(true);
});
test("06.5 zeroed HiddenNeuron(testInputs).weights.length = numInputs", () => {
	expect(zeroedNeuron.weights.length).toBe(numInputs);
});

// ====================================================
const reLuNeuron = new HiddenNeuron([0,1,2, -1]);

test("11.5 HiddenNeuron([0,1,2,-1]).weights.length = 4", () => {
	expect(reLuNeuron.weights.length).toBe(4);
});
test("12 HiddenNeuron([0,1,2,-1]).inputs = [0,1,2, -1]", () => {
	expect(reLuNeuron.inputs).toEqual([0,1,2, -1]);
	expect(Array.isArray(reLuNeuron.inputs)).toEqual(true);
});


// ====================================================

const outNeuron = new OutputNeuron([0,1,2, -1]);
test("16 OutputNeuron([0,1,2,-1]).weights.length = 4", () => {
	expect(outNeuron.weights.length).toBe(4);
});
test("17 OutputNeuron([0,1,2,-1]).inputs = [0,1,2, -1]", () => {
	expect(outNeuron.inputs).toEqual([0,1,2, -1]);
	expect(Array.isArray(outNeuron.inputs)).toEqual(true);
});







