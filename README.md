# cherish

[![npm version](https://badge.fury.io/js/cherish.svg)](http://badge.fury.io/js/cherish) [![Build Status](https://travis-ci.org/mieky/cherish.svg?branch=master)](https://travis-ci.org/mieky/cherish)


A minimal cache wrapper for all kinds of function calls.

Caches results in-memory, no external dependencies.

Particularly useful for e.g. effortless caching of API calls with [node-fetch](https://github.com/bitinn/node-fetch).

## Install

```
npm install --save cherish
```

Requires Node 6+ for ES6 compatibility.

## Usage

Simply wrap your function with `cherish(function, ttlSeconds)`, and it will return you the same result for each subsequent function call for the time limit you specify (defaults to 5 minutes).

It supports functions that return either a Promise or a plain Javascript value.

## Examples

```js
const cherish = require("cherish");

const getRandomNumber = () => Math.round(Math.random() * 5000);
const printResult = res => console.log(res);

// Remember all calls to getRandomNumber() for one second
const promiseRandomNumber = cherish(getRandomNumber, 1);

promiseRandomNumber().then(printResult);
promiseRandomNumber().then(printResult);
promiseRandomNumber().then(printResult);

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

- **0.2.0** Support anonymous functions, add basic tests.
- **0.1.1** Fix for properly handling unfinished calls.
- **0.1.0** First release.

## Acknowledgments

[![chilicorn](chilicorn.png)](http://futurice.com/blog/sponsoring-free-time-open-source-activities)

## License

[MIT](https://github.com/mieky/cherish/blob/master/LICENSE)
