// inspired by Doorbellbot @L4yLa
// https://github.com/L4yLa/TwitchBots
import * as fs from 'fs';
const player = require('node-wav-player');

export const doorbellPlay = (user:string) => {
    const path = fs.existsSync(`./public/doorbell/${user}.wav`) ? `./public/doorbell/${user}.wav` : './public/doorbell/default.wav';
    player.play({path: path})
    .then(() => {
        console.log(`${user}さんがいらっしゃいました！`);
    }).catch((error:unknown) => {
        console.error(error);
    });
};