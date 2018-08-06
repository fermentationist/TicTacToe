 const cTable = require("console.table");
 const NeuralNetwork = require("../tictactoe-ai.js");
 const {math,
 		reLu,
		softmax,
		crossEntropyCostFunction,
		Layer,
		InputLayer,
		HiddenLayer,
		OutputLayer,
		Network} = NeuralNetwork;

const inputLayer0 = new InputLayer(9, {inputVector: [0,1,2,3,4,5,6,7,8]});
const hiddenLayer1 = new HiddenLayer(8, {inputVector: inputLayer0.outputSignal});

const outputLayer2 = new OutputLayer(3, {inputVector: hiddenLayer1.outputSignal});
outputLayer2.actuals = [0,1,0];
console.log('inputLayer0.outputSignal', inputLayer0.outputSignal);
console.log('hiddenLayer1.outputSignal', hiddenLayer1.outputSignal);
console.log('outputLayer2.outputSignal', outputLayer2.outputSignal);
console.log('outputLayer2.results', outputLayer2.results);
console.log('outputLayer2.errors', outputLayer2.errors);
console.log('outputLayer2.inputMatrix', outputLayer2.inputMatrix);
const X ={ delta: 0.647603687809087,
  dependentWeights: 
   [ [ 0.11887659819337962,
       0.4256765069931383,
       -0.9192736098997577,
       -0.633770215817162,
       -1.1262269279570318,
       -0.30686796034405767,
       -0.5802454760120094,
       -1.2319562165312692 ],
     [ -0.6457423850614877,
       -1.1397344566097773,
       -0.3504426965830213,
       -0.34428335855039216,
       -0.7057056753250293,
       -1.1341703612161627,
       0.05394560992176861,
       -0.29348418339869253 ],
     [ 0.16201326949430828,
       -0.4104387265839933,
       0.25511783793996745,
       -0.3598379305891699,
       -1.1341384487769721,
       0.44504698445599167,
       0.4371856367055913,
       -1.219224422634968 ] ] }
console.log(hiddenLayer1.updateWeightsAndBiases(X));
// test("fake", ()=>expect(true).toBe(true));

// let db = .3;
// console.log('db', db)
// let dbT = math.transpose(db);
// console.log('dbT', dbT)
// let a = [

// 	[0,1,2,3,4,5,6,7],
// 	[0,1,2,3,4,5,6,7],
// 	[0,1,2,3,4,5,6,7]
// ]
// console.log('a', a)
// let aT = math.transpose(a);
// console.log('aT', aT)

// const dot = (x, y) => math.dotMultiply(x, y);
// const mult = (x, y) => math.multiply(x, y);

// // console.log('dot(db,a)', dot(db,a))
// // console.log('dot(a,db)', dot(a,db))
// // console.log('dot(db,aT)', dot(db,aT))
// // console.log('dot(dbT,a)', dot(dbT,a))
// // console.log('dot(aT,db)', dot(aT,db))
// // console.log('dot(a,dbT)', dot(a,dbT))
// // console.log('dot(aT,dbT)', dot(aT,dbT))
// // console.log('dot(dbT,aT)', dot(dbT,aT))

// console.log('mult(db,a)', mult(db,a))//1
// console.log('mult(a,db)', mult(a,db))
// console.log('mult(db,aT)', mult(db,aT))
// console.log('mult(dbT,a)', mult(dbT,a))//1
// console.log('mult(aT,db)', mult(aT,db))//1
// console.log('mult(a,dbT)', mult(a,dbT))
// console.log('mult(aT,dbT)', mult(aT,dbT))//1
// console.log('mult(dbT,aT)', mult(dbT,aT))