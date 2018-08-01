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
test("02 new InputNeuron([1]).outputSignal = [1]", () => {
	expect(inputNeuron.outputSignal).toEqual([1]);
	expect(Array.isArray(inputNeuron.inputs)).toEqual(true);
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
test("07 zeroed HiddenNeuron(testInputs, softmax).outputSignal = 1", () => {
	expect(zeroedNeuron.outputSignal).toEqual([1]);
	expect(Array.isArray(inputNeuron.outputSignal)).toEqual(true);
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

test("16 OutputNeuron([0,1,2,-1]).activationFn.name to be 'softmax'", () => {
	expect(outNeuron.activationFn.name).toEqual("softmax");
});
test("17 OutputNeuron([0,1,2,-1]).inputs = [0,1,2]", () => {
	expect(outNeuron.inputs).toEqual([0,1,2, -1]);
	expect(Array.isArray(outNeuron.inputs)).toEqual(true);
});
test("18 OutputNeuron([0,1,2,-1]).weightedInputs = [0,outNeuron.weights[1],2 * outNeuron.weights[2], outNeuron.weights[3] * -1]", () => {
	expect(outNeuron.weightedInputs).toEqual([0, outNeuron.weights[1], (outNeuron.weights[2] * 2), outNeuron.weights[3] * -1]);
	expect(Array.isArray(outNeuron.weightedInputs)).toEqual(true);
});
test("19 OutputNeuron([0,1,2,-1]).activatedInputs", () => {
	let a1 = 0 * outNeuron.weights[0];
	let a2 = 1 * outNeuron.weights[1];
	let a3 = 2 * outNeuron.weights[2];
	let a4 = -1 * outNeuron.weights[3];
	let expected = softmax([a1, a2, a3, a4]);
	expect(outNeuron.activatedInputs).toEqual(expected);
	expect(Array.isArray(outNeuron.activatedInputs)).toEqual(true);
});
test("20 OutputNeuron([0,1,2,-1]).outputSignal", () => {
	let [w1, w2, w3, w4] = outNeuron.weights;
	let b = outNeuron.bias;
	let desiredOutput = softmax([(0 * w1), (1 * w2), (2 * w3), (-1 * w4)]);
	expect(outNeuron.outputSignal).toEqual(desiredOutput);
	expect(Array.isArray(outNeuron.outputSignal)).toEqual(true);
});

const threeOutNeuron = new OutputNeuron([1.8, 2, -1.75]);
const labels = threeOutNeuron.classLabels;
const certainty = mathjs.max(threeOutNeuron.outputSignal);
const threeOutPrediction = labels[threeOutNeuron.outputSignal.indexOf(certainty) - 1]
test("21 OutputNeuron([1.8, 2, -1.75]).prediction", () => {
	expect(threeOutNeuron.prediction).toEqual([threeOutPrediction, certainty]);
	expect(Array.isArray(threeOutNeuron.prediction)).toEqual(true);
});
test("22 OutputNeuron([1.8, 2, -1.75]).guess", () => {
	let guess = threeOutNeuron.outputSignal[2]
	expect(threeOutNeuron.guess).toEqual(guess);
	expect(typeof threeOutNeuron.guess).toEqual("number");
});
test("23 OutputNeuron([1.8, 2, -1.75]).error", () => {
	let threeOutError = threeOutNeuron.costFn(threeOutNeuron.guess, threeOutNeuron.actual);
	console.log('threeOutError', threeOutError);
	expect(threeOutNeuron.error).toEqual(threeOutError);
	expect(threeOutNeuron.error).not.toHaveLength(0);
	expect(threeOutNeuron.error).toContain
});





