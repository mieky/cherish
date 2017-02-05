const storage = {};
const pendingCalls = {};

function log(args) {
    if (!process.env.DEBUG) {
        return;
    }
    console.log(args);
}

// Wrap a given function so that the result is cached and only refreshed
// after a given period of time has passed since the last result
function wrapFunction(fn, ttlSeconds) {
    const cacheKey = fn.name;
    if (!cacheKey) {
        throw new Error(`Couldn't figure out cache key from function.name`);
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
