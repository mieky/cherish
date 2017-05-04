const cherish = require("../src/index");

describe("Argument-based caching", () => {
    it("should make a difference between invocation arguments", () => {
        function namedFn() { return arguments.length; }
        const wrappedFn = cherish(namedFn);

        expect.assertions(2);

        return wrappedFn(1, 2).then(result => {
            expect(result).toBe(2);
            return wrappedFn(1, 2, ["a", "b"]);
        })
        .then(result => expect(result).toBe(3));
    });

    it("should give same results for same arguments", () => {
        function namedFn() { return arguments.length; }
        const wrappedFn = cherish(namedFn);
        const args1 = [1, 2, ["a"]];
        const args2 = [1, 2, () => 42];
        let resultForArgs1;
        let resultForArgs2;

        expect.assertions(2);

        return wrappedFn(...args1)
            .then(result1 => {
                resultForArgs1 = result1;
                return wrappedFn(...args2);
            })
            .then(result2 => {
                resultForArgs2 = result2;
                return wrappedFn(...args1);
            })
            .then(result1 => {
                expect(result1).toBe(resultForArgs1);
                return wrappedFn(...args2);
            })
            .then(result2 => {
                expect(result2).toBe(resultForArgs2);
            });
    });
});
