"use strict";
const ribenchi = require("./ribenchi");

const command = (tags, message) => {
  const result = message.split(' ');
  const cmd = result[0];
  const username = tags.username;
  const displayName = tags['display-name'];
  let response;

  if (result.length === 1 ) {
    // 引数なしだよ、コマンドのみで何か返したいときに使ってね、お兄ちゃん
    if (cmd === '!hello') {
      console.log('hello');
      response = `hello ${username}`
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
  } else if (result.length === 2) {
    // 引数1個だけの場合だよ、何か値を使って返したいときに使ってね、お兄ちゃん
    const arg = result[1];
    console.log(`arg: ${arg}`)

    if(cmd === '!so') {
      const channelName = arg.toLowerCase();
      response = `https://www.twitch.tv/${channelName}`
    }

  } else if (result.lenght === 3) {
    // 引数2個だよ、特定の命令付きで返したいときに使ってね、お兄ちゃん
    // 例えば: !cmd add something みたいな感じかな？
    response = `@${username} コマンド何かおかしいみたい…`
  } else {
    // 引数3個以上はここにまとめてね
    // 今はあんま予定ないけど、スペースが入る可能性がある文章とかかな？
    if(cmd === '!hello') {
      // テスト用
      result.shift(); // 先頭の !command を削除
      const text = result.join(' ');
      response = `@${username} ${text}`
    }
  }

  if (response) {
    return response
  } else {
    return `@${username} 何かがおかしいみたい…`
  }
}

module.exports = command;