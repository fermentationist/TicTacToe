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
	expect(numWeights).toBe(0);
});
test("02 new InputNeuron([1]).outputSignal = 1", () => {
	expect(inputNeuron.outputSignal).toEqual(1);
	expect(typeof inputNeuron.outputSignal).toBe("number");
});
test("03 new InputNeuron([1]).weightedInputs = [1]", () => {
	expect(inputNeuron.weightedInputs).toEqual([1]);
	expect(Array.isArray(inputNeuron.inputs)).toEqual(true);
});
test("04 new InputNeuron([1]).activatedInputs = [1]", () => {
	expect(inputNeuron.activatedInputs).toEqual([1]);
	expect(Array.isArray(inputNeuron.inputs)).toEqual(true);
});
test("05 new InputNeuron([1]).activationFn is null", () => {
	expect(inputNeuron.activationFn).toBeNull();
});

// ====================================================
const rand = Math.floor(Math.random() * 9) + 1;
const testInputs = Array(rand).fill(0);
const numInputs = testInputs.length;
const zeroedNeuron = new HiddenNeuron(testInputs, softmax);

test("06 zeroed HiddenNeuron(testInputs, softmax).inputs = testInputs", () => {
	expect(zeroedNeuron.inputs).toEqual(testInputs);
	expect(Array.isArray(inputNeuron.inputs)).toEqual(true);
});
test("06.5 zeroed HiddenNeuron(testInputs, softmax).weights.length = numInputs", () => {
	expect(zeroedNeuron.weights.length).toBe(numInputs);
});
test("07 zeroed HiddenNeuron(testInputs, softmax).outputSignal = 1", () => {
	expect(zeroedNeuron.outputSignal).toEqual([1]);
	expect(Array.isArray(zeroedNeuron.outputSignal)).toEqual(true);
});
test("08 zeroed HiddenNeuron(testInputs, softmax).weightedInputs = testInputs", () => {
	expect(zeroedNeuron.weightedInputs.reduce((a,b) => a + b)).toEqual(0);
	expect(zeroedNeuron.weightedInputs).toHaveLength(numInputs);
	expect(Array.isArray(inputNeuron.weightedInputs)).toEqual(true);
});
test("09 zeroed HiddenNeuron(testInputs, softmax).activatedInputs = Array(numInputs).fill(1/numInputs)", () => {
	const output = Array(numInputs).fill(1/numInputs);
	expect(zeroedNeuron.activatedInputs).toEqual(output);
	expect(Array.isArray(inputNeuron.activatedInputs)).toEqual(true);
});
test("10 HiddenNeuron(testInputs).activationFn is truthy", () => {
	expect(zeroedNeuron.activationFn).toBeTruthy();
});

// ====================================================
const reLuNeuron = new HiddenNeuron([0,1,2, -1], reLu);
const Weights = reLuNeuron.weights;

test("11 HiddenNeuron([0,1,2,-1], reLu).activationFn.name to be 'reLu'", () => {
	expect(reLuNeuron.activationFn.name).toEqual("reLu");
});
test("11.5 HiddenNeuron([0,1,2,-1], reLu).weights.length = 4", () => {
	expect(reLuNeuron.weights.length).toBe(4);
});
test("12 HiddenNeuron([0,1,2,-1], reLu).inputs = [0,1,2]", () => {
	expect(reLuNeuron.inputs).toEqual([0,1,2, -1]);
	expect(Array.isArray(reLuNeuron.inputs)).toEqual(true);
});
test("13 HiddenNeuron([0,1,2,-1], reLu).weightedInputs = [0,reLuNeuron.weights[1],2 * reLuNeuron.weights[2], reLuNeuron.weights[3] * -1]", () => {
	expect(reLuNeuron.weightedInputs).toEqual([0, reLuNeuron.weights[1], (reLuNeuron.weights[2] * 2), reLuNeuron.weights[3] * -1]);
	expect(Array.isArray(reLuNeuron.weightedInputs)).toEqual(true);
});
test("14 HiddenNeuron([0,1,2,-1], reLu).activatedInputs = [0,reLuNeuron.weights[1],2 * reLuNeuron.weights[2]]", () => {
	let a2 = reLu(1 * reLuNeuron.weights[1]);
	let a3 = reLu(2 * reLuNeuron.weights[2]);
	let a4 = reLu(-1 * reLuNeuron.weights[3]);
	expect(reLuNeuron.activatedInputs).toEqual([0, a2, a3, a4]);
	expect(Array.isArray(reLuNeuron.activatedInputs)).toEqual(true);
});
test("15 HiddenNeuron([0,1,2,-1], reLu).outputSignal", () => {
	let [w1, w2, w3, w4] = reLuNeuron.weights;
	let b = reLuNeuron.bias;
	let desiredOutput = reLu((0 * w1) + (1 * w2) + (2 * w3) + (-1 * w4) + b);
	expect(reLuNeuron.outputSignal).toBeCloseTo(desiredOutput, 4);
	expect(typeof reLuNeuron.outputSignal).toEqual("number");
});

// ====================================================

const outNeuron = new OutputNeuron([0,1,2, -1]);
test("16 OutputNeuron([0,1,2,-1]).weights.length = 4", () => {
	expect(outNeuron.weights.length).toBe(4);
});
test("17 OutputNeuron([0,1,2,-1]).inputs = [0,1,2]", () => {
	expect(outNeuron.inputs).toEqual([0,1,2, -1]);
	expect(Array.isArray(outNeuron.inputs)).toEqual(true);
});
test("18 OutputNeuron([0,1,2,-1]).weightedInputs = [0,outNeuron.weights[1],2 * outNeuron.weights[2], outNeuron.weights[3] * -1]", () => {
	expect(outNeuron.weightedInputs).toEqual([0, outNeuron.weights[1], (outNeuron.weights[2] * 2), outNeuron.weights[3] * -1]);
	expect(Array.isArray(outNeuron.weightedInputs)).toEqual(true);
});


const threeOutNeuron = new OutputNeuron([1.8, 2, -1.75]);


test("21.5 OutputNeuron([1.8, 2, -1.75]).weights.length = 4", () => {
	expect(threeOutNeuron.weights.length).toBe(3);
});






