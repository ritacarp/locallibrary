require("dotenv").config();

console.log("dotenv is loaded");

const port = process.env.PORT;
console.log("port = " + port);

const nodeEnv = process.env.NODE_ENV;
console.log("nodeEnv = " + nodeEnv);

const libraryConnectString = process.env.LIBRARY_DB_URI;
console.log("libraryConnectString = " + libraryConnectString);

console.log("\n\n");
let numbers = [4, 7, 3, 6];
console.log("numbers=" + numbers);
numbers.sort(function (a, b) {
  console.log("Start");
  console.log("a=" + a + "; b=" + b);

  console.log("a-b=" + (a - b));
  console.log("End");
  console.log("\n\n");
  return a - b;
});
console.log(numbers); // [6,4,2]


