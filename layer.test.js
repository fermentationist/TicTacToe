 const {	reLu,
		softmax,
		crossEntropyCostFunction,
		Neuron,
		InputNeuron,
		HiddenNeuron,
		OutputNeuron,
		Layer } = require("./tictactoe-ai.js");

const layer0 = new Layer(InputNeuron, 9, [1, 0, 1, 0, -1, 0, 2, 0, 0]);
const layer1 = new Layer(HiddenNeuron, 8, layer0.outputSignal);
const layer2 = new Layer(HiddenNeuron, 3, layer1.outputSignal);
const layer3 = new Layer(OutputNeuron, 1, layer2.outputSignal);
test("01 Layer(InputNeuron, 9, [0, 0, 1, 0, 0, 0, 0, 0, 0]).neurons.length = 9", () => {
	expect(layer0.neurons.length).toBe(9);
});
test("02 Layer(HiddenNeuron, 8, layer0.outputSignal).neurons.length = 8", () => {
	expect(layer1.neurons.length).toBe(8);
});
test("03 Layer(HiddenNeuron, 3, layer1.outputSignal).neurons.length = 3", () => {
	expect(layer2.neurons.length).toBe(3);
});
test("04 Layer(OutputNeuron, 1, layer2.outputSignal).neurons.length = 1", () => {
	expect(layer3.neurons.length).toBe(1);
});
console.log(layer3.outputSignal);