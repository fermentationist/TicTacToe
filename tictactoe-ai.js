const game = require("./tictactoe.js");
const trainingData = require("./tictactoe-simulations.json");

const NeuralNetwork = (() => {
	const randomGaussian = require("random").normal(mu = 0, sigma = 1);
	const math = require("mathjs");

	const adjustedRandomGaussian = (inputLayerSize, activationFn) => {
		const rnd = randomGaussian();
		// console.log('\nrnd', rnd)
		if (activationFn === null || activationFn.name.toLowerCase() === "relu") {
			return (rnd * Math.sqrt(2/inputLayerSize));
		}
		if (activationFn.name.toLowerCase() === "softmax" || "tanh") {
			return (rnd * Math.sqrt(1/inputLayerSize));
		}
		return rnd;	
	}

	const reLu = (input, derivative = false, a = .01) => {
		if (derivative) {
			return Array.isArray(input) ? input.map((x) => x <= 0 ? a : 1) : input <= 0 ? a : 1;
		}
		return Array.isArray(input) ? input.map((x) => x < 0 ? a * x : x) : input < 0 ? a * input : input;
		}//"leaky" ReLu function, where a represents "leakiness". Works on arrays or a single number

	const softmax = (arrayZ, derivative = false) => {
		if (derivative) {
			return softmaxPrime(arrayZ);
		}
		if (!Array.isArray(arrayZ)){
			arrayZ = [arrayZ];
		}
		let denominator = arrayZ.reduce((sum, elementK) => sum + Math.exp(elementK), 0);
		return arrayZ.map((elementJ) => {
			let numerator = Math.exp(elementJ);
			return numerator/denominator;
		});
	}

	const softmaxPrime = (arrayZ) => {
		if (!Array.isArray(arrayZ)){
			arrayZ = [arrayZ];
		}
		let denominator = arrayZ.reduce((sum, elementK) => sum + (elementK * Math.exp(elementK - 1)), 0);
		return arrayZ.map((elementJ) => {
			let numerator = elementJ * Math.exp(elementJ - 1);
			return numerator/denominator;
		});
	}

	const crossEntropyCostFunction = (prediction, label, derivative = false) => {
		let predictions = Array.isArray(prediction) ? prediction : [prediction];
		if (derivative) {
			return crossEntropyPrime(predictions, label);
		}
		return predictions.map(prediction => -1 * label * Math.log(prediction));
	}

	const crossEntropyPrime = (predictions, label) => {
		return predictions.map(prediction => -1 * label / prediction);
	}

	// ========================================================================



	class Neuron {
		constructor (inputLayer, layerActivationFn) {
			this.inputs = inputLayer || [];
			this.weights = inputLayer.map((input) => adjustedRandomGaussian(inputLayer.length, layerActivationFn));
			this.bias = 0.001;
		}
		get error () {
			return this.costFn(this.outputSignal, this.actual);
		}
		updateWeightsAndBias () {
			const costPrime = this.costFn(this.activatedInputs, this.actual, true);
			
			const deltaB = this.activationFn(this.weightedInputs, true).reduce((accum, weight, i) => accum + weight * costPrime[i]);
			
			// 
			const deltaW = this.inputs.map((input, i) => {
				let result = this.activationFn(this.weightedInputs[i], true) * input * costPrime[i];
				return result;
			});
			const newWeights = this.weights.map((weight, i) => {
				weight -= this.learningRate * deltaW[i];
				return weight
			});
			const newBias = this.bias -= this.learningRate * deltaB;
			this.weights = newWeights;
			this.bias = newBias;
			return this.actual;
		}
	}

	class InputNeuron extends Neuron {
		constructor (inputLayer) {
			super(inputLayer, null);
			this.weights = [];
			this.bias = 0;
		}
	}

	class HiddenNeuron extends Neuron {
		constructor (inputLayer) {
			super(inputLayer, reLu);
		}
	}

	class OutputNeuron extends Neuron {
		constructor (inputLayer) {
			super(inputLayer, softmax);
		}
	}

	// class OutputNeuron extends Neuron {
	// 	constructor (inputLayer, activationFn = reLu, classLabel) {
	// 		super(inputLayer, activationFn, crossEntropyCostFunction);
	// 		this.actual = 0.33;
	// 		this.classLabel = classLabel;
	// 		this.bias = 0;
	// 	}
	// 	get result () {
	// 		return [this.classLabel, this.outputSignal];
	// 	}
	// }

	class Layer {
		constructor (numberOfNeurons, neuronClass, inputLayer, activationFn, lossFn = crossEntropyCostFunction) {
			this.activationFn = activationFn;
			this.lossFn = lossFn;
			this.neurons = Array(numberOfNeurons).fill(null).map(() => new neuronClass(inputLayer));
			this.labels = [];
		}
		get weightedInputs () {
			return math.dotMultiply(this.activations, this.weights).map(n => n === -0 ? 0 : n);//second map statement is to replace negative zeroes with normal zeroes.
		}
		get outputSignal () {
			let weightedInputSum = this.weightedInputs.map(neuron => neuron.reduce((sum, value) => sum + value));
			return this.activationFn(math.add(weightedInputSum, this.biases));
		}
		get activations () {
			return this.neurons.map(neuron => neuron.inputs);
		}
		get weights () {
			return this.neurons.map(neuron =>  neuron.weights);
		}
		get biases () {
			return this.neurons.map(neuron => neuron.bias);
		}
		get errors () {
			return this.neurons.map(neuron => neuron.error);
		}
		set actuals (actuals) {
			this.labels = actuals;
			this.neurons.map((neuron, i) => neuron.actual = actuals[i]);
		}
		get actuals (){
			return this.labels;
		}
		backprop (actuals) {
			this.actuals = actuals;
			return this.neurons.map(neuron => neuron.updateWeightsAndBias());
		}
	}

	class InputLayer extends Layer {
		constructor (numberOfNeurons, inputLayer) {
			super(numberOfNeurons, InputNeuron, inputLayer);
			this.neurons.map((neuron, i) => {
					neuron.inputs = inputLayer[i];
				});
		}
		get outputSignal () {
			return this.neurons.map(neuron => neuron.inputs);
		}
	}
	class HiddenLayer extends Layer {
		constructor (numberOfNeurons, inputLayer) {
			super(numberOfNeurons, HiddenNeuron, inputLayer, reLu);
		}
	}

	class OutputLayer extends Layer {
		constructor (numberOfNeurons, inputLayer, classLabels = ["lose", "draw", "win"]) {
			super(numberOfNeurons, OutputNeuron, inputLayer, softmax);
			this.classLabels = classLabels;
		}
		get results () {
			const results = {};
			const outputs = this.outputSignal;
			this.classLabels.map((label, i) => results[label] = outputs[i]);
			return results;
		}
	}
	// class OutputLayer extends Layer {
	// 	constructor (numberOfNeurons, inputLayer, classLabels = ["lose", "draw", "win"]) {
	// 		super(OutputNeuron, numberOfNeurons, inputLayer);
	// 		this.neurons.map((neuron, i) => {
	// 			neuron.classLabel = classLabels[i];
	// 		});
	// 	}
	// 	get rawResults () {
	// 		return this.neurons.map(neuron => neuron.result);
	// 	}
	// 	get results () {
	// 		const raw = this.rawResults.map(result => result[1]);
	// 		const normalized = softmax(raw);
	// 		const output = {}
	// 		this.rawResults.map((result, i) => {
	// 			output[result[0]] = normalized[i];
	// 		});
	// 		return output;
	// 	}
	// }

	return { 
		adjustedRandomGaussian,
		reLu,
		softmax,
		crossEntropyCostFunction,
		Neuron,
		InputNeuron,
		HiddenNeuron,
		OutputNeuron,
		Layer,
		InputLayer,
		HiddenLayer,
		OutputLayer
	}
})();

module.exports = NeuralNetwork;

