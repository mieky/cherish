const cherish = require("../src/index");

describe("Basic usage", () => {
    it("should throw an Error when called without a Function argument", () => {
        let errorThrown = false;
        try {
            const foo = cherish();
            console.log(foo);
        } catch (err) {
            errorThrown = true;
        }
        expect(errorThrown).toBe(true);
    });

    it("should wrap an anonymous function", () => {
        const wrappedAnonFn = cherish((() => true));

        expect.assertions(2);
        expect(wrappedAnonFn).toBeInstanceOf(Function);
        return wrappedAnonFn().then(result => {
            expect(result).toBe(true);
        });
    });

    it("should wrap a named function", () => {
        function namedFn() { return true; }
        const wrappedFn = cherish(namedFn);

        expect.assertions(2);
        expect(wrappedFn).toBeInstanceOf(Function);
        return wrappedFn().then(result => {
            expect(result).toBe(true);
        });
    });

    it("should cache result only for a given time", () => {
        const getRandomNumber = () => Math.round(Math.random() * 5000);

        // Remember all calls to getRandomNumber() for one second
        const promiseRandomNumber = cherish(getRandomNumber, 1);

        let firstValue = null;
        promiseRandomNumber().then(result => {
            firstValue = result;
        });

        expect.assertions(4);

        return promiseRandomNumber()
            .then(result => {
                expect(result).toBe(firstValue);
                return promiseRandomNumber();
            })
            .then(result => {
                expect(result).toBe(firstValue);
                return promiseRandomNumber();
            })
            .then(result => {
                expect(result).toBe(firstValue);
                return new Promise(resolve => {
                    setTimeout(() => {
                        // After two seconds, the result should have changed
                        promiseRandomNumber().then(res => {
                            expect(res).not.toBe(firstValue);
                            resolve(res);
                        });
                    }, 2000);
                });
            });
    });
});
