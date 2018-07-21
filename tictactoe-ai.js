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

	const crossEntropyLossFunction = (predictions, actuals) => {
		return predictions.reduce((accum, prediction, i) =>{
			return accum - ((actuals[i] || actuals[actuals.length - 1]) * Math.log(prediction));
		},0);
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
			
			return this.activationFn(math.sum(this.weightedInputs) + this.bias);
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
		constructor (inputLayer, lossFn = crossEntropyLossFunction, classLabels = ["lose", "draw", "win"]) {
			super(softmax, inputLayer);
			this.lossFn = lossFn;
			this.actuals = [0.33, 0.33, 0.33];
			this.classLabels = classLabels;
		}
		get error () {
			console.log("$$");
			console.log('this.actuals', this.actuals);
			console.log('this.outputSignal', this.outputSignal);
			console.log('this.lossFn', this.lossFn);
			return this.lossFn(this.outputSignal, this.actuals);
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
	console.log('\nJSON.stringify(layer3)', JSON.stringify(layer3));

	console.log("error = ", layer4.neurons[0].error);

	console.log("")

	return {
		Neuron
	}
	

})();



