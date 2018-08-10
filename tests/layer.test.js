 const cTable = require("console.table");
 const NeuralNetwork = require("../tictactoe-ai.js");
 const {game,
		clearTerminal,
		math,
		clipOutput,
		adjustedRandomGaussian,
		reLu,
		softmax,
		softmax2,
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

const randomizedSoftmaxInput = (minArrayLength = 1, maxArrayLength = 4) => {
	let randomArrayLength = randomInteger(minArrayLength, maxArrayLength);
	let outputArray = Array(randomArrayLength).fill(null).map(() => randomishNumber());
	return outputArray;
}
const softmaxTest1Input = [0, 1, 2, 4];
// test("01. softmax, for known result", () => {
// 	expect(math.round(softmax(softmaxTest1Input), 6)).toEqual([0.015219,
// 	0.041371, 0.112457, 0.830953], 6);// correct results based on https://keisan.casio.com/exec/system/15168444286206
// });
// test("02. softmax, for very large known result to test exp-normalization fix", () => {
// 	expect(math.round(softmax([999999, 999999, 999999]), 6)).toEqual([
// 	0.333333, 0.333333, 0.333333], 6);
// });
// test("03. softmax, random inputs", () => {
// 	for (let i = 0; i < 1000; i ++){
// 		let randomizedInput = randomizedSoftmaxInput();
// 		// console.log('randomizedInput', randomizedInput);
// 		let testArray = softmax(randomizedInput);
// 		let testArrayPrime = softmax(randomizedInput, true);
// 		// console.log('testArray', testArray);
// 		// let softmaxFixTest = softmax2(randomizedInput);
// 		// let softmaxFixTestPrime = softmax2(randomizedInput, true);
// 		// expect(testArray.length).toEqual(softmaxFixTest.length);
// 		// expect(testArrayPrime.length).toEqual(softmaxFixTestPrime.length);
// 		testArray.map((n , i) => {
// 			expect(isNaN(n)).toBe(false);
// 			expect(Math.sign(n)).not.toBe(-1);
// 			// expect(n).toBeCloseTo(softmaxFixTest[i]);
// 		});
// 		testArrayPrime.map((n , i) => {
// 			expect(isNaN(n)).toBe(false);
// 			expect(Math.sign(n)).not.toBe(-1);
// 			// expect(n).toBeCloseTo(softmaxFixTestPrime[i]);
// 		})
// 		let elementTotal = testArray.reduce((sum, n) => sum + n)
// 		// console.log('elementTotal', elementTotal);
// 		expect(elementTotal).toBeCloseTo(1, 5);
// 		randomizedInput.length === 1 ? expect(testArray[0]).toEqual(1) : null;
// 	}
// });
  
// test("fake", ()=>expect(true).toBe(true));

// const softmax2 = (arrayZ, derivative = false) => {
// 	// Math.exp outputs NaN if given a number greater than approx. 709.7827
// 	// Thanks to https://timvieira.github.io/blog/post/2014/02/11/exp-normalize-trick/ for this trick to avoid overflow!!
// 	let normalizer;
// 	if (!Math.max(arrayZ)) {
// 		normalizer = arrayZ[0];
// 	} else {
// 		// Use the input with the largest absolute value to normalize exponentiation calculations
// 		const absMax = Math.max(arrayZ.map(x => Math.abs(x)));
// 		let sign;
// 		arrayZ.some(n => {
// 			sign = Math.sign(n);
// 			return Math.abs(n) === absMax;
// 		});
// 		normalizer = absMax * sign;
// 	}
// 	if (derivative) {
// 		return softmaxPrime(arrayZ, normalizer);
// 	}
// 	if (!Array.isArray(arrayZ)){
// 		arrayZ = [arrayZ];
// 	}
// 	const denominator = arrayZ.reduce((sum, elementK) => sum + Math.exp(elementK - normalizer), 0);
// 	return arrayZ.map((elementJ) => {
// 		let numerator = Math.exp(elementJ - normalizer);
// 		return numerator/denominator;
// 	});
// }

// const softmaxPrime2 = (arrayZ, normalizer) => {
// 	if (!Array.isArray(arrayZ)){
// 		return 1;
// 	}
// 	const sqrtDenominator = (arrayZ.reduce((sum, z) => sum + Math.exp(z - normalizer), 0));
// 	let denominator = sqrtDenominator ** 2;
// 	const outputArray = arrayZ.map(z => {
// 		let numerator = Math.exp(z - normalizer) * (sqrtDenominator - Math.exp(z - normalizer));
// 		return numerator/denominator;
// 	});
// 	return outputArray; 
// }

console.log('softmax([710, 36, -0], true)', softmax([710, 36, -0], true));
console.log('softmax2([710, 36, -0], true)', softmax2([710, 36, -0], true));
console.log("\n");
console.log('softmax([1,2,3,4,-6], true)', softmax([1,2,3,4,-6], true));
console.log('softmax2([1,2,3,4,-6], true)', softmax2([1,2,3,4,-6], true));
console.log("\n");
console.log('softmax([-700, 9, 0], true)', softmax([-700, 9, 0], true));
console.log('softmax2([-700, 9, 0], true)', softmax2([-700, 9, 0], true));
console.log("\n");
console.log('softmax([-1,-0,0,1,90], true)', softmax([-1,-0,0,1,90], true));
console.log('softmax2([-1,-0,0,1,90], true)', softmax2([-1,-0,0,1,90], true));
console.log("\n");
console.log('softmax([-700000, 9, 7000])', softmax([-700000, 9, 7000]));
console.log('softmax2([-700000, 9, 7000])', softmax2([-700000, 9, 7000]));

console.log("\n");
// console.log('softmax(1, true)', softmax(1, true));
console.log('softmax2(1, true)', softmax2(1, true));

