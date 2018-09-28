const handledModule = (() => {

	const handlePromise = (promiseToBeHandled) => {
		try {
			return promiseToBeHandled
				.then(data => data)
				.catch(err => {
					console.log("\x1b[31m", "ø error:", err, "\n ø", promiseToBeHandled);
					return console.log("\x1b[0m") && err;
			});
		}
		catch (err) {
			console.log("\x1b[31m", "error in \"handlePromise\": ", err);
			return console.log("\x1b[0m") && err;
		}
	}

	const handleAll = (promisesToBeHandled) => {
		try {
			let handledPromises = promisesToBeHandled.map(promise => handlePromise(promise))
			return handledPromises;
		}
		catch (err) {
			console.log("\x1b[31m", "error in \"handleAll\": ", err);
			return console.log("\x1b[0m") && err;
		}
	}

	const handleAsyncFn = (functionToBeHandled) => {
		return async function () {
			try{
				return await functionToBeHandled.apply(this, Array.from(arguments));
			}
			catch(err){
				console.log("\x1b[31m", "ø error:", err);
				return console.log("\x1b[0m") && err;
			}
		}
	}

	const assignDotShortcut = (shortcut) => {
		Object.defineProperty(Object.prototype, shortcut, {
			get: function (){
				const promiseTest = x => typeof x.then === "function";
				const isPromise = promiseTest(this);
				const isFunction = typeof this === "function";
				const isPromiseArray = Array.isArray(this) && this.every(x => promiseTest(x));
				return isPromise ? handlePromise(this) : 
					isFunction ? handleAsyncFn(this) : 
					isPromiseArray  ? handleAll(this):
					this;
			}
		});
	}
	const defaultShortcut = () => assignDotShortcut("ø");
	defaultShortcut();
	return {handlePromise, handleAll, handleAsyncFn, assignDotShortcut}
	
})();

module.exports = handledModule;


