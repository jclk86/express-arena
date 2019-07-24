const express = require("express");
const morgan = require("morgan");
const app = express();

// This is middleware that requests pass through
// on their way to the final handler
app.use(morgan("dev")); // dev is a selection from morgan to format the log output. combinea, common, short, tiny are some of the others. Can also customize.

//This is the final request handler
app.get("/", (req, res) => {
  console.log("The root path was called");
  res.send("Hello Express!");
});

app.get("/burgers", (req, res) => {
  res.send("We have juicy burgers");
});

app.get("/pizza/pineapple", (req, res) => {
  res.send("We don't server that! Never call here again!");
});

// see morgan doc for req. req is an object that can access various parts of the request from the client
app.get("/echo", (req, res) => {
  const responseText = `Here are some details of your request:
  Base URL: ${req.baseUrl}
  Host: ${req.hostname}
  Path: ${req.path}
  IP: ${req.ip}
  Method: ${req.method}
  Protocol: ${req.protocol}
  `;
  res.send(responseText);
});

// looks to be very important for reading the specificites of requests from users
app.get("/queryViewer", (req, res) => {
  console.log(req.query);
  res.end(); //do not send any data back to the client
});

// more advance version of above. Now doing something with the query values.
app.get("/greetings", (req, res) => {
  //1. get values from the request
  const name = req.query.name;
  const race = req.query.race;

  //2. validate the values
  if (!name) {
    //3. name was not provided
    return res.status(400).send("Please provide a name");
  }

  if (!race) {
    //3. race was not provided
    return res.status(400).send("Please provide a race");
  }

  //4. and 5. both name and race are valid so do the processing.
  const greeting = `Greetings ${name} the ${race}, welcome to our kingdom.`;

  //6. send the response
  res.send(greeting);
});

app.get("/sum", (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);

  if (!a) {
    return res.status(400).send("Please provide first number");
  }

  if (!b) {
    return res.status(400).send("Please provide second number");
  }
  const c = a + b;
  const sum = `The sum of ${a} and ${b} is ${c}`;

  res.send(sum);
});

app.get("/cipher", (req, res) => {
  const text = req.query.text;
  const shift = req.query.shift;

  if (!text) {
    return res.status(400).send("Please enter text");
  }

  if (!shift) {
    return res.status(400).send("shift is required");
  }

  const numShift = parseInt(shift);

  if (Number.isNaN(numShift)) {
    return res.status(400).send("shift must be a number");
  }

  // lowest of the charCode in terms of alphabet. lowercase a is 97
  const base = "A".charCodeAt(0);

  // each character has a charcode. The uppercase and lowercase versions of a character do not share the same charcode
  const cipher = text
    .toUpperCase()
    .split("")
    .map(char => {
      const code = char.charCodeAt(0);
      // if it is not one of the 26th letters of the uppercase variety. Adding 26 clears uppercase Z.
      if (code < base || code > base + 26) {
        return char;
      }
      // [a, b, c d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, x, y, z].toUpperCase()
      // letter & shift
      // ex: if "H", 72(H) - 65(A) = 7 + 4(shift), which makes H = L

      let diff = code - base; // ex: 68(D) - 65(A)
      diff = diff + numShift; // 3 = 3 + 6 (shift) === 9
      diff = diff % 26; // how does modulus work? 3 % 6 = 3. If second number is larger, then first number remains.
      // 20 % 9 is 18 + 2. so 2 is the remainder. 9 goes twice into 20. So if the DIFF is larger than 26, it'll start from the beginning again
      // if not, it's just itself. This is to ensure that a shift number that goes passed 26, can restart again
      //
      // convert back to string base is always 65, so now the new diff has been shifted the 6 times (or whatever amount you set it to)
      const shiftedChar = String.fromCharCode(base + diff);
      return shiftedChar;
    })
    .join(""); // constructs string from array

  res.status(200).send(cipher);
});

app.get("/lotto", (req, res) => {
  const { numbers } = req.query;

  if (!numbers) {
    return res.status(200).send("numbers is required");
  }
  if (!Array.isArray(numbers)) {
    return res.status(200).send("Numbers must be an array");
  }
  let guesses = numbers
    .map(n => parseInt(n))
    .filter(n => !Number.isNaN(n) && (n >= 1 && n <= 20));

  if (guesses.length != 6) {
    return res
      .status(400)
      .send("numbers must contain 6 integers between 1 and 20");
  }

  function randomDataSet(dataSetSize, minValue, maxValue) {
    return new Array(dataSetSize).fill(0).map(function(n) {
      return Math.ceil(Math.random() * (maxValue - minValue) + minValue);
    });
  }
  let winningNums = randomDataSet(6, 1, 20);
  let diff = winningNums.filter(n => !guesses.includes(n));

  switch (diff.length) {
    case 0:
      responseText = "Wow! Unbelievable! You could have won the mega millions!";
      break;
    case 1:
      responseText = "Congratulations! You win $100!";
      break;
    case 2:
      responseText = "Congratulations, you win a free ticket!";
      break;
    default:
      responseText = "Sorry, you lose";
  }
  res.send(responseText);
});

app.listen(8000, () => {
  console.log("Express server is listening on port 8000!");
});
