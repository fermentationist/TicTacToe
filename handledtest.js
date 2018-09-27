const {handled, assignPropShortcut} = require("./handled.js");
assignPropShortcut("Ø");

// Object.defineProperty( Object.prototype, "E", {
// 	get: function (){
// 		return handled(this);
// 	}
// });

const testF = async (input) => {
	// const delayedOutput = await handled2((setTimeout(()=> Promise.reject(new Error("fuck!!")), 1000)))
	const delayedOutput = await new Promise((resolve, reject) => {
		setTimeout(() => reject(input), 500)
		// reject("d'oh!"))
	})
	return delayedOutput;
}

let testS = async (input) => {
	// const delayedOutput = await handled2((setTimeout(()=> Promise.reject(new Error("fuck!!")), 1000)))
	const delayedOutput = await new Promise((resolve, reject) => {
		setTimeout(() => resolve(input), 500)
		// reject("d'oh!"))
	})
	return delayedOutput;
}


const nonF = {answer: 42}


testF("hello?").Ø.then(testF("what?").Ø).then(testS("how?").Ø)



