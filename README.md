# AT RISK SPEEDRUN.COM VIDEOS

Hi, so this is an organized list of every single highlight used for a VERIFIED run on speedrun.com that is at risk of deletion, given the new Twitch announcement.

Announcement tweet: https://twitter.com/TwitchSupport/status/1892277199497043994 **THE DEADLINE IS 4/19/25**

How to check your Highlight hour usage: https://dashboard.twitch.tv/u/YOUR_USERNAME_HERE/content/video-producer

**The FIRST spreadsheet to check the data:** https://docs.google.com/spreadsheets/d/1og5_jv0nNyuG93rroNHvqy3STfk8uWsXLZJHsG-TpjY/

**The SECOND spreadsheet to check the data:** https://docs.google.com/spreadsheets/d/1iHdrv42kfHeMPNlINPZnfK05hh7zSzywkY6nV2tbTjA/

All of this data was gathered between **2/19/25 and 2/28/25**.

### WHY IS THERE **TWO** SPREADSHEETS?

Google Sheets limited me. For the best (still laggy) experience, I recommend making a copy, and filtering it from there.

No, I can't tell you what game is on what sheet. I made sure to split it cleanly though, so you aren't going back and forth.

### WHAT DATA IS **NOT** ON THE SPREADSHEETS?

- Runs with a Youtube link as the primary video attached
- Runs with no video links whatsoever

### WHY DIDN'T YOU GET ...

Either because I couldn't, or it didn't cross my mind until too late.

### CAN I JUST GET THE RAW CSV DATA?

Sure, it's added to this repository. 

### WHAT CAN I DO TO HELP

Check for your name on the lists. If you are on the lists (or recieved an email from Twitch regarding this policy change), start backing up your videos and reupload them to Youtube.

If you are NOT on the lists, but you know somebody that is, reach out to them and let them know.

If you are NOT on the lists and you still want to help, probably coordinate with your leaderboard moderation team (or at least your community) to start backing up videos yourself and upload them to a "shell" account. Keep in mind that whoever uploaded the video can always delete it or go inactive, so it's not the worst idea to have multiple backups.

I personally like this tool, but you can use what you want. It allows for **bulk downloading** and **queueing downloads** - https://github.com/lay295/TwitchDownloader

## OTHER FAQ TYPE STUFF

### HOW MANY RUNS LINK TO TWITCH IN ANY WAY?

**727,727**

### HOW DID YOU DO THIS

1. Use the Speedrun.com API to get every VERIFIED run from every game on the website*.
2. Cut down the data by only getting runs that link to highlights on Twitch. (Clips are safe, and past broadcasts would already be dead. A good ~7500 also put broken links, either to their VOD manager page (if it had an ID, I manually checked to see if it existed and put it on the list) or just to their main Twitch channel (lol))
3. Use the Twitch API to check all those highlights, and if valid, get the user ID of the channel.
4. Use the Twitch API to check every user ID gathered to see how many hours worth of highlights that user had.
5. For each user over 100 hours, put them on a list.
6. Work backwards with the data to create the spreadsheet linked above

*So the Speedrun.com API has issues with pagination, specifically over trying to return any values past the 10k mark. For the few games that had this issue, I did the below:

1. Get every category for each of those games
2. Get all the runs for each category individually
3. If still issues (there was for some), do another call to get 10k runs but sorted by newest (default sorting was by oldest)
4. Combine both the "sorted by oldest" and "sorted by newest" datasets and remove duplicates.

There were THREE game categories that still went over this 20k combined count. Those are:
* Subway Surfers - No Coins https://www.speedrun.com/subsurf (I believe most of these are Youtube videos anyway, due to the off-Twitch attention)
* Minecraft Speed Builders - "Time" https://www.speedrun.com/mcm_speed_builders (Every level has a "Time" category)
* Seterra (Old Version) - "Pin" https://www.speedrun.com/seterraold (Every map has a "Pin" cateogry)

### WHY DID YOU DO THIS

Speedrunning history is important.

### IS EVERYTHING ACTUALLY WORTH SAVING?

kinda, yeah. Not everyone cares about every game (for example, a Super Mario 64 runner may not care about Wii Play) but that doesn't mean that nobody cares. Losing information about past runs makes future runners unable to learn from other people's progress.

### WHO ARE YOU AND WHY DO *YOU* CARE

I'm Artemis, and I've been speedrunning since 2012 (probably earlier). I've been around some communities for most of that time, and I've watched information vanish over years. I'd like that to not happen. 

If you'd like to support me (yes I am selling out, I was told to), you can donate to my [**Ko-fi**](https://ko-fi.com/artemis64) or follow me on [**Twitch**](https://twitch.tv/artemis64), [**Twitter**](https://twitter.com/artemis6425) or [**Bluesky**](https://bsky.app/profile/artemis.sm64.live). You can also message me on Discord, my username is **Artemis6425**

### ARE YOU GOING TO RELEASE THE CODE YOU USED TO DO THIS?

Right this moment, no. I kinda rushed everything and did some miserable coding practices to get this done. Once I fix those, maybe?? Hoping this never has to be done again, so I don't see the benefit.