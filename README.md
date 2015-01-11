# NeoGAF-MonkeyBot
Some simple helpers for Greasemonkey/Tampermonkey that make using NeoGAFs ModBot-bot giveaways a bit more fun.

![NeoGAF ModBot MonkeyBot](/images/banner.png?raw=true "NeoGAF ModBot MonkeyBot")

## Features
- "In library" highlighting for raffles
- Adds clickable links to games that you don't own yet

## How-to use
1. Download [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox) or [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) (Chrome)
2. Open [this link](https://github.com/petetnt/neogaf-monkeybot/raw/master/neogaf-monkeybot.user.js). *Monkey should prompt you for install.
3. `OPTIONAL` Edit the script and add your Steam profile name and a SteamAPI key. You can also add your SteamID64-value but it's also automatically retrieved, based on your Steam profile name.
4. Navigate to [NeoGAF](http://neogaf.com/forum) and start collecting games!
5. `FIRST TIME INSTALL`: If you didn't do the step 3., NeoGAF should now prompt you for your Steam profile name and the Steam API key

## FAQ
### Where to get a SteamAPI key?
All use of the Steam Web API requires the use of an API Key. You can acquire one by [filling out this form](http://steamcommunity.com/dev/apikey). Use of the APIs also requires that you agree to the [Steam API Terms of Use](http://steamcommunity.com/dev/apiterms).

### Where to get the SteamID64?
The script automatically obtains the 64-bit Steam key based on your profile name, but you can also retrieve it yourself. Just add `?xml=1` after your profilename, for instance http://steamcommunity.com/id/YOURPROFILENAMEHERE/?xml=1 and get the key inside of `<steamID64></steamID64>`.

### I already own the game but it still isn't highlighted as "In library"
The games list is updated once per day max and the parser might/will miss games that are spelled differently than the actual Steam name, sorry about that.

## Contributing
Contributions are very welcome! File an issue or send a PR!
