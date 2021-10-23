//Hyperparameters
const LEARNING_RATE = 0.1;
const MOMENTUM_CONSTANT = 0.1//0.75;

const NeuralNetwork = (() => {
  const randomGaussian = require("random").normal(mu = 0, sigma = 1);
  const math = require("mathjs");
  const cTable = require("console.table");
  const {readFileSync, writeFileSync, appendFileSync} = require("fs");
  let correctGuesses = 0;

  const adjustedRandomGaussian = (inputLayerSize, activationFn) => {
    const rnd = randomGaussian();
    // console.log('\nrnd', rnd)
    if (!activationFn || activationFn.name.toLowerCase() === "relu") {
      return (rnd * Math.sqrt(2/inputLayerSize));
    }
    if (activationFn.name.toLowerCase() === "softmax" || 
      activationFn.name.toLowerCase() === "tanh") {
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
    return outputArray;
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
        const ij = i === j ? s[i] * (1 - s[i]) : -s[i] * s[j];
        jacobian[i][j] = ij > Number.MAX_VALUE ? Number.MAX_VALUE : ij < Number.MAX_VALUE * -1 ? Number.MAX_VALUE * -1 : ij;
        if (jacobian[i][j] === Infinity || jacobian[i][j] === -Infinity) {
          console.log("\n\n:::INFINITY:::\n\n");
          process.exit(666);
        }
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

  const loadState = (filename) => {
    const loadedFile = readFileSync(filename, "utf8");
    const parsedFile = JSON.parse(loadedFile);
    const [inputLayer] = parsedFile.layers.filter(layer => layer.layerType === "input");
    const hiddenLayers = parsedFile.layers.filter(layer => layer.layerType === "hidden");
    const [outputLayer] = parsedFile.layers.filter(layer => layer.layerType === "output");
    const rehydratedInputLayer = new InputLayer(inputLayer.layerSize, {inputVector: Array(inputLayer.layerSize).fill(0), weights: inputLayer.weights, biases: inputLayer.biases});
    let inputVector = Array(inputLayer.layerSize).fill(0);
    const rehydratedHiddenLayers = hiddenLayers.map(layer => {
      const newLayer = new HiddenLayer(layer.layerSize, {inputVector: inputVector, weights: layer.weights, biases: layer.biases});
      inputVector = Array(newLayer.layerSize).fill(0);
      return newLayer;
    });
    const rehydratedOutputLayer = new OutputLayer(outputLayer.layerSize, {inputVector: inputVector, weights: outputLayer.weights, biases: outputLayer.biases});
    const rehydratedNetwork = new Network([rehydratedInputLayer, ...rehydratedHiddenLayers, rehydratedOutputLayer]);
    return rehydratedNetwork;
  }

  class Layer {
    constructor (layerSize, {inputVector, activationFn, costFn, labels, weights, biases, learningRate = LEARNING_RATE, momentum} = {}) {
      this.layerSize = layerSize;
      this.activations = inputVector;
      this.weights = weights || Array(this.layerSize).fill(null).map(() => {
        const numWeights = this.activations.length;
        return Array(numWeights).fill(null).map(() => adjustedRandomGaussian(numWeights, this.activationFn));
      });
      this.biases = biases || Array(this.layerSize).fill(0);
      this.activationFn = activationFn;
      this.costFn = costFn || crossEntropyCostFunction;
      this.labels = labels || [];
      this.learningRate = learningRate;
      this.updateVariables = true;
      this.momentumAdjustment = this.weights.map(n => 0);
      this.updates = [];
      this.gradients = [];
      this.layerType = "layer"
    }
    get inputMatrix () {
      let matrix = Array(this.layerSize).fill(this.activations);
      return matrix;
    }
    get weightedInputs () {
      return math.multiply(this.activations, this.transposedWeights);
    }
    get weightedAndBiasedInputs () {
      return this.weightedInputs.map((input, i) => {
        let biased = parseFloat(input) + parseFloat(this.biases[i]);
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
        // console.log("this.learningRate", this.learningRate);
        // console.log("nablaW[index]", nablaW[index]);
        // console.log("this.momentumAdjustment[index]", this.momentumAdjustment[index]);
        let updatedWeight = math.subtract(neuronWeights, changeToWeight);
        return updatedWeight;
      });
      // console.log("newWeights:", newWeights);
      if (newWeights[0].includes(NaN)) {
        console.log("\n\n•••NaN•••\n\n")
        process.exit(0);
      }
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
      this.layerType = "input";
    }
    get outputSignal () {
      return this.activations;
    }
    backpropagateError({delta, dependentWeights}) {
      let totalDelta = delta.reduce((sum, n) => sum + n, 0);
      return totalDelta;
    }
  }

  class HiddenLayer extends Layer {
    constructor (layerSize, {inputVector, weights, biases} = {}) {
      super(layerSize, {inputVector: inputVector, weights, biases, activationFn: reLu});
      this.layerType = "hidden";
    }
    backpropagateError ({delta, dependentWeights}) {
      return super.backpropagateError({delta, dependentWeights});
    }
  }

  class OutputLayer extends Layer {
    constructor (layerSize, {inputVector, weights, biases, classLabels = ["lose", "draw", "win"]} = {}) {
      super(layerSize, {inputVector: inputVector, weights, biases, activationFn: softmax});
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
      const outcomeKey = {
        "001": "win",
        "010": "draw",
        "100": "lose"
      };
      // console.table(this.results); 
      const outputValues = Object.values(this.results);
      let guessValue = Math.max(...outputValues);
      let guess = this.classLabels[outputValues.indexOf(guessValue)];
      let correctLabel = outcomeKey[this.actuals.join("")];
      // console.log('guess:', guess);
      // console.log(`correct label: ${correctLabel}`);
      if (guess === correctLabel){
        correctGuesses ++;
      }
      const costDeriv = this.costFn(this.outputSignal, this.actuals, true);
      const delta = math.multiply(costDeriv, this.outputDeriv);	
      // console.log("costDeriv:", costDeriv);
      // console.log("this.outputDeriv", this.outputDeriv);
      const nablaB = delta;
      // console.log("nablaB", nablaB);
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
      let newSignal = testExample.boardState;
      this.layers.forEach(layer => {
        layer.activations = newSignal;
        newSignal = layer.outputSignal;
        layer.actuals = testExample.actuals;
      });
      return this.layers[this.layers.length - 1].outputSignal;
    }
    backpropagate (actuals) {
      // this.layers[this.layers.length - 1].actuals = actuals;
      const reversedLayers = [...this.layers].reverse();
      const totalDelta = reversedLayers.reduce((delta, layer) => {
        this.updateMomentumAdjustment(layer);
        return layer.backpropagateError(delta);
      }, 0);
      // console.log("TOTAL DELTA:", totalDelta);
      const results = this.layers.map(layer => layer.updates);
      results.shift();
      const iterationError = this.layers[this.layers.length - 1].totalError;
      // console.log(`\n\nIteration Error: ${iterationError}`);
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
      layer.momentumAdjustment = momentumAdjustment;
    }
    runTestIteration (testExample){
      const prediction = this.feedForward(testExample);
      // console.log("🚀 prediction:", prediction)
      const results = this.backpropagate(testExample.actuals);
      return results;
    }
    predict (trainingData) {
      let results;
      results = trainingData.map((testExample, index) => {
        try {
          return this.feedForward(testExample);
        }
        catch (err) {
          console.log(`\nTraining iteration failed for training data at index: ${index} \n${testExample}`);
          console.log("\nERROR:\n" + err);
          return null;
        }
      })
      this.output.push(results);
      let successRate = correctGuesses / (trainingData.length);
      console.log(`Success Rate = ${(successRate * 100).toFixed(4)}%`);
      return this.output;
    }
    train (trainingData, epochs, updateVariables = true){
      let result;
      if (updateVariables) {
        this.layers.map(layer => layer.updateVariables = true)
      }
      for(let i = 1; i <= epochs; i ++){
        console.log(`\n\nEpoch: ${i}`);
        result = trainingData.map((testExample, index) => {
          try {
            return this.runTestIteration(testExample);
          }
          catch (err) {
            console.log(`\nTraining iteration failed for training data at index: ${index} \n${testExample}`);
            console.log("\nERROR:\n" + err);
            return null;
          }
        })
        this.output.push(result);
      }
      let successRate = correctGuesses / (trainingData.length * epochs);
      console.log(`Success Rate = ${(successRate * 100).toFixed(4)}%`);
      return this.output;
    }
    saveState (filename) {
      const start = `{"layers":[`;
      writeFileSync(filename, start, "utf8");
      // return;
      this.layers.forEach((layer, index) => {
        console.log("appending layer " + index);
        const separator = index === this.layers.length - 1 ? "" : ",";
        const data = JSON.stringify(layer) + separator;
        appendFileSync(filename, data, "utf8");
      });
      const end = "]}";
      appendFileSync(filename, end, "utf8");
      console.log("Done appending file");
    }
  }
  return { 
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


