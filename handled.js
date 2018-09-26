const handled = (promise) => {
	try {
		return promise.then(data => data)
		.catch(err => console.log("handled.js intercepted error:", err) && err);
	}
	catch (err) {
		console.log("error in \"handled\": ", err);
	}
	// finally {
	// 	return promise;
	// }
}

const handled2 = (promise) => {
	try {
		return promise.then(data => data);
	}
	catch (err){
		return console.log("∞∞", err.stack) && err;
	}
}

const testF = async (input) => {
	// const delayedOutput = await handled2((setTimeout(()=> Promise.reject(new Error("fuck!!")), 1000)))
	const delayedOutput = await new Promise((resolve, reject) => {
		setTimeout(() => reject(input), 500)
		// reject("d'oh!"))
	})
	return delayedOutput;
}


const nonF = {answer: 42}

// const handledF = () => handled(testF("handledF!!"))
handled(testF("what?"));
// handled(nonF);
// handledF();

