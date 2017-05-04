const cherish = require("../src/index");

describe("Custom cache", () => {
    it("should allow specifying custom cache with get and set", () => {
        const myCustomCache = {};

        const simpleCache = {
            get: key => myCustomCache[key],
            set: (key, value) => myCustomCache[key] = value
        };

        const someFn = function(obj) { return arguments.length; };
        const wrappedFn = cherish(someFn, simpleCache);

        // Initially the cache should be empty
        expect(Object.keys(myCustomCache).length).toEqual(0);

        return wrappedFn("a")
            .then(result => {
                expect(result).toBe(1);

                // Each new result generates two new cache keys: lastTime and lastResult
                expect(Object.keys(myCustomCache).length).toEqual(2);

                // Finding our result in the cache means set() got called
                expect(myCustomCache[Object.keys(myCustomCache)[1]]).toBe(result);

                return wrappedFn("a");
            })
            .then(result => {
                // Same arguments -> cache gives same result -> no new keys
                expect(result).toBe(1);
                expect(Object.keys(myCustomCache).length).toEqual(2);
                return wrappedFn("b");
            })
            .then(result => {
                // New argument -> no cache hit -> another pair of keys in cache
                expect(Object.keys(myCustomCache).length).toEqual(4);
            });
    });
});
