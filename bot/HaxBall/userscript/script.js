// ==UserScript==
// @name         HaxBilliards Script
// @version      0.1
// @author       Carleslc (kslar)
// @match        https://www.haxball.com/play*
// @description  Script for HaxBall that allows you to use the commands in the Billiards Pub room by pressing "z".
// ==/UserScript==////////

/* 
Heavily inspired by "SuperSlowball Script"
https://greasyfork.org/es/scripts/410545-superslowball-script
@author Wepro
@namespace https://greasyfork.org/users/684435
*/

// TODO: Not working. Refactor & implement.

var iframe;
var key;
var yourkey = "z"; //choose your activation command key
var powercheck;
var gameframe = document.documentElement.getElementsByClassName("gameframe")[0];
var loaded = false;
var teams = [];
var players = [];

setTimeout(function setup() {
  iframe = document.querySelector("iframe").contentWindow.document;
  iframe.body.addEventListener("keydown", keypressed, true);
}, 1000);

function keypressed(event) {
  if (iframe.activeElement != iframe.querySelectorAll("[data-hook='input']")[0]) {
    key = event.key;
    typePower();
  }
}

function typePower() {
  if (key == yourkey && powercheck.checked == true) {
    iframe.body.removeEventListener("keydown", keypressed, true);

    iframe.body.querySelectorAll("[data-hook='input']")[0].value = "q";
    iframe.body.querySelectorAll("[data-hook='send']")[0].click();
    setTimeout(function setup() {
      iframe = document.querySelector("iframe").contentWindow.document;
      iframe.body.addEventListener("keydown", keypressed, true);
    }, 100);
  }
}

function setPower(player) {
  var admin = gameframe.contentWindow.document.getElementById("powers");
  switch (admin.value) {
    case "👽 Slimers":
      iframe.body.querySelectorAll("[data-hook='input']")[0].value = "!1";
      iframe.body.querySelectorAll("[data-hook='send']")[0].click();
      break;
    case "🍔 Fats":
      iframe.body.querySelectorAll("[data-hook='input']")[0].value = "!3";
      iframe.body.querySelectorAll("[data-hook='send']")[0].click();
      break;
    case "🥏️ Spinners":
      iframe.body.querySelectorAll("[data-hook='input']")[0].value = "!5";
      iframe.body.querySelectorAll("[data-hook='send']")[0].click();
      break;
    case "👻 Ghosts":
      iframe.body.querySelectorAll("[data-hook='input']")[0].value = "!6";
      iframe.body.querySelectorAll("[data-hook='send']")[0].click();
      break;
    case "🏃‍♂️ Sprinters":
      iframe.body.querySelectorAll("[data-hook='input']")[0].value = "!7";
      iframe.body.querySelectorAll("[data-hook='send']")[0].click();
      break;
    case "🦶 Powerful":
      iframe.body.querySelectorAll("[data-hook='input']")[0].value = "!8";
      iframe.body.querySelectorAll("[data-hook='send']")[0].click();
      break;
    case "⚡ Minions":
      iframe.body.querySelectorAll("[data-hook='input']")[0].value = "!10";
      iframe.body.querySelectorAll("[data-hook='send']")[0].click();
      break;
    default:
    // code block
  }
}

function waitForElement(selector) {
  return new Promise(function (resolve, reject) {
    var element = document
      .getElementsByClassName("gameframe")[0]
      .contentWindow.document.querySelector(selector);

    if (element) {
      resolve(element);
      return;
    }

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var nodes = Array.from(mutation.addedNodes);
        for (var node of nodes) {
          if (node.matches && node.matches(selector)) {
            resolve(node);
            return;
          }
        }
      });
    });

    observer.observe(
      document.getElementsByClassName("gameframe")[0].contentWindow.document,
      {
        childList: true,
        subtree: true,
      }
    );
  });
}

moduleObserver = new MutationObserver(function (mutations) {
  candidates = mutations
    .flatMap((x) => Array.from(x.addedNodes))
    .filter((x) => x.className);
  if (candidates.length == 1) {
    var tempView = candidates[0].className;
    console.log(tempView);
    switch (true) {
      case tempView == "game-view":
        var gameframe =
          document.documentElement.getElementsByClassName("gameframe")[0];
        var statSec =
          gameframe.contentWindow.document.getElementsByClassName(
            "stats-view"
          )[0];

        setInterval(function () {
          var team =
            gameframe.contentWindow.document.getElementsByClassName("teams")[0];
          if (team != undefined) {
            teams = [];
            players = [];

            for (let i = 1; i < 4; i++) {
              teams.push(team.children[i]);
            }
            for (let i = 0; i < teams.length; i++) {
              for (let d = 0; d < teams[i].children[1].children.length; d++) {
                var names = teams[i].children[1].children[
                  d
                ].children[1].textContent
                  .split(" ")
                  .join("_");
                teams[i].children[1].children[d].id = names;
                players.push(names);
              }
            }
            for (let i = 0; i < players.length; i++) {
              gameframe.contentWindow.document.getElementById(
                players[i]
              ).onclick = function () {
                setPower(players[i]);
              };
            }
          }
        }, 100);

        setInterval(function () {
          var admin =
            gameframe.contentWindow.document.getElementsByClassName(
              "tools admin-only"
            )[0];
          if (admin == undefined) {
            return;
          }
          if (loaded == false) {
            var powers_array = [
              "👽 Slimers",
              "🍔 Fats",
              "🥏️ Spinners",
              "👻 Ghosts",
              "🏃‍♂️ Sprinters",
              "🦶 Powerful",
              "⚡ Minions",
            ];
            var list = document.createElement("select");
            list.id = "powers";
            admin.appendChild(list);

            for (let i = 0; i < powers_array.length; i++) {
              var option = document.createElement("option");
              option.value = powers_array[i];
              option.text = powers_array[i];
              list.appendChild(option);
            }

            loaded = true;
          }
        }, 100);

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "powercheck";

        var label = document.createElement("label");
        label.htmlFor = "powercheck";
        label.appendChild(document.createTextNode(" Enable"));

        statSec.appendChild(checkbox);
        statSec.appendChild(label);

        powercheck =
          gameframe.contentWindow.document.getElementById("powercheck");
        break;
      case tempView == "roomlist-view":
        loaded = false;
        break;
    }
  }
});

init = waitForElement("div[class$='view']");
init.then(function (value) {
  currentView = value.parentNode;
  moduleObserver.observe(currentView, {
    childList: true,
    subtree: true,
  });
});
