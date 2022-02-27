"use strict";
const ribenchi = require("./ribenchi");

const command = (tags, message) => {
  const result = message.split(' ');
  const cmd = result[0]; // ここに !cmd が入るよ
  const username = tags.username;
  const displayName = tags['display-name'];
  let response;

  if (cmd === '!hello') {
    if (result.length === 1) {
      response = `hello ${username}`
    } else {
      // テスト用
      result.shift(); // 先頭の !command を削除
      const text = result.join(' ');
      response = `@${username} ${text}`
    }
  }

  if(cmd === '!discord') {
    response =  `Discordサーバーでぜひお話しましょう！ Why not join our discord server? Let's enjoy talking with us! https://discord.gg/F76ervs3sw`
  }

  if(cmd === '!lurk') {
    let lurker = username;
    if (displayName) {
      lurker = displayName;
    }
    response = `/me FeelsStrongMan Thank you for the lurk! ${lurker} is now lurking, they will be missed! peepoLove`
  }

  if(cmd === '!inoran') {
    response = `このかわいいドラゴンの体を作ったのはイノラン博士です。あなたも人間をやめよう！ It was Dr. Inoran who created this cute little dragon body. You should stop being human too!  https://www.twitch.tv/doctor_inoran https://twitter.com/doctor_inoran`
  }

  if(cmd === '!ribenchi') {
    response = ribenchi
  }

  if (cmd === '!shuzo') {
    response = `諦めちゃダメだ！ https://www.shuzo.co.jp/message/`
  }

  if (cmd === '!github') {
    response = `https://github.com/mtane0412/tanenobot`
  }

  if(cmd === '!so') {
    // 第1引数を常にchannel nameと考えるよ！
    const channelName = result[1].toLowerCase();
    response = `https://www.twitch.tv/${channelName}`
  }

  // お兄ちゃんへの返事を言うよ！
  if (response) {
    return response
  } else {
    console.error(`${cmd}は登録されてないよ`);
    return 
  }
}

module.exports = command;