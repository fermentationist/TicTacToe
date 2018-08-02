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
console.log('layer1', layer1.neurons);


// console.log('layer1.outputSignal', layer1.outputSignal);
// const layer2 = new Layer(HiddenNeuron, 3, layer1.outputSignal);
// const layer3 = new Layer(OutputNeuron, 1, layer2.outputSignal);
test("Layer(InputNeuron, 9, [0, 0, 1, 0, 0, 0, 0, 0, 0]).neurons.length = 9", () => {
	expect(layer0.neurons.length).toBe(9);
});
test("Layer(HiddenNeuron, 8, layer0.outputSignal).neurons.length = 8", () => {
	expect(layer1.neurons.length).toBe(8);
});
// test("Layer(HiddenNeuron, 3, layer1.outputSignal).neurons.length = 3", () => {
// 	expect(layer2.neurons.length).toBe(3);
// });
// test("Layer(OutputNeuron, 1, layer2.outputSignal).neurons.length = 1", () => {
// 	expect(layer2.neurons.length).toBe(1);
// });
// console.log(layer3.outputSignal);