
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

	// const clipOutput = (n, max = 711, min = 1e-13) => {
	// 	if (isNaN(n)) {
	// 		return clipOutput(randomGaussian());
	// 	}
	// 	return nonZero(Math.min(n, max), min);
	// }

	const nonZero = (n, min = 1e-13) => {
		const absN = Math.abs(n);
		const sign = Math.sign(n);
		if (absN === 0){
			return sign !== 0 ? (min * sign) : min;
		}
		return Math.max(absN, min) * sign;
	}

	const reLu = (input, derivative = false, a = .01) => {
		if (derivative) {
			return Array.isArray(input) ? input.map((x) => x <= 0 ? a : 1) : input <= 0 ? a : 1;
		}
		return Array.isArray(input) ? input.map((x) => x < 0 ? a * x : x) : input < 0 ? a * input : input;
	}//"leaky" ReLu function, where 'a' represents "leakiness". Works on arrays or a single number

	const softmax = (arrayZ, derivative = false) => {
		// Math.exp outputs NaN if given a number greater than approx. 709.7827
		// This fix is based on a trick I found at https://timvieira.github.io/blog/post/2014/02/11/exp-normalize-trick/ I adapted it to work for input arrays containing both largely positive and largely negative numbers
		if ((!Array.isArray(arrayZ) || arrayZ.length === 1) && !derivative){
			return [1];
		}
		const outputArray = arrayZ.map((elementA) => {
			let denominator = arrayZ.reduce((sum, elementB) => sum + Math.exp(elementB - elementA), 0);
			let numerator = Math.exp(elementA - elementA);
			return numerator/denominator;
		});
		if (derivative) {
			return softmaxPrime(outputArray);
		}
		return outputArray
	}
	const jacobianMatrix = (vector) => {
		const len = vector.length;
		return vector.map((n, i) => {
			const row = Array(len).fill(0);
			row[i] = n;
			return row;
		});
	}
	const softmaxPrime = (softmaxOutput) => {
		const s = softmaxOutput;
		const jacobian = jacobianMatrix(s);
		jacobian.map((row, i) => {
			row.map((col, j) => {
				jacobian[i][j] = i === j ? s[i] * (1 - s[i]) : -s[i] * s[j];
				// jacobian[i][j] = i === j ? col * (1 - col) : -row[i] * col;
			});	
		});
		return jacobian;
	} 

	const crossEntropyCostFunction = (prediction, labels, derivative = false) => {
		let predictions = Array.isArray(prediction) ? prediction : [prediction];
		if (derivative) {
			return crossEntropyPrime(predictions, labels);
		}

		return predictions.map((prediction, i) => {
			// prediction = clipOutput(prediction);
			return -1 * labels[i] * Math.log(prediction)
		});
	}

	const crossEntropyPrime = (predictions, labels) => {
		return predictions.map((prediction, i) => {
			// prediction = clipOutput(prediction);
			return -labels[i] / prediction - (1 - labels[i])/(1 - prediction);
		});
	}

	// ========================================================================

	class Layer {
		constructor (layerSize, {inputVector, activationFn, costFn, defaultBias, labels, learningRate, momentum} = {}) {
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
			this.learningRate = learningRate || 0.5;
			this.updateVariables = true;
			this.momentumAdjustment = this.weights.map(n => 0);
			this.updates = [];
			this.gradients = [];
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
				let changeToWeight = (math.dotMultiply(this.learningRate, nablaW[index])) + this.momentumAdjustment[index];
				let updatedWeight = math.subtract(neuronWeights, changeToWeight);
				// console.log('updatedWeight', updatedWeight);
				return updatedWeight;
			});
			const newBiases = math.subtract(this.biases, math.dotMultiply(this.learningRate, nablaB));
			this.gradients.push(nablaW);
			this.updates.push([newWeights, newBiases]);
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
			console.table(this.results);
			const costDeriv = this.costFn(this.outputSignal, this.actuals, true);
			// console.log('costDeriv', costDeriv);
			// console.table('this.outputDeriv', this.outputDeriv);
			const delta = math.multiply(costDeriv, this.outputDeriv);	
			
			// console.log('delta', delta);
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
				this.updateMomentumAdjustment(layer);
				return layer.backpropagateError(delta);
			}, 0);
			const results = this.layers.map(layer => layer.updates);
			results.shift();
			const iterationError = this.layers[this.layers.length - 1].totalError;
			this.adjustLearningRate(iterationError);
			console.log(`\n\n^^^Iteration Error: ${iterationError}`);
			// results.map(layer => console.table(layer[0], layer[1]));
			return results;
		}
		adjustLearningRate (error, max = 1, adjustmentRate = 1) {
			if (error > max) {
				this.layers.map(layer => layer.learningRate *= adjustmentRate);
			}
		}
		updateMomentumAdjustment (layer, momentumConstant = .90) {
			if (!layer.gradients.length) {
				return;
			}
			let momentumAdjustment = math.dotMultiply(momentumConstant, layer.gradients[layer.gradients.length - 1]);
			// console.log('momentumAdjustment', momentumAdjustment);
			layer.momentumAdjustment = momentumAdjustment;
		}
		async runTestIteration (testExample){
			const actuals = await this.feedForward(testExample);
			return await this.backpropagate(actuals);
		}
		async train (epochs, trainingData, updateVariables = true){
			console.log('epochs', epochs)
			let result;
			if (updateVariables) {
				this.layers.map(layer => layer.updateVariables = true)
			}
			for(let i = 0; i < epochs; i ++){
				console.log(`\n\nEpoch: ${i}`);
				result = await trainingData.map(testExample => this.runTestIteration(testExample));
				this.output.push(result);
			}
			return this.output;
		}
	}
	return { 
		game,
		clearTerminal,
		// clipOutput,
		jacobianMatrix,
		math,
		adjustedRandomGaussian,
		reLu,
		softmax,
		// softmax2,
		crossEntropyCostFunction,
		Layer,
		InputLayer,
		HiddenLayer,
		OutputLayer,
		Network
	}
})();

module.exports = NeuralNetwork;

