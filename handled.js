const handled = (promise) => {
	return promise.then(data => data)
	.catch(err => console.log("∞∞ ", err) && err)
}

const handled2 = (promise) => {
	try {
		return promise.then(data => data);
	}
	catch (err){
		return console.log("∞∞", err) && err;
	}
}

const testF = async (input) => {
	// const delayedOutput = await handled2((setTimeout(()=> Promise.reject(new Error("fuck!!")), 1000)))
	const delayedOutput = await handled2(setTimeout(()=> new Promise((resolve, reject) => reject("d'oh!"))))
	return delayedOutput;
}

{testF("what?");}