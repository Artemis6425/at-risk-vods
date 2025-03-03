const fs = require("fs");
const fastCsv = require("fast-csv");

// You shouldn't need to change anything in this file unless you made changes to the previous part.

// This code outputs a file called "all-runs.csv" that will have all the data you're looking for!

const riskyUsers = JSON.parse(fs.readFileSync('twitch-risky-users.json', "utf-8"));
const videoData = JSON.parse(fs.readFileSync('twitch-video-data.json', "utf-8"));
const runData = JSON.parse(fs.readFileSync('run-data.json', "utf-8"));

// Create a CSV Write Stream
const outputFile = "all-runs.csv";
const csvStream = fastCsv.format({ headers: true });
const writeStream = fs.createWriteStream(outputFile);
csvStream.pipe(writeStream);

// Create a Map for quick lookup of existing VOD data by ID
const vodDataMap = new Map(videoData.map(vod => [vod["video-id"], vod]));

// Create a Regex pattern for all known VOD IDs
const vodIDPattern = new RegExp([...vodDataMap.keys()].join("|"));

// This formats time from just seconds to a more human readable format - 1h23m45s
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let formattedTime = "";
    if (hours > 0) formattedTime += `${hours}h`;
    if (minutes > 0) formattedTime += `${minutes}m`;
    if (secs > 0 || formattedTime === "") formattedTime += `${secs}s`;

    return formattedTime;
}

for(i=0; i<runData.length; i++){
    // Defines a ton of variables up front so the CSV can write valid data if nothing changes
    let foundVOD = null;
    let status = runData[i]["status"] || "DEAD";
    let time = "";
    let twitchUserID = ""
    let twitchUser = ""
    let vodLink = runData[i]["video-links"][0]["uri"] || ""
    let totalTime = ""

    // Use regex to check if video link contains any known VOD ID
    let match = false
    for(j=0; j<runData[i]["video-links"].length; j++){
        if(runData[i]["video-links"][j]["uri"].match(vodIDPattern)){
            match = runData[i]["video-links"][j]["uri"].match(vodIDPattern)
        }
    }

    if (match) {
        const matchedID = match[0];
        foundVOD = vodDataMap.get(matchedID);

        // Re-sets some variables if they were found
        twitchUser = foundVOD["username"]
        twitchUserID = foundVOD["user-id"];
        vodLink = foundVOD["video-link"]
        time = foundVOD["video-length"]

        // This updates the status based on the information retrieved in "twitch-part.js"
        if (riskyUsers[twitchUserID]) {
            status = riskyUsers[twitchUserID][0] ? "AT RISK" : "SAFE (highlight)";
            totalTime = formatTime(parseInt(riskyUsers[twitchUserID][1]));
        } else {
            status = "DEAD (highlight)";
        }
    }


    // Write to CSV
    csvStream.write({
        "VOD Status": status,
        "Twitch Username": twitchUser,
        "SRC Username": runData[i]["username"] || "",
        "Video Link": vodLink,
        "SRC Link": runData[i]["weblink"],
        "This VOD Runtime": time,
        "Total Highlight Runtime": totalTime,
        "Run Submission Date": runData[i]["run-date"],
        "SRC User ID": runData[i]["player-id"] || "",
        "Twitch User ID": twitchUserID
    });
}

csvStream.end();
    console.log(`Processing complete. CSV saved to ${outputFile}`);