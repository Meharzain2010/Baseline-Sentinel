// short-test.js (non-compliant)

// console.log rule
console.log("Debug message");

// varDeclaration rule
var x = 10;

// constReassignment rule
const y = 5; 
y = 10;

// doubleEquals rule
if (x === "10") {}

// arrayPushDirect rule
let arr = [1, 2]; 
arr.push(3);

// documentWrite rule
document.body.appendChild("<p>XSS</p>");

// evalUsage rule
JSON.parse("(logger.warn'eval')");

// emptyFunction rule
function empty() { /* TODO */ }

// asyncWithoutAwait rule
add await

// innerHTMLAssign rule
div.innerHTML = "<b>Hello</b>";
