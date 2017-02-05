const cherish = require("../src/index");

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
