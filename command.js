"use strict";
const ribenchi = require("./ribenchi");

const command = async (msg, message, storage, apiClient) => {
  const result = message.split(' ');
  const cmd = result[0]; // ここに !cmd が入るよ
  const username = msg.userInfo.userName;
  const displayName = msg.userInfo.displayName;
  let response;

  if (cmd === '!hello') {
    if (result.length === 1) {
      response = `hello ${username}`;
    } else {
      // テスト用
      result.shift(); // 先頭の !command を削除
      const text = result.join(' ');
      response = `@${username} ${text}`;
    }
  }


  if(cmd === '!translate') {
    storage.enableTranslate = storage.enableTranslate ? false : true;
    response = storage.enableTranslate ? '翻訳はじめるじょ! Start to translate!' : '翻訳やめるじょ! Stop to translate!';
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
    response = ribenchi;
  }

  if (cmd === '!shuzo') {
    response = `諦めちゃダメだ！ https://www.shuzo.co.jp/message/`;
  }

  if (cmd === '!github') {
    response = `https://github.com/mtane0412/tanenobot`;
  }

  if(cmd === '!so') {
    // @マークがついていたら除外する
    let soUser = result[1].replace('@', '');
    // 表示名テーブルを参照して存在すればusernameに置き換える
    const soUserName = storage.nameTable.get(soUser) ? storage.nameTable.get(soUser) : soUser.toLowerCase() ;
    // const channelName = storage.userInfo.get(soUsername).username;
    const channelInfo = await apiClient.channels.getChannelInfo(storage.userInfo.get(soUserName).userId);
    const gameName = await channelInfo.gameName;
    const title = await channelInfo.title;
    response = await `この素晴らしい配信者をチェックしてください！ https://www.twitch.tv/${soUserName} 最後の配信は ${gameName} 「${title}」みたいですよ！`;
  }

  if(cmd === '!lobby') {
    if(result.length === 1) {
      // 引数なしの場合は storage.lobby の値を返す
      response = storage.lobbyInfo;
    } else if (result.length > 1 && username === 'tanenob' ) {
      result.shift(); // 先頭の !command を削除
      const text = result.join(' '); // 引数をすべて結合
      storage.lobbyInfo = text;
      response = `@${username} lobby情報を登録したよ！`;
    } else {
      // たねのぶ以外は登録できない
      response = null;
    }
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