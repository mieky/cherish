# cherish

[![npm version](https://badge.fury.io/js/cherish.svg)](http://badge.fury.io/js/cherish) [![Build Status](https://travis-ci.org/mieky/cherish.svg?branch=master)](https://travis-ci.org/mieky/cherish)

A minimal in-memory cache wrapper for all kinds of function calls. Tiny footprint, no runtime dependencies!

Useful for e.g. effortless caching of API calls with [node-fetch](https://github.com/bitinn/node-fetch).

Requires **Node 4.0** or newer, with npm 3.

## Installation

```
npm install --save cherish
```

Run tests with:

```
npm run test
```

## Getting started

`const myCachedFunction = cherish(myFunction, [options]);`

Simply wrap your function with `cherish(myFunction)`, and it will return you the same result for each subsequent function call with the same arguments.

By design, **you will always get back a Promise**. This is the same regardless of the type of your wrapped function.

### Options
You can specify the following options:

- `ttl`: how long to remember the results, in seconds (default: `300`)
- `get`: custom cache getter
- `set`: custom cache setter



## Usage examples

Remember results for specific arguments (same result with same arguments):

```js
const cherish = require("cherish");

function generateParticipantNumber(name) {
    return `${name} gets ${Math.round(Math.random() * 100)}`;
};

const rememberNumber = cherish(generateParticipantNumber);
const printResult = res => console.log(res);

rememberNumber("Alice").then(printResult); // "Alice gets 52"
rememberNumber("Bob").then(printResult);   // "Bob gets 74"
rememberNumber("Alice").then(printResult); // "Alice gets 52"
```

Remember the generated random number, but only for a second:
```js
const cherish = require("cherish");

function getRandomNumber() {
    return Math.round(Math.random() * 5000);
}

// Remember all calls to getRandomNumber() for one second
const promiseRandomNumber = cherish(getRandomNumber, { ttl: 1 });

// First calls will print the same result...
const printResult = res => console.log(res);
promiseRandomNumber().then(printResult);
promiseRandomNumber().then(printResult);
promiseRandomNumber().then(printResult);

// Try again after the cache has invalidated!
setTimeout(() => {
    console.log("Two seconds have passed!");
    promiseRandomNumber().then(printResult);
}, 2000);

// 264
// 264
// 264
// Two seconds have passed!
// 1296
```

You will get more output for debugging if you set the environment variable `DEBUG` to any non-falsy value.

## Changelog

- **0.4.0** Support argument-based caching.
- **0.3.0** Add backwards compatibility for Node 4.
- **0.2.0** Support anonymous functions, add basic tests.
- **0.1.1** Fix for properly handling unfinished calls.
- **0.1.0** First release.

## Acknowledgments

[![chilicorn](chilicorn.png)](http://futurice.com/blog/sponsoring-free-time-open-source-activities)

## License

[MIT](https://github.com/mieky/cherish/blob/master/LICENSE)
