"use strict";
// inspired by Doorbellbot @L4yLa
// https://github.com/L4yLa/TwitchBots

const player = require('node-wav-player');
const users = ['kalon75', 'yoshiox11'];

const doorbellPlay = (user) => {
    const path = users.includes(user) ? `./doorbell_${user}.wav` : './ribenchiHi.wav';
    player.play({path: path})
    .then(() => {
        console.log(`${user}さんがいらっしゃいました！`);
    }).catch((error) => {
        console.error(error);
    });
}

module.exports = doorbellPlay;
