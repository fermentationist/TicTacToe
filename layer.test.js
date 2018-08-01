 const {	reLu,
		softmax,
		crossEntropyCostFunction,
		Neuron,
		InputNeuron,
		HiddenNeuron,
		OutputNeuron,
		Layer } = require("./tictactoe-ai.js");

const layer0 = new Layer(InputNeuron, 9, [0, 0, 1, 0, 0, 0, 0, 0, 0]);
const layer1 = new Layer(HiddenNeuron, 8, layer0.outputSignal);
test("Layer(InputNeuron, 9, [0, 0, 1, 0, 0, 0, 0, 0, 0]).neurons.length = 9", () => {
	expect(layer0.neurons.length).toBe(9);
});
test("Layer(HiddenNeuron, 8, layer0.outputSignal).neurons.length = 8", () => {
	expect(layer1.neurons.length).toBe(8);
});
