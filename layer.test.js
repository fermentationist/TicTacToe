 const {	reLu,
		softmax,
		crossEntropyCostFunction,
		Neuron,
		InputNeuron,
		HiddenNeuron,
		OutputNeuron,
		Layer,
		InputLayer,
		HiddenLayer,
		OutputLayer } = require("./tictactoe-ai.js");

const layer0 = new InputLayer(9, [1, 0, 1, 0, -1, 0, -1, 0, 0]);
const layer1 = new HiddenLayer(8, layer0.outputSignal);
const layer2 = new OutputLayer(3, layer1.outputSignal);
test("01 InputLayer(9, [1, 0, 1, 0, -1, 0, -1, 0, 0]).neurons.length = 9", () => {
	expect(layer0.neurons.length).toBe(9);
});
test("02 InputLayer(9, [1, 0, 1, 0, -1, 0, -1, 0, 0]).outputSignal.length = 9", () => {
	expect(layer0.outputSignal.length).toEqual(9);
});
test("03 HiddenLayer(8, layer0.outputSignal).neurons.length = 8", () => {
	expect(layer1.neurons.length).toBe(8);
});
test("04 HiddenLayer(8, layer0.outputSignal).outputSignal.length = 8", () => {
	expect(layer1.outputSignal.length).toBe(8);
});
test("05 OutputLayer(3, layer1.outputSignal).neurons.length = 3", () => {
	expect(layer2.neurons.length).toBe(3);
});
test("06 OutputLayer(3, layer1.outputSignal).outputSignal.length = 3", () => {
	expect(layer2.outputSignal.length).toBe(3);
});
test("07 OutputLayer(3, layer1.outputSignal).outputSignal is Array", () => {
	expect(Array.isArray(layer2.outputSignal)).toBe(true);
});
test("08 OutputLayer(3, layer1.outputSignal).results add to 1", () => {
	expect(Object.values(layer2.results).reduce((s,n) => s + n)).toBeCloseTo(1, 8);
});

console.log(layer2.results);
layer2.backprop(layer2.actuals);
