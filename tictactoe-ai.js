const game = require("./tictactoe.js");
const math = require("mathjs");
const sigmoid = require("sigmoid");
const trainingData = require("./tictactoe-simulations.json");

const NeuralNetwork = (() => {
	const inputLayer0Size = 9;
	const hiddenLayer1Size = 8;
	const hiddenLayer2Size = 3;
	const outputLayerSize = 1;

	const reLu = (arrayZ, a = .01) => arrayZ.map((x) => x < 0 ? a * x : x);

	const softmax = (arrayZ) => {
		let denominator = arrayZ.reduce((sum, elementK) => sum + Math.exp(elementK));
		return arrayZ.map((elementJ) => {
			let numerator = Math.exp(elementJ);
			return numerator/denominator;
		});
	}

	class Neuron {
		constructor (type, layer) {
			this.layer = layer;
			this.synapses = [];

			class Synapse {
				constructor () {
					this.inputValue = 0;
					this.weight = Math.round(Math.random() * 10000) / 10000;//Initialize random weight between 0.0000 and 1.0000
				}
				reLu (x) { return x <= 0 ? x * .01 : x;}//"leaky" ReLu
				

			}



			
		}
		// layer: 0
		// synapses: {
		// 	inputValues: [0, 0, 0, 0, 0, 0, 0, 0, 0],
		// 	weights: [.5, .5, .5, .5, 1, .5, .5, .5, .5],
		// 	biases: [0, 0, 0, 0, 0, 0, 0, 0, 0],
		// 	get values () {
		// 		if (!this.inputValues.length) {
		// 			return console.log("this neuron has received no activation values.");
		// 		}
		// 		const inputs = math.matrix(this.inputValues);
		// 		const weights = math.matrix(this.weights);
		// 		const biases = math.matrix(this.biases);
		// 		return math.add(math.multiply(inputs, weights), biases).valueOf();
		// 	}
		// }
		// importTrainingData (data) {

		// }
		// get activation () {
		// 	const reLu = (x) => x <= 0 ? x * .01 : x;//"leaky" ReLu
		// 	const weightedInputValues = this.synapses.values;
		// 	console.log('weightedInputValues', weightedInputValues)
		// 	return weightedInputValues ? reLu(math.sum(weightedInputValues)): console.log("Could not process data.");
		// }
	}

	const Layer = {
		init: () => {

		},
		neurons: [],

	}



	const neuron = new Neuron;
	console.log("neuron.activation = ", neuron.activation);

	return {
		ProtoNeuron
	}

})();



