const defaultStorage = new Map();
const pendingCalls = {};

/**
 * Conditionally console.log() the given args, if environment variable DEBUG is set.
 */
function log(args) {
    if (!process.env.DEBUG) {
        return;
    }
    console.log.apply(args);
}

/**
 * Generate a hashcode from string.
 *
 * @param {string} str Subject string
 */
function hashCode(str) {
    /* eslint-disable no-bitwise */
    return str.split("").reduce((prevHash, currVal) =>
        ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0);
    /* eslint-enable */
}

/**
 * Get cache key specifically for the invocation fn(args).
 *
 * @param {Function} fn Function to determine cache key for
 * @param {*} args Invocation argument list to include in cache key
 */
function getCacheKey(fn, args = []) {
    const fnName = fn.name || hashCode(fn.toString());
    const replacer = (key, value) => {
        if (typeof value === "function") {
            return value.toString();
        }
        return value;
    };
    return JSON.stringify([fnName, ...args], replacer);
}

/**
 * Wrap a given function so that the result is cached and only refreshed
 * after a given period of time has passed since the last result.
 *
 * Possible keys for the `options` object:
 * - ttl: Number of seconds the result is valid (defaults to 300)
 * - get: custom storage get function (optional)
 * - set: custom storage set function (optional)
 *
 * @param {Function} fn Function to wrap
 * @param {Object} [options]
 */
function wrapFunction(fn, options = {}) {
    if (!fn || !(fn instanceof Function)) {
        throw new Error("First argument to wrapFunction() should be a function");
    }

    // Use cache getter and setter provided in options, or fallback to default
    const storage = (options.get && options.set) ?
        { get: options.get, set: options.set } :
        defaultStorage;

    const TTL_SECONDS = options.ttl || 300;
    log(`Caching calls to ${getCacheKey(fn)} (${TTL_SECONDS} seconds)`);

    return function returnCachedResultAsync(...args) {
        log(`Function ${fn.name} called`);

        // Take arguments into account -> cache key might differ between invocations
        const cacheKey = getCacheKey(fn, args);
        if (!cacheKey) {
            throw new Error(`Couldn't determine cache key for function to be cached`);
        }

        const TIME_ID = `lastTime_${cacheKey}`;
        const RESULT_ID = `lastResult_${cacheKey}`;

        const lastFetchTime = storage.get(TIME_ID);
        const lastFetchAge = (Date.now() - lastFetchTime) / 1000;
        const previousFetchFinished = storage.get(RESULT_ID) !== undefined;

        const canUseResultFromCache = !!lastFetchTime &&
            previousFetchFinished && lastFetchAge < TTL_SECONDS;

        if (canUseResultFromCache) {
            log("Previous result still valid, returning from cache");

            return new Promise((resolve, reject) => {
                try {
                    const result = storage.get(RESULT_ID);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
        }

        if (pendingCalls[cacheKey]) {
            log("Pending result found, returning it...");
            return pendingCalls[cacheKey];
        }

        log("Refreshing...");
        storage.set(TIME_ID, Date.now());

        const currentCall = Promise.resolve(fn.apply(this, args))
            .then(result => {
                log("Caching result...");

                // Cache results for next use
                storage.set(RESULT_ID, result);

                // Erase pending call from bookkeeping
                pendingCalls[cacheKey] = null;
                delete pendingCalls[cacheKey];

                return result;
            });

        pendingCalls[cacheKey] = currentCall;
        return currentCall;
    };
}

module.exports = wrapFunction;
