const cherish = require("../src/index");

let counter = 0;
function promiseRandomNumber() {
    counter += 1;
    console.log(`This is invocation number ${counter}`);

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(Math.random() * 5000);
        }, 1000);
    });
}

function printResult(res) {
    console.log(`Result: ${res}`);
}

const promiseRandomNumberCached = cherish(promiseRandomNumber, 1);

promiseRandomNumberCached().then(printResult);
promiseRandomNumberCached().then(printResult);
promiseRandomNumberCached().then(printResult);

setTimeout(() => {
    console.log("After two seconds...");
    promiseRandomNumberCached().then(printResult);
}, 2000);
