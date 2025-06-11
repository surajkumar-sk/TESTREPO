const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream');

const statsPath = path.join(__dirname, 'stats.json');

const entryIncludes = 'InterviewHub.js';
const targetSuffix = '/Utilities.js';

// 🔧 Normalize module names by removing " + N modules"
function cleanModuleName(name) {
  return name.replace(/\s*\+\s*\d+\s+modules$/, '');
}

// 1. have a list of Modules that are parsed so we can have parsed module as leaf node
// 2. {"moduleNmae": [which files imported the module]} - have a unique list.
// 3. recursion function - accepts end File for which the tree needs to be formed.
  // - return [] - if leaf node or duplicate module
  // - returns [[files], [files]] - if start file is in the list 
  // if return .length > 0 then add the curent arr[arr[]] into the local arr[arr[]] variable.
  // merge all arr[arr[]] that are genrated in arr[arr[]] and add the current modules as last entry in all arrays.


let parsedModules = [];
let modulesToReasons = {};
let moduleBracnhes = {};
let targetPath = "";
let startPath = "";


const moduleNames = [];

// Step 1: Stream and build maps
const stream = fs.createReadStream(statsPath)
  .pipe(JSONStream.parse('modules.*'));

stream.on('data', (module) => {
  if(module.name.includes("(ignored)")) return;
  let mName = cleanModuleName(module.name)
  modulesToReasons[mName] = [];

  if(mName.includes(entryIncludes)){
    startPath = mName;
  }

  if(mName.includes(targetSuffix)){
    targetPath = mName;
  }

  if(module.reasons.length > 0){
    module.reasons.forEach(m => {
      if(!m.moduleName){
        return;
      }
      let cleanMName = cleanModuleName(m.moduleName);
      if(!modulesToReasons[mName].includes(cleanMName)){
       modulesToReasons[mName].push(cleanMName);
      }
    });
  }
});

function getDependencyBranches(moduleName){
  if(parsedModules.includes(moduleName)){
    return [];
  } else {
    parsedModules.push(moduleName);
  }

  if(!modulesToReasons[moduleName]){
    return [];
  }
  if(modulesToReasons[moduleName].length == 0){
    moduleBracnhes[moduleName] = [];
    return [];
  }

  if(moduleName.includes(startPath)){
    console.log("Found a Branch");
    moduleBracnhes[moduleName] = [[moduleName]];
    return [[moduleName]];
  }

  let importedBySet = new Set(modulesToReasons[moduleName]);
  let importedBy = [...importedBySet];
  let dependencyyBranches = [];
  for(let i = 0; i < importedBy.length; i++){
    let r = getDependencyBranches(importedBy[i]);
    if(r.length > 0){
      r.forEach(res => {
        res.push(moduleName);
        dependencyyBranches.push(res);
      })
    }
  }
  moduleBracnhes[moduleName] = dependencyyBranches;
  return dependencyyBranches;
}

// Step 2: Traverse dependency graph
stream.on('end', () => {
  console.log("Stream Read Ended, Started parsing");
  console.log(`Finding all branches between ${startPath} and ${targetPath}`)
  console.log(getDependencyBranches(targetPath));
});
