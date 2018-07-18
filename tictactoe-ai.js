const game = require("./tictactoe.js");
const math = require("mathjs");
const trainingData = require("./tictactoe-simulations.json");
const randomGaussian = require("random").normal(mu = 0, sigma = 1);

const mean = 0;
const variance = 1;
const sample = randomGaussian();
console.log('sample', sample);
let weight = Number.parseFloat(sample).toPrecision(4);
console.log('weight', weight);


const NeuralNetwork = (() => {
	const inputLayer0Size = 9;
	const hiddenLayer1Size = 8;
	const hiddenLayer2Size = 3;
	const outputLayerSize = 1;

	const reLu = (input, a = .01) => {
		return Array.isArray(input) ? input.map((x) => x < 0 ? a * x : x) : input < 0 ? a * input : input;
		}//"leaky" ReLu function, where a represents "leakiness". Works on arrays or a single number

	const softmax = (arrayZ) => {
		if (!Array.isArray(arrayZ)){
			console.log("not an array");
			arrayZ = [arrayZ];
		}
		let denominator = arrayZ.reduce((sum, elementK) => sum + Math.exp(elementK), 0);
		return arrayZ.map((elementJ) => {
			let numerator = Math.exp(elementJ);
			return numerator/denominator;
		});
	}

	const adjustedRandomGaussian = (inputLayerSize, activationFn, precision = 4) => {
		const rnd = randomGaussian();
		if (activationFn.toLowerCase() === "relu") {
			return (rnd * Math.sqrt(2/inputLayerSize)).toFixed(precision);
		}
		if (activationFn.toLowerCase() === "softmax" || "tanh") {
			return (rnd * Math.sqrt(1/inputLayerSize)).toFixed(precision);
		}
		return rnd.toFixed(precision);	
	}

	class Neuron {
		constructor (activationFn, inputLayer) {
			this.activationFn = activationFn;// || function(x){return x};
			this.inputs = inputLayer || [];
			if (this.inputs.length > 1) {
				this.weights = inputLayer.map((input) => adjustedRandomGaussian(inputLayer.length, this.activationFn.name));
				this.bias = 0;
			}
		}
		get weightedInputs () {
			return math.dotMultiply(this.inputs, this.weights);
		}
		get outputSignal () {
			if (!this.activationFn) {
				return this.inputs;
			}
			if (this.activationFn.name.toLowerCase() === "softmax") {
				return this.activationFn(this.weightedInputs);
			}
			return this.activationFn(math.multiply(this.inputs, this.weights) + this.bias);
		}
	}
	class InputNeuron extends Neuron {
		constructor (initialValue) {
			super(null, initialValue);
		}
	}

	class HiddenNeuron extends Neuron {
		constructor (inputLayer) {
			super(reLu, inputLayer);
		}
	}

	class OutputNeuron extends Neuron {
		constructor (inputLayer) {
			super(softmax, inputLayer);
		}
	}

	class Layer {
		constructor (neuronClass, numberOfNeurons, inputLayer) {
			this.neurons = Array(numberOfNeurons).fill(null).map(() => new neuronClass(inputLayer));
		}
	}

	const layer0 = new Layer(InputNeuron, 9, 1);
	console.log('\nlayer0', layer0);

	const layer1 = new Layer(HiddenNeuron, 9, layer0.neurons);
	console.log('\nlayer1', layer1);

	const layer2 = new Layer(HiddenNeuron, 3, layer1.neurons);
	console.log('\nlayer2', layer2);

	const layer3 = new Layer(OutputNeuron, 1, layer2.neurons);
	console.log('\nlayer3', layer3);


	const inputNeuron = new InputNeuron(5);
	console.log("inputNeuron = ", JSON.stringify(inputNeuron));
	console.log('inputNeuron.outputSignal', inputNeuron.outputSignal);
	const hiddenNeuron = new HiddenNeuron([1,0,-1,-1,0,1,0,0,0]);
	console.log('hiddenNeuron', hiddenNeuron)
	console.log('hiddenNeuron.outputSignal', hiddenNeuron.outputSignal);
	const outputNeuron = new OutputNeuron([3.44,2,-.5]);
	console.log('outputNeuron', outputNeuron)
	console.log('outputNeuron.outputSignal', outputNeuron.outputSignal);

	return {
		Neuron
	}
	

})();



