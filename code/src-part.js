const axios = require("axios");
const fs = require("fs");
const util = require("util");
const writeFile = util.promisify(fs.writeFile); 

const src_game_code = "" // This is the code in the SRC URL for the game. Example: https://www.speedrun.com/celeste - the code is "celeste"

// This code outputs a file called "run-data.json" that will be used in the following parts

// promise-ified sleep / setTimeout
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// This function deals with the pagination of the SRC API and whatever
var countedResponse = 0
async function fetchData(url, allData = []) {
    try {
        const response = await axios.get(url);
        const data = response.data
        allData.push(...data.data);

        // Check if there is a "next" link in pagination
        const nextLink = data.pagination.links.find(link => link.rel === "next");

        if (nextLink) {
            countedResponse += 200

            // This is for games that are really big, and makes sure you aren't wasting your time
            if(countedResponse >= 10000){
                console.log(`Game "${src_game_code}" went over the 10k run limit, please make sure you know what you're doing!`)
                return allData
            }

            // SRC has a 100 requests-per-minute limit. This ensures compliance
            await sleep(600);
            console.log(`Getting runs ${countedResponse+1}-${countedResponse+200}`)
            return fetchData(nextLink.uri, allData);
        } else {
            return allData;
        }
    } catch (error) {
        console.log("something fucked up")
    }
}

// This is the function that actually goes through every step of the SRC process
async function SRC(){
    // This part gets the internal game code
    var response = await axios.get(`https://www.speedrun.com/api/v1/games/${src_game_code}`)
    var src_internal_code = response.data.data.id
    if(src_internal_code == null){
        console.log(`ERROR: Could not find the game with code "${src_game_code}"`)
        return
    }

    // Putting this delay here so that there's no chance of going over the 100 request per minute SRC limit
    sleep(600)

    // This is the part that actually gets the runs. Change that API request URL at your own risk, please know what you are doing!
    console.log(`Getting runs 1-200`)
    var allRuns = await fetchData(`https://www.speedrun.com/api/v1/runs?game=${src_internal_code}&status=verified&max=200&orderby=submitted`)

    // This part cuts down the data so the files are not as terrible to work with later
    var newRuns = []
    for(i=0; i<allRuns.length; i++){
        const runData = {
            "player-id": allRuns[i]["players"][0]["id"] || "",
            "username": allRuns[i]["players"][0]["name"] || "",
            "run-date": allRuns[i]["date"],
            "video-links": allRuns[i]["videos"]["links"] || [],
            "weblink": allRuns[i]["weblink"]
        }
        newRuns.push(runData)
    }

    // Saving the data to a file
    writeFile('run-data.json',JSON.stringify(newRuns))
}

SRC()