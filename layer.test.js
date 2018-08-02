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
test("01 Layer(InputNeuron, 9, [0, 0, 0, 0, 0, 0, 0, 0, 0]).neurons.length = 9", () => {
	expect(layer0.neurons.length).toBe(9);
});
test("02 Layer(HiddenNeuron, 8, layer0.outputSignal).neurons.length = 8", () => {
	expect(layer1.neurons.length).toBe(8);
});
test("03 Layer(HiddenNeuron, 3, layer1.outputSignal).neurons.length = 3", () => {
	expect(layer2.neurons.length).toBe(3);
});

console.log(layer2.outputSignal);
console.log(layer2.results);

test("faketest", () => {
	expect(true).toBe(true);
})