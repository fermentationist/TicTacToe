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
		console.log('prediction, label, derivative', prediction, label, derivative)
		if (derivative) {
			return crossEntropyPrime(predictions, label);
		}
		return predictions.map(prediction => -1 * label * Math.log(prediction));
	}

	const crossEntropyPrime = (predictions, label) => {
		return predictions.map(prediction => -1 * label / prediction);
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
	// ========================================================================



	class Neuron {
		constructor (inputLayer, activationFn, costFn = crossEntropyCostFunction) {
			this.activationFn = activationFn;// || function(x){return x};
			this.inputs = inputLayer || [];
			this.learningRate = 0.5;
			this.costFn = costFn;
			if (this.inputs.length > 1) {
				this.weights = inputLayer.map((input) => adjustedRandomGaussian(inputLayer.length, this.activationFn.name));
				this.bias = 0;
			}
		}
		get weightedInputs () {
			// console.log("weightedInputs called with this.inputs= " + this.inputs + " and this.weights= " + this.weights + " and this.bias= " + this.bias);
			return math.dotMultiply(this.inputs, this.weights).map(product => product + this.bias);
		}
		get activatedInputs () {
			// console.log("activatedInputs called");
			if (!this.activationFn) {
				return this.weightedInputs;
			}
			return this.activationFn(this.inputs); 
		}
		get outputSignal () {
			// console.log("outputSignal called");
			if (!this.activationFn) {
				console.log("No activation function present, returning raw inputs...");
				return this.inputs;
			}
			return math.sum(this.activatedInputs);
		}
		updateWeightsAndBias (actual) {
			const costPrime = this.costFn(this.activatedInputs, this.actual, true);
			console.log('costPrime', costPrime);
			const deltaB = this.activationFn(this.weightedInputs, true).reduce((accum, weight, i) => accum + weight * costPrime[i])
			console.log('deltaB', deltaB);
			// console.log('this.weightedInputs', this.weightedInputs);
			const deltaW = this.inputs.map((input, i) => {
				console.log('input', input)
				let result = this.activationFn(this.weightedInputs[i], true) * input * costPrime[i];
				
				console.log('result', result);
				return result;
			});
			console.log('deltaW', deltaW)
			const newWeights = this.weights.map((weight, i) => {
				console.log('> deltaW[i]', deltaW[i]);
				console.log('weight =>', weight);
				weight -= this.learningRate * deltaW[i];
				console.log('deltaW[i]', deltaW[i]);
				console.log('new weight', weight);
				return weight
			});
			console.log('newWeights', newWeights);
			const newBias = this.bias -= this.learningRate * deltaB;
			this.weights = newWeights;
			this.bias = newBias;
			console.log('costPrime b', costPrime);
			console.log('actual', actual);
			return actual;
		}
	}

	class InputNeuron extends Neuron {
		constructor (initialValue) {
			super(initialValue, null);
		}
	}

	class HiddenNeuron extends Neuron {
		constructor (inputLayer) {
			super(inputLayer, softmax);
		}
	}

	class OutputNeuron extends Neuron {
		constructor (inputLayer, classLabels = ["lose", "draw", "win"]) {
			super(inputLayer, softmax, crossEntropyCostFunction);
			this.actual = 0.33;
			this.classLabels = classLabels;
		}
		get error () {
			console.log("$$");
			console.log('this.actual', this.actual);
			console.log('this.outputSignal', this.outputSignal);
			return this.costFn(this.outputSignal, this.actual);
		}
		get prediction () {
			const certainty = math.max(this.outputSignal);
			const labelIndex =  this.outputSignal.indexOf(certainty) - 1;
			const prediction = this.classLabels[labelIndex];
			console.log('prediction', prediction);
			console.log('certainty', certainty);
			return [prediction, certainty];
		}
	}

	class Layer {
		constructor (neuronClass, numberOfNeurons, inputLayer) {
			this.neurons = Array(numberOfNeurons).fill(null).map(() => new neuronClass(inputLayer));
		}
		get outputSignal () {
			return this.neurons.map(neuron => neuron.outputSignal);
		}
		get weights () {
			return this.neurons.map(neuron =>  neuron.weights);
		}
		backprop (actuals) {
			console.log('actual in backprop callL:', actuals)
			let output =  this.neurons.map((neuron, i) => neuron.updateWeightsAndBias(actuals[i] || actuals[actuals.length - 1]));
			console.log('output', output);
			return output;

		}
	}

	const layer0 = new Layer(InputNeuron, 9, 1);
	console.log('\nlayer0', layer0.outputSignal);

	const layer1 = new Layer(HiddenNeuron, 9, layer0.outputSignal);
	console.log('\nlayer1', layer1.outputSignal);

	const layer2 = new Layer(HiddenNeuron, 8, layer1.outputSignal);
	console.log('\nlayer2', layer2.outputSignal);

	const layer3 = new Layer(HiddenNeuron, 3, layer2.outputSignal);
	console.log('\nlayer3', layer3.outputSignal);

	const layer4 = new Layer(OutputNeuron, 1, layer3.outputSignal);
	console.log('\nlayer4', layer4.outputSignal);

	layer1.backprop(layer2.backprop(layer3.backprop(layer4.backprop([0.33]))));

	// console.log('layer4.weights', layer4.weights);
	// layer4.backprop([0.33]);
	// console.log('layer4.weights', layer4.weights);
	return { crossEntropyCostFunction,
		Neuron,
		layer4
	}
	

})();

let lossTest = NeuralNetwork.crossEntropyCostFunction([0.55, 0.99, 0.001], 1);
console.log('lossTest', lossTest);

