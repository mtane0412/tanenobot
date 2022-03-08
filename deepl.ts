import * as dotenv from "dotenv";
import translate, { DeeplLanguages } from "deepl";
import { AxiosResponse } from "axios";

dotenv.config;
if (!process.env.DEEPL_API_KEY) throw Error('DeepL APIキーが正しくありません');
const AUTH_KEY: string = process.env.DEEPL_API_KEY;


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



const deepl = (message: string): Promise<AxiosResponse<Response>> => {
    // デフォルト翻訳先言語
    let targetLang: DeeplLanguages = 'JA';

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
    })
}

module.exports = {exclude, deepl};