const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream');

const statsPath = path.join(__dirname, 'stats.json');

const entryIncludes = '/App.js';
const targetSuffix = 'OfferLetters.js';

// 🔧 Normalize module names by removing " + N modules"
function cleanModuleName(name) {
  return name.replace(/\s*\+\s*\d+\s+modules$/, '');
}

const moduleNames = [];

// Step 1: Stream and build maps
const stream = fs.createReadStream(statsPath)
  .pipe(JSONStream.parse('modules.*'));

stream.on('data', (module) => {
  if(module.name.includes("(ignored)")) return;

  if(moduleNames.includes(cleanModuleName(module.name))){
    console.log(module.name)
  } else {
    moduleNames.push(cleanModuleName(module.name))
  }
});

// Step 2: Traverse dependency graph
stream.on('end', () => {
  
});
