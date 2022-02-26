"use strict";
const ribenchi = require("./ribenchi");

const command = (tags, message) => {
  const re = /(!\w*)\s(.*)/g;
  const result = re.exec(message);
  const username = tags.username;
  const displayName = tags['display-name'];

  if (result) {
    const [cmd, arg] = [result[1].toLowerCase(), result[2]];
    console.log(`arg: ${arg}`)

    if(cmd === '!hello') {
      return `you said "${arg}"`
    }

    if(cmd === '!so') {
      const channelName = arg.toLowerCase();
      return `https://www.twitch.tv/${channelName}`
    }

  } else {
    // 引数がないときだよ、お兄ちゃん
    const cmd = message;
    if (cmd === '!hello') {
      console.log('hello');
      return `hello ${username}`
    }

    if(cmd === '!discord') {
      return `Discordサーバーでぜひお話しましょう！ Why not join our discord server? Let's enjoy talking with us! https://discord.gg/F76ervs3sw`
    }

    if(cmd === '!lurk') {
      let lurker = username;
      if (displayName) {
        lurker = displayName;
      }
      return `/me FeelsStrongMan Thank you for the lurk! ${lurker} is now lurking, they will be missed! peepoLove`
    }

    if(cmd === '!inoran') {
      return `このかわいいドラゴンの体を作ったのはイノラン博士です。あなたも人間をやめよう！ It was Dr. Inoran who created this cute little dragon body. You should stop being human too!  https://www.twitch.tv/doctor_inoran https://twitter.com/doctor_inoran`
    }

    if(cmd === '!ribenchi') {
      return ribenchi
    }

    if (cmd === '!shuzo') {
      return `諦めちゃダメだ！ https://www.shuzo.co.jp/message/`
    }

    return message
  }
}

module.exports = command;