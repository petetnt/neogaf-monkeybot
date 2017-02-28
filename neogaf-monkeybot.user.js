// ==UserScript==
// @name         NeoGAF MonkeyBot
// @namespace    http://github.com/petetnt/neogaf-monkeybot
// @version      1.0.0
// @description  Helper functions for NeoGAF's ModBot posts
// @author       PeteTNT
// @match        http://*.neogaf.com/forum/showthread.php?*
// @match        http://*.neogaf.com/forum/showpost.php?*
// @match        http://*.neogaf.com/forum/private.php?do=newpm&u=253996
// @require      http://code.jquery.com/jquery-latest.js
// @connect      api.steampowered.com
// @connect      steamcommunity.com
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

/* global $ GM_info GM_xmlhttpRequest*/
var ownedGames = JSON.parse(localStorage.getItem("monkeyBot_steamGameList")) || [];
var lastUpdate = localStorage.getItem("monkeyBot_steamGameListUpdatedOn") || "";
var modBotUrl = "http://www.neogaf.com/forum/private.php?do=newpm&u=253996";
var modBotPosts = $("[data-username='ModBot']");
var modBotSelfPosts = $("a[href='member.php?u=253996']").closest(".postbit").find(".post");
var allPosts = modBotPosts.add(modBotSelfPosts);
var storeUrl = "http://store.steampowered.com/search/?term=";
var storePageUrl = "http://store.steampowered.com/app/";
var allGames = JSON.parse(localStorage.getItem("monkeyBot_steamGameWholeList")) || [];
var lastWholeGameListUpdate = localStorage.getItem("monkeyBot_steamGameWholeListUpdatedOn") || "";

/**
 * Sanitizes names of the games
 * @param   {string} name Name of the game
 * @returns {string} sanitized name
 */
function sanitizeName(name) {
    return name.toLowerCase().replace(/\W+/gi, "");
}

/**
 * Checks if user owns the game on steam
 * @param   {string}  name Name of the game
 * @param   {line}    line Modbot line of the game
 * @returns {boolean} true if owned, false if not
 */
function checkIfOwnedOnSteam(name, line) {
    return ownedGames.indexOf(sanitizeName(name)) !== -1
        && !/uPlay|\(GoG\)|\(Origin\)|Desura/.test(line);
}

/**
 * Gets a map { appid, sanitizedName } if the game exists on the Steam store
 * @param   {string}  name Name of the game
 * @param   {line}    line Modbot line of the game
 * @returns {map} 	  a map { appid, sanitizedName } if the game exists on the Steam store, false if not
 */
function getIfOnSteam(name, line) {
    if (!/uPlay|\(GoG\)|\(Origin\)|Desura/.test(line)) {
      return false;
    }

    return allGames.find(game => {
      return game.sanitizedName === name;
    })
}

/**

/**
 * Navigate to the PM page for the game you clicked
 * @param {Event} event - Click event
 */
function clickHandler(event) {
    var elem = $(this);
    event.preventDefault();
    localStorage.setItem("monkeyBot_raffleLine", elem.data("modbotline"));
    window.location.href = modBotUrl;
}

/**
 * Matches games from the modpot posts and replaces the markup on the page
 */
function matchGames() {
    allPosts.each(function matcher(idx, elem) {
        var $elem = $(elem);
        var text = $elem.text();
        var giveaways = text.match(/^ *(.*\b(?:MB-)\b.*)/gmi);

        Object.keys(giveaways || {}).forEach(function mapGiveaways(key) {
            var line = giveaways[key];
            var name = line.split("--")[0].trim();
            var modbotcode = line.split("--")[1].trim();

	
		var urlToShow = storeUrl + name;
			
		var saneName = sanitizeName(name);
		var game = getIfOnSteam(saneName, line);
		if(game) {
			/** inside this block we can access the appid of the game with game.appid **/
			urlToShow = storePageUrl + game.appid;
		}
					
		
            if (checkIfOwnedOnSteam(name, line)) {
                $elem.html(
                    $elem.html().replace(
                        name,
                        "<span class='inLibraryFlag'>IN LIBRARY &nbsp;&nbsp</span>" +
                        "<span class='inLibraryText'>" +
				"<a class='visitSteamStorePageOwnedGame' " +
                            	"title='Click me to visit the Steam store page of your game' " +
                            	"href='" + urlToShow + "/'>" + name + "</a>" +    
			+ "</span>"
                    ));
            } else {
                if (!/Taken by/.test(line)) {
                    $elem.html(
                        $elem.html().replace(
                            name,
				"<a class='visitSteamStorePage' " +
				"title='Click me to visit the Steam store' " +
				"href='" + urlToShow + "'>" + name + "</a>"
                            ));				
                    $elem.html(
                        $elem.html().replace(
                            modbotcode,
				"<a class='sendModbotMessage' data-modbotline='" + line + "' " +
				"title='Click me to message ModBot' " +
				"href='" + modBotUrl + "'>" + modbotcode + "</a>"
                        ));
                }
            }
        });

        $(elem).replaceWith($elem);

        $("[data-modbotline]").on("click", clickHandler);
    });
}

/**
 * Parses owned games from json response
 * @param {object} json - Json response
 */
function parseOwnedGames(json) {

    ownedGames = json.map(function map(game) {
        return sanitizeName(game.name);
    });

    localStorage.setItem("monkeyBot_steamGameList", JSON.stringify(ownedGames));
    localStorage.setItem("monkeyBot_steamGameListUpdatedOn", new Date().toDateString());
    localStorage.setItem("monkeyBot_version", GM_info.script.version); // jshint ignore:line
    matchGames();
}

/*
 * Parses the whole list of Steam games from json response
 * @param {object} json - Json response
 */
function parseAllGames(json) {
    
    allGames = json.map(function map(game) {
        return {
           appid: game.appid,
           sanitizedName: sanitizeName(game.name),
       }
    });

    localStorage.setItem("monkeyBot_steamGameWholeList", JSON.stringify(allGames));
    localStorage.setItem("monkeyBot_steamGameWholeListUpdatedOn", new Date().toDateString());
    localStorage.setItem("monkeyBot_version", GM_info.script.version); // jshint ignore:line
}

/**

/**
 * Gets the Steam profile name
 * @throws {Error} - Error if prompting fails
 * @returns {String} - Steam Profile Name
 */
function getProfileName() {
    var steamProfileName = localStorage.getItem("monkeyBot_steamProfileName");

    if (!steamProfileName) {
        steamProfileName = window.prompt("MonkeyBot says: Enter your Steam profile name");

        if (!steamProfileName || steamProfileName === "") {
            throw new Error("Steam profile name cannot be empty or null");
        }

        localStorage.setItem("monkeyBot_steamProfileName", steamProfileName);
    }

    return steamProfileName;
}

/**
 * Retrieves steam ID
 */
function getSteamID(callback) {
    var steamProfileName = getProfileName();
    var steamID = localStorage.getItem("monkeyBot_steamID64");
    var url = "http://steamcommunity.com/id/" + steamProfileName + "/?xml=1";

    if (steamID) {
        return callback(steamID);
    }

    return GM_xmlhttpRequest({ // eslint-disable-line new-cap
        method: "GET",
        url: url,
        onload: function onLoad(response) {
            var xmlDoc = $.parseXML(response.responseText);
            var $xml = $(xmlDoc);

            steamID = $xml.find("steamID64").text();
            localStorage.setItem("monkeyBot_steamID64", steamID);
            return callback(steamID);
        },
        onerror: function onError(err) {
            console.error("MonkeyBot - Retrieving SteamID failed." +
                            "Make sure you have correcly entered your Steam profile name");
            console.log(err);
        }
    });
}

/**
 * Gets the API key from localStorage or from user
 */
function getApiKey() {
    var apiKey = localStorage.getItem("monkeyBot_steamApiKey");

    if (!apiKey) {
        apiKey = window.prompt("MonkeyBot says: Enter your Steam API key");

        if (!apiKey) {
            throw new Error("MonkeyBot - Failed to set Steam API key. Please try again");
        }

        localStorage.setItem("monkeyBot_steamApiKey", apiKey);
    }

    return apiKey;
}

/**
 * Handles the loading of Steam games
 * @param {string} - SteamID64
 */
function loadOwnedGames(steamID) {
    var apiKey = getApiKey();
    var service = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?";
    var params = "key=" + apiKey + "&include_appinfo=1&steamid=" + steamID + "&format=json";
    var url = service + params;

    GM_xmlhttpRequest({ // eslint-disable-line new-cap
        method: "GET",
        url: url,
        onload: function onLoad(response) {
            parseOwnedGames(JSON.parse(response.responseText).response.games);
        },
        onerror: function onError() {
            console.error("MonkeyBot - Retrieving Steam Game List failed. Try again later");
        }
    });
}

 /**
 * Handles the loading of the whole list of Steam games
 */
function loadAllGames() {
    var url = "http://api.steampowered.com/ISteamApps/GetAppList/v0001/";

    GM_xmlhttpRequest({ // eslint-disable-line new-cap
        method: "GET",
        url: url,
        onload: function onLoad(response) {
            parseAllGames(JSON.parse(response.responseText).applist.apps.app);
        },
        onerror: function onError() {
            console.error("MonkeyBot - Retrieving Whole Steam Game List failed. Try again later");
        }
    });
}

/**

/**
 * Initializes MonkeyBot
 * @throws {Error} - Error if SteamID doesn't exist
 */
function init() {
    var href = window.location.href;
    var raffleLine = localStorage.getItem("monkeyBot_raffleLine");

    getSteamID(function performActions(steamID) {
        if (!steamID) {
            throw new Error("There's no SteamID, aborting...");
        }

        if (window.top === window.self) {
            if (/showpost|showthread/.test(href) && modBotPosts.length) {
		    
		if (!allGames.length ||
                    new Date().toDateString() !== lastWholeGameListUpdate ||
                    localStorage.getItem("monkeyBot_version") !== GM_info.script.version) {
                    loadAllGames();
                }			    
		    
                if (!ownedGames.length ||
                    new Date().toDateString() !== lastUpdate ||
                    localStorage.getItem("monkeyBot_version") !== GM_info.script.version) {
                    loadOwnedGames(steamID);
                } else {
                    matchGames();
                }
		    
            } else if (/private/.test(href)) {
                if (raffleLine) {
                    $("textarea[name='message']").val(raffleLine);
                    localStorage.removeItem("monkeyBot_raffleLine");
                }
            }
        }
    });
}

init();

/**
 * Sets up the style sheet
 */
(function () { // eslint-disable-line
    var head;
    var style;

    head = document.getElementsByTagName("head")[0];
    style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = ".inLibraryFlag {background: url(' data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAKCAYAAABi8KSDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OUNDNzBFNTUyMUM0MTFFNDk1REVFODRBNUU5RjA2MUYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OUNDNzBFNTYyMUM0MTFFNDk1REVFODRBNUU5RjA2MUYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5Q0M3MEU1MzIxQzQxMUU0OTVERUU4NEE1RTlGMDYxRiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5Q0M3MEU1NDIxQzQxMUU0OTVERUU4NEE1RTlGMDYxRiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv3vUKAAAAAlSURBVHjaYvz//z8DsYARpFhISAivjnfv3jGSp3jUGeQ4AyDAADZHNe2nyOBrAAAAAElFTkSuQmCC') no-repeat 4px 4px #4F95BD; left: 0; top: 42px; font-size: 10px; color: #111111; height: 18px; line-height: 19px; padding: 0 0 0 18px; white-space: nowrap; z-index: 5; display: inline-block; width: 60px; margin-right: 5px;} .inLibraryText { opacity: 0.7; }"; // eslint-disable-line
    head.appendChild(style);
}());
