const game = require("./tictactoe.js");
const trainingData = require("./tictactoe-simulations.json");

const NeuralNetwork = (() => {
	const randomGaussian = require("random").normal(mu = 0, sigma = 1);
	const math = require("mathjs");

	const adjustedRandomGaussian = (inputLayerSize, activationFnName) => {
		const rnd = randomGaussian();
		// console.log('\nrnd', rnd)
		if (activationFnName.toLowerCase() === "relu") {
			return (rnd * Math.sqrt(2/inputLayerSize));
		}
		if (activationFnName.toLowerCase() === "softmax" || "tanh") {
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
		constructor (inputLayer, activationFn, costFn = crossEntropyCostFunction) {
			this.activationFn = activationFn;// || function(x){return x};
			this.inputs = inputLayer || [];
			this.learningRate = 0.5;
			this.costFn = costFn;
			this.weights = this.activationFn ? inputLayer.map((input) => adjustedRandomGaussian(inputLayer.length, this.activationFn.name)) : null;
			this.bias = 0.001;
		}
		get weightedInputs () {
			return math.dotMultiply(this.inputs, this.weights).map(n => n === -0 ? 0 : n);
		}
		get activatedInputs () {
			return this.activationFn(this.weightedInputs).map(n => n === -0 ? 0 : n); 
		}
		get outputSignal () {
			const weightedInputSum = math.sum(this.weightedInputs);
			return this.activationFn(weightedInputSum + this.bias);
		}
		updateWeightsAndBias (actual) {
			const costPrime = this.costFn(this.activatedInputs, this.actual, true);
			
			const deltaB = this.activationFn(this.weightedInputs, true).reduce((accum, weight, i) => accum + weight * costPrime[i])
			
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
			return actual;
		}
	}

	class InputNeuron extends Neuron {
		constructor (initialValue) {
			super(initialValue, null);
			this.weights = null;
			this.bias = null;
		}
		get weightedInputs () {
			return this.inputs;
		}
		get activatedInputs () {
			return this.inputs;
		}
		get outputSignal () {
			return this.inputs.length === 1 ? this.inputs[0] : this.inputs;
		}
	}

	class HiddenNeuron extends Neuron {
		constructor (inputLayer, activationFn = reLu) {
			super(inputLayer, activationFn);
		}
	}

	class OutputNeuron extends Neuron {
		constructor (inputLayer, activationFn = reLu, classLabel) {
			super(inputLayer, activationFn, crossEntropyCostFunction);
			this.actual = 0.33;
			this.classLabel = classLabel;
			this.bias = 0;
		}
		// get outputSignal () {
		// 	return this.activationFn(this.weightedInputs);
		// }
		get error () {
			return this.costFn(this.guess, this.actual);
		}
		get prediction () {
			const certainty = math.max(this.outputSignal);
			const labelIndex =  this.outputSignal.indexOf(certainty) - 1;
			const prediction = this.classLabels[labelIndex];
			return [prediction, certainty];
		}
		get result () {
			return [this.classLabel, this.outputSignal];
		}
	}

	class Layer {
		constructor (neuronClass, numberOfNeurons, inputLayer) {
			this.neurons = Array(numberOfNeurons).fill(null).map(() => new neuronClass(inputLayer));
		}
		get outputSignal () {
			return this.neurons.map(neuron => {
				return neuron.outputSignal;
			});
		}
		get weights () {
			return this.neurons.map(neuron =>  neuron.weights);
		}
		backprop (actuals) {
			const output =  this.neurons.map((neuron, i) => neuron.updateWeightsAndBias(actuals[i] || actuals[actuals.length - 1]));
			return output;
		}
	}
	class InputLayer extends Layer {
		constructor (numberOfNeurons, inputLayer) {
			super(InputNeuron, numberOfNeurons, inputLayer);
			this.neurons.map((neuron, i) => {
					neuron.inputs = inputLayer[i];
				});
		}
	}
	class HiddenLayer extends Layer {
		constructor (numberOfNeurons, inputLayer) {
			super(HiddenNeuron, numberOfNeurons, inputLayer);
		}
	}
	class OutputLayer extends Layer {
		constructor (numberOfNeurons, inputLayer, classLabels = ["lose", "draw", "win"]) {
			super(OutputNeuron, numberOfNeurons, inputLayer);
			this.neurons.map((neuron, i) => {
				neuron.classLabel = classLabels[i];
			});
		}
		get results () {
			const raw = this.rawResults.map(result => result[1]);
			const normalized = softmax(raw);
			return this.rawResults.map((result, i) => [result[0], normalized[i]]);
		}
		get rawResults () {
			return this.neurons.map(neuron => neuron.result);
		}
	}

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

