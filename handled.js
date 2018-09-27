
const handled = (promise) => {
	try {
		return promise.then(data => data)
		.catch(err => {
			console.log("\x1b[31m", "handled.js intercepted error:", err, "\nin ", promise);
			return console.log("\x1b[0m") && err;
		})
	}
	catch (err) {
		console.log("\x1b[31m", "error in \"handled\": ", err);
		return console.log("\x1b[0m") && err;
	}
}

const assignPropShortcut = (shortcut) => {
	Object.defineProperty(Object.prototype, shortcut, {
		get: function (){
			return handled(this);
		}
	});
}


// Object.defineProperty( Object.prototype, "handled", {
// 	get: function (){
// 		return handled(this);
// 	}
// });

module.exports = {handled, assignPropShortcut}


