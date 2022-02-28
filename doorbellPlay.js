"use strict";
// inspired by Doorbellbot @L4yLa
// https://github.com/L4yLa/TwitchBots

const player = require('node-wav-player');

const doorbellPlay = (user) => {
    player.play({
        path: './ribenchiHi.wav',
    }).then(() => {
        console.log(`${user}さんがいらっしゃいました！`);
    }).catch((error) => {
        console.error(error);
    });
}

module.exports = doorbellPlay;
