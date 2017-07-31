# cherish

[![npm version](https://badge.fury.io/js/cherish.svg)](http://badge.fury.io/js/cherish) [![Build Status](https://travis-ci.org/mieky/cherish.svg?branch=master)](https://travis-ci.org/mieky/cherish)

A simple, easy cache wrapper for all kinds of function calls. Tiny footprint, no runtime dependencies!

Effortless to use in all kinds of scenarios. Defaults to an in-memory database, but is easily set up to use e.g. with [node-localstorage](https://github.com/lmaccherone/node-localstorage) to persist results to disk.

The perfect companion for caching API calls made with [node-fetch](https://github.com/bitinn/node-fetch)!

## Installation

Requires **Node 4.0** or newer, with npm 3.

```
npm install --save cherish
```

Run tests with:

```
npm run test
```

## Getting started

Simply wrap your function with `cherish(myFunction)`, and it will return you the same result for each subsequent function call with the same arguments:

```js
const cherish = require("cherish");
const myCachedFunction = cherish(myFunction);
```

By design, **you will always get back a Promise**. This is the same regardless of the type of your wrapped function.

### Options

You can specify the following options:

- `ttl`: how long to remember the results, in seconds (default: `300`)
- `get`: custom cache getter (requires both get and set to work)
- `set`: custom cache setter (requires both get and set to work)

For more information, see [usage examples](#usage-examples) below.

You will get more output for debugging if you set the environment variable `DEBUG` to any non-falsy value.

## Usage examples

### Remember results for specific arguments (same result with same arguments):

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

### Remember the generated random number, but only for a second:

```js
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

### Specify a custom cache implementation

Here's the straightforward way of using node-localstorage to persist query results to disk:

```js
const localStorage = require("node-localstorage").LocalStorage("./cache");

const fetchTrelloURLCached = cherish(fetchTrelloURL, {
    ttl: 3600,
    get: key => JSON.parse(localStorage.getItem(key)),
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value))
});
```


## Changelog

- **1.0.0** Support customizable storage.
    - CHANGED: initialization syntax, the second argument `ttlSeconds` should be now passed in the options, for example: `cherish(myFunction, { ttl: 60 })`
    - It's now possible to define a custom cache instead of the default in-memory cache by specifying the `get` and `set` options upon [initialization](#options).

- **0.4.0** Support argument-based caching.
- **0.3.0** Add backwards compatibility for Node 4.
- **0.2.0** Support anonymous functions, add basic tests.
- **0.1.1** Fix for properly handling unfinished calls.
- **0.1.0** First release.

## Acknowledgments

[![chilicorn](chilicorn.png)](http://futurice.com/blog/sponsoring-free-time-open-source-activities)

## License

[MIT](https://github.com/mieky/cherish/blob/master/LICENSE)
