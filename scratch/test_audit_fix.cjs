const fetch = require('node-fetch');

// Test plain object .values vs Object.values
const obj = { a: 1, b: 2 };
console.log("obj.values is:", obj.values); // undefined!
console.log("Object.values(obj) is:", Object.values(obj)); // [1, 2]
