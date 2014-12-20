# NeoGAF-Monkeybot

Some simple helpers for Greasemonkey/Tampermonkey that make using NeoGAFs ModBot-bot giveaways a bit more fun.

## How-to use

1. Download [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox) or [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) (Chrome)
2. Add a new script
3. Copy and paste the contents of main.js to the editor
4. Add your Steam profile name and a SteamAPI key. Optionally add your SteamID64-value.
5. Navigate to [NeoGAF](http://neogaf.com/forum)

## Version history
### 0.0.1
* First release
* Highlights games that are in your library

## FAQ
### Where to get a SteamAPI key?
All use of the Steam Web API requires the use of an API Key. You can acquire one by [filling out this form](http://steamcommunity.com/dev/apikey). Use of the APIs also requires that you agree to the [Steam API Terms of Use](http://steamcommunity.com/dev/apiterms).

### Where to get the SteamID64?
The script automatically obtains the 64-bit Steam key based on your profile name, but you can also retrieve it yourself. Just add `?xml=1` after your profilename, for instance http://steamcommunity.com/id/YOURPROFILENAMEHERE/?xml=1 and get the key inside of `<steamID64></steamID64`.

## Contributing
Contributions are very welcome! File an issue or send a PR!
