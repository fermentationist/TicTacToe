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
			console.log("not an array");
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
			console.log("not an array");
			arrayZ = [arrayZ];
		}
		let denominator = arrayZ.reduce((sum, elementK) => sum + (elementK * Math.exp(elementK - 1)), 0);
		return arrayZ.map((elementJ) => {
			let numerator = elementJ * Math.exp(elementJ - 1);
			return numerator/denominator;
		});
	}

	const crossEntropyCostFunction = (predictions, labels, derivative = false) => {
		console.log('predictions, labels, derivative', predictions, labels, derivative)
		if (derivative) {
			return crossEntropyPrime(predictions, labels);
		}
		return predictions.reduce((accum, prediction, i) =>{
			return accum - ((labels[i] || labels[labels.length - 1]) * Math.log(prediction));
		},0);
	}

	const crossEntropyPrime = (predictions, labels) => {
		return predictions.reduce((accum, prediction, i) =>{
			return accum + 1 / prediction;
		},0);
	}

	console.log("% ", crossEntropyCostFunction([.5, .65, 0.01, .99], [0, .5, 0, 1], true))



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
			this.learningRate = 0.5;
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
			
			return this.activationFn(math.sum(this.weightedInputs) + this.bias);
		}
		updateWeightsAndBias (errors) {
			console.log('errors', errors);
			const costPrime = errors ? errors : this.costFn(this.inputs, this.labels, true);
			console.log('costPrime a', costPrime);
			const deltaB = this.activationFn(this.bias, true) * costPrime;
			console.log('this.weightedInputs', this.weightedInputs);
			const deltaW = this.inputs.map((input) => {
				console.log('input', input)
				let result = this.activationFn(this.weightedInputs, true).map((weight, i) => {
					weight * input * costPrime[i];
				});
				
				// console.log('result', result);
				return result;
			});
			this.weights.map((weight, i) => {
				// console.log('i', i)
				// console.log('> deltaW', deltaW);
				// console.log('weight =>', weight);
				weight -= this.learningRate * deltaW[i];
				// console.log('deltaW[i]', deltaW[i]);
				// console.log('new weight', weight);
			});
			this.bias -= this.learningRate * deltaB;

			console.log('costPrime b', costPrime);
			return costPrime;
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
		constructor (inputLayer, costFn = crossEntropyCostFunction, classLabels = ["lose", "draw", "win"]) {
			super(softmax, inputLayer);
			this.costFn = costFn;
			this.labels = [0.33, 0.33, 0.33];
			this.classLabels = classLabels;
		}
		get error () {
			console.log("$$");
			console.log('this.labels', this.labels);
			console.log('this.outputSignal', this.outputSignal);
			return this.costFn(this.outputSignal, this.labels);
		}
		get prediction () {
			const certainty = math.max(this.outputSignal);
			const labelIndex =  this.outputSignal.indexOf(certainty) - 1;
			const prediction = this.classLabels[labelIndex];
			console.log('prediction', prediction);
			console.log('certainty', certainty);
			return [prediction, certainty];
		}
		get outputSignal () {
			return this.activationFn(this.weightedInputs);
		}
	}

	class Layer {
		constructor (neuronClass, numberOfNeurons, inputLayer) {
			this.neurons = Array(numberOfNeurons).fill(null).map(() => new neuronClass(inputLayer));
		}
		get outputSignal () {
			return this.neurons.map(neuron => neuron.outputSignal);
		}
		backprop (errors = null) {
			return this.neurons.map(neuron => neuron.updateWeightsAndBias(errors));
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

	layer2.backprop(layer3.backprop(layer4.backprop(layer4.costFn(layer4.inputs, layer4.labels, true))));

	return {
		Neuron
	}
	

})();



