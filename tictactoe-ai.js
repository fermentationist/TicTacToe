//Hyperparameters
const LEARNING_RATE = 0.1;
const MOMENTUM_CONSTANT = 0.75;

const handled = (promise) => {
	return promise.then(data => data)
	.catch(err => console.log("∞∞ ", err) && err)
}

const NeuralNetwork = (() => {
	const game = require("./tictactoe.js");
	const {clearTerminal} = game;
	const randomGaussian = require("random").normal(mu = 0, sigma = 1);
	const math = require("mathjs");
	const cTable = require("console.table");
	const {promisify} = require("util");
	const {readFile, writeFile} = require("fs");
	let correctGuesses = 0;

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

	// const loadState = async (filename) => {
	// 		let parsedData = new Promise((resolve, reject) => {
	// 			fs.readFile(filename, "utf8", (err, data) => {
	// 				err ? reject(err) : resolve(data);
	// 			});
	// 		});
	// 		// console.log('parsedData', parsedData)
	// 		// const parsedData = JSON.parse(jsonData);
	// 		// const rehydratedNetwork = new Network(parsedData.layers);
	// 		// return rehydratedNetwork;
	// 		return await parsedData;
	// }
	// const readFile = promisify(fs.readFile);
	const loadState = async (filename) => {
		const read = promisify(readFile);
		const loadedFile = await handled(read(filename, "utf8"));
		// const rehydratedNetwork = new Network(loadedFile.layers);
		const parsedFile = await handled(JSON.parse(loadedFile));
		const rehydratedNetwork = new Network(parsedFile.layers);
		return rehydratedNetwork;
	}



	class Layer {
		constructor (layerSize, {inputVector, activationFn, costFn, defaultBias, labels, learningRate = LEARNING_RATE, momentum} = {}) {
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
			this.learningRate = learningRate;
			this.updateVariables = true;
			this.momentumAdjustment = this.weights.map(n => 0);
			this.updates = [];
			this.gradients = [];
		}
		get inputMatrix () {
			console.log("∑∑ this.activations", this.activations);
			let matrix = Array(this.layerSize).fill(this.activations);
			console.log('∑∑ matrix', matrix)
			return matrix;
		}
		get weightedInputs () {
			console.log('this', this);
			console.log('this.transposedWeights', this.transposedWeights)
			console.log('this.activations', this.activations)
			return math.multiply(this.activations, this.transposedWeights);
		}
		get  weightedAndBiasedInputs () {
			return this.weightedInputs.map((input, i) => {
				let biased = parseFloat(input) + parseFloat(this.biases[i]);
				console.log('biased', biased);
				return biased;
			});
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
			console.log("backpropagateError() called from hiddenLayer");
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
				// console.log('this.weights', this.weights);
				this.biases = newBiases;
				// console.log('this.biases', this.biases);
			}
		}	
	}

	class InputLayer extends Layer {
		constructor (layerSize, {inputVector} = {}) {
			super(layerSize, {inputVector: inputVector, activationFn: null});
			this.weights = null;
			this.biases = null;
			this.layerType = "input";
		}
		get outputSignal () {
			return this.activations;
		}
		backpropagateError({delta, dependentWeights}) {
			console.log("calling backpropagateError() from inputLayer");
			let totalDelta = delta.reduce((sum, n) => sum + n, 0);
			return;// console.log(`backpropagation finished.`);
		}
	}

	class HiddenLayer extends Layer {
		constructor (layerSize, {inputVector} = {}) {
			super(layerSize, {inputVector: inputVector, activationFn: reLu});
			this.layerType = "hidden";
		}
	}

	class OutputLayer extends Layer {
		constructor (layerSize, {inputVector, classLabels = ["lose", "draw", "win"]} = {}) {
			super(layerSize, {inputVector: inputVector, activationFn: softmax});
			this.classLabels = classLabels;
			this.layerType = "output"
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
			console.log("calling backpropagateError() from outputLayer");
			const outcomeKey = {
				"001": "win",
				"010": "draw",
				"100": "lose"
			};
			console.table(this.results);
			const outputValues = Object.values(this.results);
			let guessValue = Math.max(...outputValues);
			let guess = this.classLabels[outputValues.indexOf(guessValue)];
			let correctLabel = outcomeKey[this.actuals.join("")];
			console.log('guess', guess);
			console.log(`correct label: ${correctLabel}`);
			if (guess === correctLabel){
				correctGuesses ++;
			}
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
			if (arrayOfLayers){
				this.layers = arrayOfLayers;
			}
			this.output = [];
		}
		feedForward (testExample) {
			// clearTerminal();
			console.log(`feedForward(${testExample})`);
			let newSignal = testExample.boardState;
			this.layers.map(async layer => {
				layer.activations = newSignal;
				newSignal = await handled(layer.outputSignal);
			});
			return testExample.actuals;
		}
		backpropagate (actuals) {
			this.layers[this.layers.length - 1].actuals = actuals;
			const reversedLayers = [...this.layers].reverse();
			// console.log('reversedLayers', reversedLayers)
			reversedLayers.reduce((delta, layer) => {
				this.updateMomentumAdjustment(layer);
				console.log('layer.layerSize', layer.layerSize);
				return layer.backpropagateError(delta);
			}, 0);
			const results = this.layers.map(layer => layer.updates);
			results.shift();
			const iterationError = this.layers[this.layers.length - 1].totalError;
			// console.log(`guess: ${}`)
			
			console.log(`\n\n^^^Iteration Error: ${iterationError}`);
			// results.map(layer => console.table(layer[0], layer[1]));
			return results;
		}
		adjustLearningRate (error, max = 1, adjustmentRate = 1) {
			if (error > max) {
				this.layers.map(layer => layer.learningRate *= adjustmentRate);
			}
		}
		updateMomentumAdjustment (layer, momentumConstant = MOMENTUM_CONSTANT) {
			if (!layer.gradients.length) {
				return;
			}
			let momentumAdjustment = math.dotMultiply(momentumConstant, layer.gradients[layer.gradients.length - 1]);
			// console.log('momentumAdjustment', momentumAdjustment);
			layer.momentumAdjustment = momentumAdjustment;
		}
		async runTestIteration (testExample){
			const actuals = await handled(this.feedForward(testExample));
			return await handled(this.backpropagate(actuals));
		}
		async train (trainingData, epochs, updateVariables = true){
			let result;
			if (updateVariables) {
				this.layers.map(layer => layer.updateVariables = true)
			}
			for(let i = 1; i <= epochs; i ++){
				console.log(`\n\nEpoch: ${i}`);
				result = await handled(trainingData.map(testExample => this.runTestIteration(testExample)))
				this.output.push(result);
			}
			// console.log('this.layers', this.layers);
			let successRate = correctGuesses / (trainingData.length * epochs);
			console.log(`Success Rate = ${(successRate * 100).toFixed(4)}%`);
			return this.output;
		}
		saveState (filename) {
			// console.log('this.layers', this.layers);
			writeFile(filename, JSON.stringify(this), "utf8", (err) => {
				// console.log('this.layers', this.layers);
				console.error(err);
			});
		}
		test () {
			console.log("TEST COMPLETE")
		}
	}
	return { 
		game,
		clearTerminal,
		loadState,
		// rehydrate,
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


