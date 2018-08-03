const {softmax, reLu, adjustedRandomGaussian} = require("./tictactoe-ai.js");

test("f1 softmax(number) returns [1]", () => {
	const rand = Math.floor(Math.random() * 9) + 1;
	expect(softmax(rand)).toEqual([1]);
});

test("f2 adjustedRandomGaussian(4, 'reLu') returns a non-zero number", () => {
	let testResult = adjustedRandomGaussian(4, "reLu");
	expect(typeof testResult).toBe("number");
	expect(testResult).not.toEqual(0);
});