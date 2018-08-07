
// const trainingData = require("./tictactoe-simulations.json");

const NeuralNetwork = (() => {
	const game = require("./tictactoe.js");
	const {clearTerminal} = game;
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
			return 1;
		}
		const sqrtDenominator = (arrayZ.reduce((sum, z) => sum + Math.exp(z), 0));
		const denominator = sqrtDenominator ** 2;
		const outputArray = arrayZ.map(z => {
			let numerator = Math.exp(z) * (sqrtDenominator - Math.exp(z));
			return numerator/denominator;
		});
		return outputArray;
	}

	const crossEntropyCostFunction = (prediction, labels, derivative = false) => {
		let predictions = Array.isArray(prediction) ? prediction : [prediction];
		if (derivative) {
			return crossEntropyPrime(predictions, labels);
		}
		return predictions.map((prediction, i) => -1 * labels[i] * Math.log(prediction));
	}

	const crossEntropyPrime = (predictions, labels) => {
		return predictions.map((prediction, i) => -labels[i] / prediction - (1 - labels[i])/(1 - prediction));
	}

	// ========================================================================

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
			this.learningRate = learningRate || 0.25;
			this.updateVariables = true;
			
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
		
		backpropagateError ({delta, dependentWeights}) {
			const transposedDependentWeights = math.transpose(dependentWeights);
			const nablaB = math.dotMultiply(math.multiply(delta, dependentWeights), this.outputDeriv);
			const transposedActivations = math.transpose(this.inputMatrix);
			const nablaW = math.multiply(transposedActivations, nablaB);	
			this.updateWeightsAndBiases(nablaB, nablaW);
			return {
				delta: nablaB, 
				dependentWeights: this.weights
			};
		}
		updateWeightsAndBiases (nablaB, nablaW) {
			const newWeights = this.weights.map((neuronWeights, index) => {
				let updatedWeight = math.subtract(neuronWeights, math.dotMultiply(this.learningRate, nablaW[index]));
				// console.log('updatedWeight', updatedWeight);
				return updatedWeight;
			});
			const newBiases = math.subtract(this.biases, math.dotMultiply(this.learningRate, nablaB));
			this.correctedVariables = [newWeights, newBiases];
			if (this.updateVariables) {
				this.weights = newWeights;
				this.biases = newBiases;
			}
		}	
	}

	class InputLayer extends Layer {
		constructor (layerSize, {inputVector} = {}) {
			super(layerSize, {inputVector: inputVector, activationFn: null});
			this.weights = null;
			this.biases = null;
			this.type = "input";
		}
		get outputSignal () {
			return this.activations;
		}
		backpropagateError({delta, dependentWeights}) {
			let totalDelta = delta.reduce((sum, n) => sum + n, 0);
			return console.log(`backpropagation finished.`);
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
		backpropagateError () {
			const costDeriv = this.costFn(this.outputSignal, this.actuals, true);
			const delta = math.dotMultiply(costDeriv, this.outputDeriv);	
			const nablaB = delta;
			const transposedActivations = math.transpose(this.inputMatrix);
			const nablaW = math.multiply(transposedActivations, nablaB);
			this.updateWeightsAndBiases(nablaB, nablaW);
			return {
				delta,
				dependentWeights: this.weights
			};
		}
	}

	class Network {
		constructor (arrayOfLayers){
			this.layers = arrayOfLayers;
			this.output = [];
		}
		feedForward (testExample) {
			let newSignal = testExample.boardState;
			console.log('newSignal', newSignal)
			this.layers.map(layer => {
				layer.activations = newSignal;
				newSignal = layer.outputSignal;
			});
			return testExample.actuals;
		}
		backpropagate (actuals) {
			this.layers[this.layers.length - 1].actuals = actuals;
			const reversedLayers = [...this.layers].reverse();
			reversedLayers.reduce((delta, layer) => {
				return layer.backpropagateError(delta);
			}, 0);
			const results = this.layers.map(layer => layer.correctedVariables);
			results.shift();
			console.log(`\n\n^^^Iteration Error: ${this.layers[this.layers.length - 1].totalError}`);
			// results.map(layer => console.table(layer[0], layer[1]));
			return results;
		}
		async runTestIteration (testExample){
			const actuals = await this.feedForward(testExample.boardState);
			return await this.backpropagate(actuals);
		}
		async train (epochs, trainingData, updateVariables = true){
			console.log('epochs', epochs)
			const result = [];
			if (updateVariables) {
				this.layers.map(layer => layer.updateVariables = true)
			}
			for(let i = 0; i < epochs; i ++){
				console.log('i', i)
				result = await trainingData.map(testExample => this.runTestIteration(testExample));
				this.output.push(result);
			}
			return this.output;
		}
	}
	return { 
		game,
		clearTerminal,
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

