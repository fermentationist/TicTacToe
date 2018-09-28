const handled = require("./handled.js");

const rejectedPromise = (async (input) => {
	const delayedOutput = await new Promise((resolve, reject) => {
		setTimeout(() => reject(input), 750)
	})
	return delayedOutput;
}).ø;

let resolvingPromise = (async (input) => {
	const delayedOutput = await new Promise((resolve, reject) => {
		setTimeout(() => resolve(input), 750)
	})
	return delayedOutput;
});

let plainFunction = () => console.log("hello from plainFunction");
let errorFunction = () => {throw Error("errorFunction error!")};
errorFunction = errorFunction.ø
plainFunction = plainFunction.ø;
// console.log('plainFunction', plainFunction);
// console.log('errorFunction', errorFunction);
let nonF = {answer: 42}
let arrayOfPromises = [
	rejectedPromise("D'oh!"),
	resolvingPromise("D'uh!")
]
let arrayOfInts = [ 0, 1, 2 ];
// const testPromise = {}//new Promise(()=>{});
// console.log(`typeof testPromise = ${testPromise.then(()=>{})}`);
rejectedPromise("Ho!");
rejectedPromise("Hey!").ø;
resolvingPromise("howdy!").ø;
nonF === nonF.ø;
arrayOfInts === arrayOfInts.ø;
arrayOfPromises === arrayOfPromises.ø;
// console.log('arrayOfPromises', arrayOfPromises);
// console.log('arrayOfInts', arrayOfInts);
// console.log('nonF', nonF);

let promiseArray2 = [
	rejectedPromise("rejected 1"),
	resolvingPromise("resolving 2"),
	rejectedPromise("rejected 3"),
	resolvingPromise("resolving 4"),
	rejectedPromise("rejected 5"),
	resolvingPromise("resolving 6")
].ø;

// console.log(promiseArray2)

// setTimeout(()=>console.log(promiseArray2), 2000)
// rejectedPromise("hello?").ø.then(rejectedPromise("what?").ø).then(resolvingPromise("how?").ø);

// const promises = [
// 	rejectedPromise("hello?"),
// 	rejectedPromise("what?"),
// 	resolvingPromise("how?")
// ]

// handleAll(promises);



