const axios = require("axios");
const fs = require("fs");
const util = require("util");
const writeFile = util.promisify(fs.writeFile); 

// Run "generate-twitch-token.js" for this info
const twitchAccess = JSON.parse(fs.readFileSync('twitch-token.json', "utf-8"))
const clientId = twitchAccess['client_id'];
const access_token = twitchAccess['access_token']

/* 
This code outputs three separate files:
"twitch-video-data.json" - This will be used in "create-csv.js"
"twitch-risky-users.json" - This will be used in "create-csv.js"
"twitch-user-ids.json" - This is created as a backup in case something goes wrong. If the code doesn't crash, you can delete this after it runs. If it does crash and you have this file, you can skip some of the processing
*/
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// This reads the file that "src-part.js" created. By default, this is "twitch-video-ids.json"
const videoIDs = JSON.parse(fs.readFileSync('twitch-video-ids.json', "utf-8"));

// This creates "chunks", since the Twitch API can handle up to 100 videos at once
const chunkSize = 99, chunks = [];
for (let i = 0; i < Math.ceil(videoIDs.length / chunkSize); i++) {
    chunks[i] = videoIDs.slice(i*chunkSize, (i+1)*chunkSize);
}

var allVideoData = []

// This is the function that requests the initial run videos from the Twitch API
async function getTwitchVideo(videoIdString) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(`https://api.twitch.tv/helix/videos?id=${videoIdString}`, {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${access_token}`
                }
            });

            // This saves the data to the array to deal with later
            allVideoData = allVideoData.concat(response.data.data)

            resolve()
        } catch (error) {
            console.error('Error fetching videos');
            reject(error)
        }
    })
}

// This is the function that requests every highlight from a user from the Twitch API
async function getTwitchUser(url, allData = []) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${access_token}`
                }
            });

            const data = response.data;
            allData.push(...data.data);

            // Pagination (Twitch does it with a cursor, which is cool)
            const cursor = data.pagination.cursor;

            if (cursor) {
                // The Twitch API allows for ~800 requests per minute. This allows for compliance
                await sleep(80);
                return getTwitchUser(`${url}&after=${cursor}`, allData);
            } else {
                return allData;
            }
        } catch (error) {
            console.error(error);
        }
}

async function everything(){
    // This iterates through each chunk
    for (i in chunks) {
        // This creates a long string so that there are as few Twitch API requests as possible
        var requestString = ""
        for (j=0; j < chunks[i].length; j++) {
            if (j==0){ requestString += `${chunks[i][j]}`}
            requestString += `&id=${chunks[i][j]}`
        }
        console.log(`Running chunk ${i}`)

        // Request from the Twitch API
        await getTwitchVideo(requestString)
    
        // The Twitch API allows for ~800 requests per minute. This allows for compliance
        await sleep(80);
    }
    
    // This part cuts down the data so the files are not as terrible to work with later
    var newVideoData = []
    var userIDs = []
    for(i=0; i<allVideoData.length; i++){
        const videoData = {
            "video-id": allVideoData[i]["id"],
            "user-id": allVideoData[i]["user_id"],
            "username": allVideoData[i]["user_name"],
            "video-link": allVideoData[i]["url"],
            "video-length": allVideoData[i]["duration"]
        }
        newVideoData.push(videoData)

        // This gets the user IDs and adds them to a separate array
        userIDs.push(allVideoData[i]["user_id"])
    }

    // This makes sure only one instance of each userID is in the array, so they don't get checked twice later
    userIDs = [...new Set(userIDs)]
    
    // This writes the cut-down dataset into a file which will be used later
    writeFile('twitch-video-data.json', JSON.stringify(newVideoData))
    // This saves the unique user IDs into a file, just in case something happens. This made more sense when my code was run function by function
    writeFile('twitch-user-ids.json', JSON.stringify(userIDs))

    // This is what gets every PUBLIC highlight for each user, and calculates the total time
    var riskyUsers = {}
    for(i=0; i<userIDs.length; i++){
        console.log(`Fetching all highlights for user ${userIDs[i]}`)
        var userHighlights = await getTwitchUser(`https://api.twitch.tv/helix/videos?user_id=${userIDs[i]}&type=highlight&first=100`)

        // This determines how many hours of highlights the user has, down to the second
        var totalTime = 0
        for(k=0;k<userHighlights.length;k++){
            var time = 0
            var timeArray = userHighlights[k]['duration'].split(/[hms]/).slice(0,-1)
            if(timeArray.length == 1){
                totalTime += parseInt(timeArray[0])
            }
            if(timeArray.length == 2){
                time += (parseInt(timeArray[0])*60)
                time += parseInt(timeArray[1])
                totalTime += time
            }
            if(timeArray.length == 3){
                time += parseInt(timeArray[0]*3600)
                time += (parseInt(timeArray[1])*60)
                time += parseInt(timeArray[2])
                totalTime += time
            }
        }
        if(totalTime > 360000){
            riskyUsers[userIDs[i]] = [true, totalTime]
        } else {
            riskyUsers[userIDs[i]] = [false, totalTime]
        }

        // This is just for saving every once in awhile. This made more sense when my code was run function by function
        if(i % 100 === 0){
            await writeFile('all-risky-users.json', JSON.stringify(riskyUsers));
        }
        await sleep(80);
    }

    // This saves the risky user file
    writeFile('twitch-risky-users.json', JSON.stringify(riskyUsers));
}

everything()