const storage = {};
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

function hashCode(str) {
    /* eslint-disable no-bitwise */
    return str.split("").reduce((prevHash, currVal) =>
        ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0);
    /* eslint-enable */
}

// Wrap a given function so that the result is cached and only refreshed
// after a given period of time has passed since the last result
function wrapFunction(fn, ttlSeconds) {
    if (!fn || !(fn instanceof Function)) {
        throw new Error("First argument to wrapFunction() should be a function");
    }

    const cacheKey = fn.name || hashCode(fn.toString());
    if (!cacheKey) {
        throw new Error(`Couldn't determine cache key for function to be cached`);
    }

    const TIME_ID = `lastTime_${cacheKey}`;
    const RESULT_ID = `lastResult_${cacheKey}`;
    const TTL_SECONDS = ttlSeconds || 300;

    log(`Caching calls to ${cacheKey} (${TTL_SECONDS} seconds)`);

    return function returnCachedResultAsync(args) {
        log(`Function ${fn.name} called`);

        const lastFetchTime = storage[TIME_ID];
        const lastFetchAge = (Date.now() - lastFetchTime) / 1000;
        const previousFetchFinished = storage[RESULT_ID] !== undefined;

        const canUseResultFromCache = !!lastFetchTime &&
            previousFetchFinished && lastFetchAge < TTL_SECONDS;

        if (canUseResultFromCache) {
            log("Previous result still valid, returning from cache");

            return new Promise((resolve, reject) => {
                try {
                    const result = storage[RESULT_ID];
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
        storage[TIME_ID] = Date.now();

        const currentCall = Promise.resolve(fn(args))
            .then(result => {
                log("Caching result...");

                // Cache results for next use
                storage[RESULT_ID] = result;

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
