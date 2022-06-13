// inspired by Doorbellbot @L4yLa
// https://github.com/L4yLa/TwitchBots
const player = require('node-wav-player');

const users: string[] = ['kalon75', 'yoshiox11', 'ribenchi'];

export const doorbellPlay = (user:string) => {
    const path = users.includes(user) ? `./public/doorbell_${user}.wav` : './public/ribenchiHi.wav';
    player.play({path: path})
    .then(() => {
        console.log(`${user}さんがいらっしゃいました！`);
    }).catch((error:unknown) => {
        console.error(error);
    });
};

export const rewardPlay = (rewardTitle:string) => {
    // あとでかえる
    const path = `./public/ribenchiTaneSaiteShine.wav`;
    player.play({path: path})
    .catch((error:unknown) => {
        console.error(error);
    })
}