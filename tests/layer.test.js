 const cTable = require("console.table");
 const NeuralNetwork = require("../tictactoe-ai.js");
 const {game,
 		clearTerminal,
 		math,
 		reLu,
		softmax,
		crossEntropyCostFunction,
		Layer,
		InputLayer,
		HiddenLayer,
		OutputLayer,
		Network} = NeuralNetwork;

// clearTerminal();
const inputLayer0 = new InputLayer(9, {inputVector: [0,1,0,0,1,-1,0,-1,0]});
const hiddenLayer1 = new HiddenLayer(8, {inputVector: inputLayer0.outputSignal});

const outputLayer2 = new OutputLayer(3, {inputVector: hiddenLayer1.outputSignal});
const net = new Network([inputLayer0, hiddenLayer1, outputLayer2]);

// net.backpropagate([0,1,0]);

const testExample = [{
	boardState: [0,1,0,0,1,-1,0,-1,0],
	actuals: [0,1,0]
}];

// let output =  async () => console.log(await net.train(10, testExample));
// output()
console.log('net.layers[2].weights before', net.layers[2].weights)
net.feedForward(testExample[0]);
console.log('net.layers[2].weights after', net.layers[2].weights)
// console.log('inputLayer0.outputSignal', inputLayer0.outputSignal);
// console.log('hiddenLayer1.outputSignal', hiddenLayer1.outputSignal);
// console.log('outputLayer2.outputSignal', outputLayer2.outputSignal);
// console.log('outputLayer2.results', outputLayer2.results);
// console.log('outputLayer2.totalError', outputLayer2.totalError);


// const X ={ delta: [ -1.1348366583601339e-8,
//   -1.1686920017609997e-8,
//   -3.385534152523912e-10 ],
//   dependentWeights: 
//    [ [ 0.11887659819337962,
//        0.4256765069931383,
//        -0.9192736098997577,
//        -0.633770215817162,
//        -1.1262269279570318,
//        -0.30686796034405767,
//        -0.5802454760120094,
//        -1.2319562165312692 ],
//      [ -0.6457423850614877,
//        -1.1397344566097773,
//        -0.3504426965830213,
//        -0.34428335855039216,
//        -0.7057056753250293,
//        -1.1341703612161627,
//        0.05394560992176861,
//        -0.29348418339869253 ],
//      [ 0.16201326949430828,
//        -0.4104387265839933,
//        0.25511783793996745,
//        -0.3598379305891699,
//        -1.1341384487769721,
//        0.44504698445599167,
//        0.4371856367055913,
//        -1.219224422634968 ] ] }
// console.log(outputLayer2.backpropagateError());
// console.log(hiddenLayer1.backpropagateError(X));

// console.log('softmax([1, 2, 3], true)', softmax([1, 2, 3], true));
// const e = n => Math.exp(n);
// const e1 = e(1);
// const e2 = e(2);
// const e3 = e(3);
// const resulta = e1 * (e2 + e3)/(e1 + e2 + e3) ** 2
// console.log('resulta', resulta)

// test("fake", ()=>expect(true).toBe(true));

