const fs = require("fs");

const rules = JSON.parse(fs.readFileSync("./rules.json", "utf8"));
const seen = new Map();

for (const rule of rules) {
  if (seen.has(rule.pattern)) {
    console.log("Duplicate:", rule.pattern, "in", [seen.get(rule.pattern), rule.id]);
  } else {
    seen.set(rule.pattern, rule.id);
  }
}
