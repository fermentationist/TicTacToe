const game = require("./tictactoe.js");
const trainingData = require("./tictactoe-simulations.json");

const NeuralNetwork = (() => {
	const randomGaussian = require("random").normal(mu = 0, sigma = 1);
	const math = require("mathjs");

	const adjustedRandomGaussian = (inputLayerSize, activationFn) => {
		const rnd = randomGaussian();
		// console.log('\nrnd', rnd)
		if (!activationFn || activationFn.name.toLowerCase() === "relu") {
			return (rnd * Math.sqrt(2/inputLayerSize));
		}
		if (activationFn.name.toLowerCase() === "softmax" || "tanh") {
			return (rnd * Math.sqrt(1/inputLayerSize));
		}
		return rnd;	
	}

	const negZeroFix = (array) => {
		return array.map(n => n === -0 ? 0 : n);
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
			arrayZ = [arrayZ];d
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

	const crossEntropyCostFunction = (prediction, labels, derivative = false) => {
		console.log('prediction, labels', prediction, labels);
		let predictions = Array.isArray(prediction) ? prediction : [prediction];
		if (derivative) {
			return crossEntropyPrime(predictions, labels);
		}
		return predictions.map((prediction, i) => -1 * labels[i] * Math.log(prediction));
	}

	const crossEntropyPrime = (predictions, labels) => {
		return predictions.map((prediction, i) => -1 * labels[i] / prediction);
	}

	// ========================================================================



	// class Neuron {
	// 	constructor (inputLayer, layerActivationFn) {
	// 		this.inputs = inputLayer || [];
	// 		this.weights = inputLayer.map((input) => adjustedRandomGaussian(inputLayer.length, layerActivationFn));
	// 		this.bias = 0.001;
	// 	}
	// 	get error () {
	// 		return this.costFn(this.outputSignal, this.actual);
	// 	}
	// 	updateWeightsAndBias () {
	// 		const costPrime = this.costFn(this.activatedInputs, this.actual, true);
			
	// 		const deltaB = this.activationFn(this.weightedInputs, true).reduce((accum, weight, i) => accum + weight * costPrime[i]);
			
	// 		// 
	// 		const deltaW = this.inputs.map((input, i) => {
	// 			let result = this.activationFn(this.weightedInputs[i], true) * input * costPrime[i];
	// 			return result;
	// 		});
	// 		const newWeights = this.weights.map((weight, i) => {
	// 			weight -= this.learningRate * deltaW[i];
	// 			return weight;
	// 		});
	// 		const newBias = this.bias -= this.learningRate * deltaB;
	// 		this.weights = newWeights;
	// 		this.bias = newBias;
	// 		return this.actual;
	// 	}
	// }

	// class InputNeuron extends Neuron {
	// 	constructor (inputLayer) {
	// 		super(inputLayer, null);
	// 		this.weights = [];
	// 		this.bias = 0;
	// 	}
	// }

	// class HiddenNeuron extends Neuron {
	// 	constructor (inputLayer) {
	// 		super(inputLayer, reLu);
	// 	}
	// }

	// class OutputNeuron extends Neuron {
	// 	constructor (inputLayer) {
	// 		super(inputLayer, softmax);
	// 	}
	// }

	class Layer {
		constructor (layerSize, {inputVector, activationFn, costFn, defaultBias, labels, learningRate} = {}) {
			this.layerSize = layerSize;
			this.activations = inputVector;
			this.weights = Array(this.layerSize).fill(null).map(() => {
				const numWeights = !this.activations ? this.layerSize : this.activations.length;
				return Array(numWeights).fill(null).map(() => adjustedRandomGaussian(numWeights, this.activationFn));
			});
			this.biases = Array(this.layerSize).fill(defaultBias || 0);
			this.activationFn = activationFn;
			this.costFn = costFn || crossEntropyCostFunction;
			this.labels = labels || [];
			this.learningRate = learningRate || 0.1;
			//204654adjustedRandomGaussian(inputLayer.length, layerActivationFn));
		}
		get inputMatrix () {
			let matrix = Array(this.layerSize).fill(this.activations);
			return matrix;
		}
		get weightedInputs () {
			return math.multiply(this.activations, this.transposedWeights);
		}
		get  weightedAndBiasedInputs () {
			return this.weightedInputs.map((input, i) => input + this.biases[i]);
		}
		get outputSignal () {
			return this.activationFn(this.weightedAndBiasedInputs);
		}
		get outputDeriv () {
			return this.activationFn(this.weightedAndBiasedInputs, true);
		}
		get transposedWeights () {
			return math.transpose(this.weights);
		}
		
		updateWeightsAndBiases ({delta: delta, weights: dependentWeights}) {
			console.log('dependentWeights', dependentWeights);
			console.log(`updateWeightsAndBiases (${delta}, ${dependentWeights}) called`);
			const costDeriv = delta;
			console.log('costDeriv', costDeriv);
			console.log('this.outputDeriv', this.outputDeriv)
			const deltaB = math.dotMultiply(this.transposedWeights, costDeriv);// * costDeriv;
			console.log('deltaB', deltaB);
			const transposedActivations = math.transpose(this.inputMatrix);
			console.log('transposedActivations', transposedActivations);
			const deltaW = math.dotMultiply(transposedActivations, deltaB);
			console.log('deltaW', deltaW);
			const newWeights = this.weights.map((neuronWeights, i) => {
				let updatedWeight = math.subtract(neuronWeights, math.dotMultiply(this.learningRate, deltaW[i]));
				return updatedWeight;
			});
			this.biases = math.subtract(this.biases, math.dotMultiply(this.learningRate, deltaB));
			// this.biases = this.biases.map((bias, i) => bias - math.dotMultiply(this.learningRate, deltaB));			
			console.log('this.biases', this.biases);
			console.log('newWeights', newWeights);
			this.weights = newWeights;
			console.log('this.weights', this.weights);
			return {
				delta: deltaB, 
				weights: this.weights
			};
		}
	}

	class InputLayer extends Layer {
		constructor (layerSize, {inputVector} = {}) {
			super(layerSize, {inputVector: inputVector, activationFn: null});
			this.weights = null;
			this.biases = null;
			this.type = "input"
		}
		get outputSignal () {
			return this.activations;
		}
	}
	class HiddenLayer extends Layer {
		constructor (layerSize, {inputVector} = {}) {
			super(layerSize, {inputVector: inputVector, activationFn: reLu});
			this.type = "hidden"
		}
	}

	class OutputLayer extends Layer {
		constructor (layerSize, {inputVector, classLabels = ["lose", "draw", "win"]} = {}) {
			super(layerSize, {inputVector: inputVector, activationFn: softmax});
			this.classLabels = classLabels;
		}
		get results () {
			const results = {};
			const outputs = this.outputSignal;
			this.classLabels.map((label, i) => results[label] = outputs[i]);
			return results;
		}
		get errors () {
			return this.costFn(this.outputSignal, this.actuals);
		}
		get totalError () {										
			return this.errors.reduce((sum, error) => sum + error);
		}
		updateWeightsAndBiases () {
			const costDeriv = this.costFn(this.outputSignal, this.actuals, true);
			console.log('costDeriv', costDeriv);
			console.log('this.outputDeriv', this.outputDeriv);
			const deltaB = math.multiply(costDeriv, this.outputDeriv);	
			console.log('💩B', deltaB);
			const transposedActivations = math.transpose(this.activations
				);
			const deltaW = math.dotMultiply(deltaB, transposedActivations);
			console.log('💩W', deltaW);
			const newWeights = this.weights.map((neuronWeights, i) => {
				let updatedWeight = math.subtract(neuronWeights, math.dotMultiply(this.learningRate, deltaW[i]));
				return updatedWeight;
			});
			console.log('newWeights', newWeights);
			this.biases = math.subtract(this.biases, math.dotMultiply(this.learningRate, deltaB));
			this.weights = newWeights;
			console.log('😎this.weights', this.weights);
			return {
				delta: deltaB, 
				weights: this.weights
			};
		}
	}

	class Network {
		constructor (arrayOfLayers){
			this.layers = arrayOfLayers;
		}
		feedForward (testExample) {
			let newSignal = testExample;
			this.layers.map(layer => {
				layer.inputs = newSignal;
				newSignal = layer.outputSignal;
			});
		}
		backprop (actuals) {
			this.layers[this.layers.length - 1].actuals = actuals;
			const reversedLayers = [...this.layers].reverse();
			reversedLayers.reduce((delta, layer) => {
				return layer.updateWeightsAndBiases(delta);
			}, 0);
		}
	}
	return { 
		math,
		adjustedRandomGaussian,
		reLu,
		softmax,
		crossEntropyCostFunction,
		Layer,
		InputLayer,
		HiddenLayer,
		OutputLayer,
		Network
	}
})();

module.exports = NeuralNetwork;

