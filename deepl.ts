require('dotenv').config();
const translate = require("deepl");
const AUTH_KEY = process.env.DEEPL_API_KEY;

const isOnlySpace = (text: string): boolean => {
    // 空白判定
    return !text.trim()
};

const isOnlyClap = (text: string): boolean => {
    // 8888判定
    return !text.replace(/[\s8８]/g, '');
};

const isOnlyUrl = (text: string): boolean => {
    // url判定
    const url = text.trim();
    const regex = /^https?:\/\/[\S]*$/;
    return regex.test(url)
}

const exclude = (text: string): boolean => {
    return isOnlySpace(text) || isOnlyClap(text) || isOnlyUrl(text)
}

const isJapanese = (text: string): boolean => {
    // 中国語は犠牲になったのだ…
    const re = new RegExp('[ぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠]', 'g');
    return re.test(text)
}


type translation = {
    Data: string[]
}


const deepl = (message: string): Promise<translation> => {
    // デフォルト翻訳先言語
    let targetLang = 'JA';

    // 日本語判定(中国語巻き込み)
    if(isJapanese(message)) {
        targetLang = 'EN';    
    }
    // EN->JA or JA->EN
    return translate({
        free_api: true,
        text: message,
        target_lang: targetLang,
        auth_key: AUTH_KEY,
        // All optional parameters available in the official documentation can be defined here as well.
    })
}

module.exports = {exclude, deepl};