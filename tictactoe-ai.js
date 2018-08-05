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
		constructor ({numberOfNeurons: size = 3, inputLayer: activations}, inputLayer, activationFn, costFn = crossEntropyCostFunction) {
			this.activations = inputLayer;
			this.activationFn = activationFn;
			this.costFn = costFn;
			this.neurons = Array(size).fill(null);
			this.labels = [];
			this.learningRate = 0.1;
		}
		set inputs (newInputs) {
			this.activations = newInputs;
		}
		get weightedInputs () {
			console.log('@this.activations, this.weights', this.activations, this.weights);
			return negZeroFix(math.multiply(this.activations, this.transposedWeights));
		}
		get outputSignal () {
			let weightedInputSum = this.weightedInputs.map(neuron => neuron.reduce((sum, value) => sum + value));
			return this.activationFn(math.add(weightedInputSum, this.biases));
		}
		get outputDeriv () {
			let weightedInputSum = this.weightedInputs.map(neuron => neuron.reduce((sum, value) => sum + value));
			return this.activationFn(math.add(weightedInputSum, this.biases, true));
		}
		get weights () {
			return this.neurons.map(neuron => neuron.weights);
		}
		get transposedWeights () {
			return math.transpose(this.weights);
		}
		set weights (newWeights) {
			return this.neurons.map((neuron, i)=> neuron.weights = newWeights[i]);
		}
		get biases () {
			return this.neurons.map(neuron => neuron.bias);
		}
		set biases (newBiases) {
			return this.neurons.map((neuron, i) => neuron.bias = newBiases[i]);
		}
		get actuals () {
			return this.labels;
		}
		set actuals (actuals) {
			this.labels = actuals;
		}
		get errors () {
			return negZeroFix(this.costFn(this.outputSignal, this.actuals));
		}
		get totalError () {
			console.log("this.errors=", this.errors);
			return this.errors.reduce((sum, error) => sum + error);
		}
		updateWeightsAndBiases ({delta: delta, weights: dependentWeights}) {
			console.log('dependentWeights', dependentWeights)
			console.log(`updateWeightsAndBiases (${delta}, ${dependentWeights}) called`)
			const costDeriv = delta;
			console.log('costDeriv', costDeriv)
			const transposedWeights = math.transpose(dependentWeights);
			console.log('transposedWeights', transposedWeights)
			console.log('this.outputDeriv', this.outputDeriv)
			const deltaB = math.dotMultiply(transposedWeights, costDeriv)// * costDeriv;
			console.log('deltaB', deltaB)
			console.log('this.activations', this.activations)
			const transposedActivations = math.transpose(this.activations);
			console.log('transposedActivations', transposedActivations)
			const deltaW = math.multiply(transposedActivations, deltaB);
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
			console.log('😎this.weights', this.weights);
			return {
				delta: deltaB, 
				weights: this.weights
			};
		}
	}

	// class InputLayer extends Layer {
	// 	constructor (numberOfNeurons, inputLayer) {
	// 		super(numberOfNeurons, InputNeuron, inputLayer);
	// 		this.neurons.map((neuron, i) => {
	// 				neuron.inputs = inputLayer[i];
	// 			});
	// 	}
	// 	get outputSignal () {
	// 		return this.neurons.map(neuron => neuron.inputs);
	// 	}
	// }
	// class HiddenLayer extends Layer {
	// 	constructor (numberOfNeurons, inputLayer) {
	// 		super(numberOfNeurons, HiddenNeuron, inputLayer, reLu);
	// 	}
	// }

	// class OutputLayer extends Layer {
	// 	constructor (numberOfNeurons, inputLayer, classLabels = ["lose", "draw", "win"]) {
	// 		super(numberOfNeurons, OutputNeuron, inputLayer, softmax);
	// 		this.classLabels = classLabels;
	// 	}
	// 	get results () {
	// 		const results = {};
	// 		const outputs = this.outputSignal;
	// 		this.classLabels.map((label, i) => results[label] = outputs[i]);
	// 		return results;
	// 	}
	// 	updateWeightsAndBiases () {
	// 		console.log(`updateWeightsAndBiases () called`)
	// 		const costDeriv = negZeroFix(this.costFn(this.outputSignal, this.actuals, true));
	// 		const deltaB = math.dotMultiply(costDeriv, this.outputDeriv);
	// 		const transposedActivations = math.transpose(this.activations);
	// 		const deltaW = math.multiply(transposedActivations, deltaB);
	// 		const newWeights = this.weights.map((neuronWeights, i) => {
	// 			let updatedWeight = math.subtract(neuronWeights, math.dotMultiply(this.learningRate, deltaW[i]));
	// 			return updatedWeight;
	// 		});
	// 		this.biases = math.subtract(this.biases, math.dotMultiply(this.learningRate, deltaB));
	// 		this.weights = newWeights;
	// 		console.log('😎this.weights', this.weights);
	// 		return {
	// 			delta: deltaB, 
	// 			weights: this.weights
	// 		};
	// 	}
	// }

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
		// InputLayer,
		// HiddenLayer,
		// OutputLayer,
		Network
	}
})();

module.exports = NeuralNetwork;

