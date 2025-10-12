#!/usr/bin/env node
const fs = require("fs");
const glob = require("glob");
const { scanTextForFindings } = require("../out/checker.js");

glob("**/*.{js,ts,jsx,tsx,html}", { ignore: "node_modules/**" }, (er, files) => {
  let risky = 0;
  files.forEach(f => {
    const txt = fs.readFileSync(f, "utf8");
    const results = scanTextForFindings(txt);
    if (results.length) {
      console.log(`\n${f}:`);
      results.forEach(r => console.log(`  - ${r.feature} (${r.status}) @${r.start}`));
      risky += results.length;
    }
  });
  process.exit(risky === 0 ? 0 : 1);
});
