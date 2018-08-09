 const cTable = require("console.table");
 const NeuralNetwork = require("../tictactoe-ai.js");
 const {game,
		clearTerminal,
		math,
		clipOutput,
		adjustedRandomGaussian,
		reLu,
		softmax,
		crossEntropyCostFunction,
		Layer,
		InputLayer,
		HiddenLayer,
		OutputLayer,
		Network} = NeuralNetwork;
console.log("\n\n\n\n\n\n\n");
clearTerminal();
const inputLayer0 = new InputLayer(9, {inputVector: [1,2,0,1,2,1,1,0,1]});
const hiddenLayer1 = new HiddenLayer(8, {inputVector: inputLayer0.outputSignal});

const outputLayer2 = new OutputLayer(3, {inputVector: hiddenLayer1.outputSignal});
const net = new Network([inputLayer0, hiddenLayer1, outputLayer2]);

// net.backpropagate([0,1,0]);

const testExample = [{
	boardState: [0,1,0,0,1,-1,0,-1,0],
	actuals: [0,1,0]
}];

const testExample2 = [{
	boardState: [1,2,0,1,2,1,1,0,1],
	actuals: [1,0,0]
}];
// let output =  async () => console.log(await net.train(10, testExample));
// output()
// console.log('net.layers[2].weights before', net.layers[2].weights)
// net.train(10,testExample);

const trainingTest = async () =>{
	let out = await net.train(50,testExample2);
	// console.log('net.layers[2].weights after', net.layers[2].weights)
	return out;
}

// trainingTest();

const randomNumber = (min, max) => Math.random() * (max - min) + min;
const randomInteger = (min, max) => Math.floor(randomNumber(min, max));

const randomishNumber = () => {
	const dieRoll = Math.floor(Math.random() * 100);
	const sign = Math.floor(dieRoll) % 2 === 0 ? -1 : 1;
	if (dieRoll <= 3) {
		return sign * 0;
	}
	if (dieRoll <= 6) {
		return sign * 1;
	}
	return randomNumber(1e-33,200) * sign;
}

const randomizedSoftmaxInput = (minArrayLength = 0, maxArrayLength = 20) => {
	let randomArrayLength = randomInteger(minArrayLength, maxArrayLength);
	let outputArray = Array(randomArrayLength).fill(null).map(() => randomishNumber());
	return outputArray;
}

let sergio = randomizedSoftmaxInput();
console.log('sergio', sergio);

// const softmaxTestInput = [0, 1, 2, 4]
// test("01. softmax", () => {
// 	expect(math.round(softmax(softmaxTestInput), 6)).toEqual([0.015219,
// 0.041371, 0.112457, 0.830953], 6);
// test("02. softmax", () => {
// 	for (let i; i < 1000; i ++){
// 		Math.random() * (Math.random() * 10
// 	}
// 	expect(softmax(randomizedSoftmaxInput)).not.toContain
// 	})
//   // correct results based on https://keisan.casio.com/exec/system/15168444286206
// });
// test("fake", ()=>expect(true).toBe(true));

