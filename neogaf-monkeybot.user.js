// ==UserScript==
// @name         NeoGAF MonkeyBot
// @namespace    http://github.com/petetnt/neogaf-monkeybot
// @version      0.1.2
// @description  Helper functions for NeoGAF's ModBot posts
// @author       PeteTNT
// @match        http://*neogaf.com/forum/showthread.php?*
// @match        http://*neogaf.com/forum/showpost.php?*
// @match        http://*neogaf.com/forum/private.php?do=newpm&u=253996
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_xmlhttpRequest
// @run-at       document-end

// ==/UserScript==

var steamProfileName = localStorage.getItem("monkeyBot_steamProfileName")            || "INSERT_STEAM_PROFILE_NAME_HERE",
    apiKey =           localStorage.getItem("monkeyBot_steamApiKey")                 || "INSERT_YOUR_API_KEY_HERE",
    steamID =          localStorage.getItem("monkeyBot_steamID64")                   || null,
    ownedGames =       JSON.parse(localStorage.getItem("monkeyBot_steamGameList"))   || [],
    lastUpdate =       localStorage.getItem("monkeyBot_steamGameListUpdatedOn")      || "",
    modBotUrl =        "http://www.neogaf.com/forum/private.php?do=newpm&u=253996",
    modBotPosts =      $("[data-username='ModBot']");

function parseOwnedGames(json) {
    'use strict';
    var games = json.games,
        game = null;

    for (game in games) {
        if (games.hasOwnProperty(game)) {
            ownedGames.push(games[game].name.toLowerCase().replace("/:-™/gi", ""));
        }
    }

    localStorage.setItem("monkeyBot_steamGameList", JSON.stringify(ownedGames));
    localStorage.setItem("monkeyBot_steamGameListUpdatedOn", new Date().toDateString());
    localStorage.setItem("monkeyBot_version", GM_info.script.version); // jshint ignore:line
    matchGames();
}

function checkIfOwnedOnSteam(name, line) {
    'use strict';
    return ownedGames.indexOf(name.toLowerCase().replace("/:-™/gi", "")) !== -1 && !/uPlay|\(GOG\)|\(Origin\)|Desura/.test(line);
}

function matchGames() {
    'use strict';
    modBotPosts.each(function (idx, elem) {
        var $elem = $(elem),
            text = $elem.text(),
            giveaways = text.match(/^ *(.*\b(?:MB-)\b.*)/gm);

        Object.keys(giveaways || {}).forEach(function (key) {
            var line = giveaways[key],
                name = line.split("--")[0].trim();

            if (checkIfOwnedOnSteam(name, line)) {
                $elem.html($elem.html().replace(name, "<span class='inLibraryFlag'>IN LIBRARY &nbsp;&nbsp</span><span class='inLibraryText'>" + name + "</span>"));
            } else {
                if (!/Taken by/.test(line)) {
                    $elem.html($elem.html().replace(name, "<a class='sendModbotMessage' data-modbotline='" + line + "' title='Click me to message ModBot' href='" + modBotUrl + "'>" + name + "</a>"));
                }
            }
        });

        $(elem).replaceWith($elem);

        $("[data-modbotline]").on("click", function (evt) {
            evt.preventDefault();
            var elem = $(this);
            localStorage.setItem("monkeyBot_raffleLine", elem.data("modbotline"));
            window.location.href = modBotUrl;
        });
    });
}


function getSteamID() {
    'use strict';
    var url = "http://steamcommunity.com/id/" + steamProfileName + "/?xml=1";
    GM_xmlhttpRequest({ // jshint ignore:line
        method: "GET",
        url: url,
        onload: function(response) {
            var xmlDoc = $.parseXML(response.responseText),
                $xml = $(xmlDoc);
            steamID = $xml.find("steamID64").text();
            localStorage.setItem("monkeyBot_steamID64", steamID);
            loadOwnedGames();
        },
        onerror: function() {
            console.error("MonkeyBot - Retrieving SteamID failed. Make sure you have correcly entered your Steam profile name");
        }
    });
}

function loadOwnedGames() {
    'use strict';
    if (!steamID) {
        if (steamProfileName !== "INSERT_STEAM_PROFILE_NAME_HERE") {
            getSteamID();
        } else {
            steamProfileName = window.prompt('MonkeyBot says: Enter your Steam profile name');
            if (steamProfileName === null || steamProfileName === "") {
                console.error("MonkeyBot - Retrieving SteamID failed. Make sure you have included your Steam profile name or SteamID");
                return;
            } else {
                localStorage.setItem("monkeyBot_steamProfileName", steamProfileName);
                getSteamID();
            }
        }
    }

    if (apiKey === null || apiKey === "INSERT_YOUR_API_KEY_HERE") {
        apiKey = window.prompt('MonkeyBot says: Enter your Steam API key');

        if (apiKey === null) {
            console.error("MonkeyBot - Failed to set Steam API key. Please try again");
            return;
        } else {
            localStorage.setItem("monkeyBot_steamApiKey", apiKey);
        }
    }

    var service = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?",
        params = "key=" + apiKey + "&include_appinfo=1&steamid=" + steamID + "&format=json",
        url = service + params;

    GM_xmlhttpRequest({ // jshint ignore:line
        method: "GET",
        url: url,
        onload: function(response) {
            parseOwnedGames(JSON.parse(response.responseText).response);
        },
        onerror: function() {
            console.error("MonkeyBot - Retrieving Steam Game List failed. Try again later");
        }
    });
}

if (window.top !== window.self) {
    return;
} else {
    var href = window.location.href;
    if (/showpost|showthread/.test(href) && modBotPosts.length) {
        if (ownedGames.length === 0 || new Date().toDateString !== lastUpdate || localStorage.getItem("monkeyBot_version") !== GM_info.script.version) { // jshint ignore:line
            loadOwnedGames();
        } else {
            matchGames();
        }
    } else if (/private/.test(href)) {
        var raffleLine = localStorage.getItem("monkeyBot_raffleLine");
        if (raffleLine) {
            $("textarea[name='message']").val(raffleLine);
            localStorage.removeItem("monkeyBot_raffleLine");
        }
    }
}

(function () {
    'use strict';
    var head,
        style;

    head = document.getElementsByTagName('head')[0];
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = ".inLibraryFlag {background: url(' data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAKCAYAAABi8KSDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OUNDNzBFNTUyMUM0MTFFNDk1REVFODRBNUU5RjA2MUYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OUNDNzBFNTYyMUM0MTFFNDk1REVFODRBNUU5RjA2MUYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5Q0M3MEU1MzIxQzQxMUU0OTVERUU4NEE1RTlGMDYxRiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5Q0M3MEU1NDIxQzQxMUU0OTVERUU4NEE1RTlGMDYxRiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv3vUKAAAAAlSURBVHjaYvz//z8DsYARpFhISAivjnfv3jGSp3jUGeQ4AyDAADZHNe2nyOBrAAAAAElFTkSuQmCC') no-repeat 4px 4px #4F95BD; left: 0; top: 42px; font-size: 10px; color: #111111; height: 18px; line-height: 19px; padding: 0 0 0 18px; white-space: nowrap; z-index: 5; display: inline-block; width: 60px; margin-right: 5px;} .inLibraryText { opacity: 0.7; }";
    head.appendChild(style);

}());
