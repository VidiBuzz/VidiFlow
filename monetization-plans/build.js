const fs=require("fs");
const BASE="M:/code/vidismart/monetization-plans";
fs.mkdirSync(BASE+"/assets/css",{recursive:true});
fs.mkdirSync(BASE+"/assets/js",{recursive:true});
console.log("Dirs created");