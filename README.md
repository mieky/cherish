# cherish

[![npm version](https://badge.fury.io/js/cherish.svg)](http://badge.fury.io/js/cherish) [![Build Status](https://travis-ci.org/mieky/cherish.svg?branch=master)](https://travis-ci.org/mieky/cherish)


A minimal cache wrapper for all kinds of function calls.

Caches results in-memory, no runtime dependencies.

Particularly useful for e.g. effortless caching of API calls with [node-fetch](https://github.com/bitinn/node-fetch).

## Installation

```
npm install --save cherish
```

Requires **Node 4 or newer**.

## Usage

`const myCachedFunction = cherish(myFunction);`

Simply wrap your function with `cherish(myFunction, ttlSeconds)`, and it will return you the same result for each subsequent function call. You can specify how long the result is remembered by specifying a second argument (defaults to 5 minutes).

You will always get back a `Promise`, regardless of if your wrapped function returns a Promise or an atomic value.

## Examples

Remember the generated random number, but only for a second:
```js
const cherish = require("cherish");

// Remember all calls to getRandomNumber() for one second
const getRandomNumber = () => Math.round(Math.random() * 5000);
const promiseRandomNumber = cherish(getRandomNumber, 1);

// First calls will print the same result...
const printResult = res => console.log(res);
promiseRandomNumber().then(printResult);
promiseRandomNumber().then(printResult);
promiseRandomNumber().then(printResult);

// Try again after the cache has invalidated!
setTimeout(() => {
    console.log("After two seconds...");
    promiseRandomNumber().then(printResult);
}, 2000);
```

Would print something like:

```
264
264
264
After two seconds...
1296
```

You will get more output for debugging if you set the environment variable `DEBUG` to any non-falsy value.

## Changelog

- **0.3.0** Add backwards compatibility for Node 4.
- **0.2.0** Support anonymous functions, add basic tests.
- **0.1.1** Fix for properly handling unfinished calls.
- **0.1.0** First release.

## Acknowledgments

[![chilicorn](chilicorn.png)](http://futurice.com/blog/sponsoring-free-time-open-source-activities)

## License

[MIT](https://github.com/mieky/cherish/blob/master/LICENSE)
