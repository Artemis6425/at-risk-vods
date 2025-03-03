const fs = require("fs");
const util = require("util");
const writeFile = util.promisify(fs.writeFile); 

// You shouldn't need to change anything in this file unless you made changes to the previous part.

// This code outputs a file called "twitch-video-ids.json" that will be used in "twitch-part.js"

// This reads the file that "src-part.js" created. By default, this is "run-data.json"
var data = JSON.parse(fs.readFileSync('run-data.json', "utf-8"));

var twitchVideoIDs = []
newData = []

// This checks over each run in the file
for(i=0; i<data.length; i++){
    // This pre-assigns the status as dead if there was no video attached to the run
    if(data[i]["video-links"].length == 0){
        data[i]["status"] = "DEAD (no video attached)"
        newData.push(data[i])
        continue
    }

    var applicableLink = false
    var youtube = false
    // This checks every video linked to the run. If it has a twitch video, it is sent to an array to be dealt with later
    for(j=0; j<data[i]["video-links"].length; j++){
        if(
            data[i]["video-links"][j]["uri"].includes("/videos/") ||
            data[i]["video-links"][j]["uri"].includes("/video/") ||
            data[i]["video-links"][j]["uri"].includes("/v/") ||
            data[i]["video-links"][j]["uri"].includes("/c/")
        ){
            // This pushes each video ID to the array. yes its complicated but it works
            twitchVideoIDs.push(data[i]["video-links"][j]["uri"].split(/\/videos\/|\/video\/|\/v\/|\/c\//)[1].replace(/\D.*$/, ''))
            applicableLink = true
        } else if(data[i]["video-links"][j]["uri"].includes("youtu")) {
            youtube = true
        }
    }
    
    if(!applicableLink){
        // This effectively deletes any runs that only have a youtube link attached
        if(youtube){
            continue
        }
        data[i]["status"] = "UNKNOWN LINK TYPE"
    }
    newData.push(data[i])
}

writeFile("run-data.json", JSON.stringify(newData))
writeFile("twitch-video-ids.json",JSON.stringify(twitchVideoIDs))