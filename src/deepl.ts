import translate, { DeeplLanguages } from "deepl";
import * as dotenv from "dotenv";
dotenv.config();
if (!process.env.DEEPL_API_KEY) throw Error('DeepL APIキーが設定されていません');
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



export const deepl = async (message: string): Promise<string | undefined> => {
    // 除外判定に引っかかった場合は翻訳しない
    if(exclude(message)) return
    
    // デフォルト翻訳先言語
    let targetLang: DeeplLanguages = 'JA';

    // 日本語判定(中国語巻き込み)
    if(isJapanese(message)) {
        targetLang = 'EN';    
    }

    // EN->JA or JA->EN
    const result = await translate({
        free_api: true,
        text: message,
        target_lang: targetLang,
        auth_key: AUTH_KEY,
    });
    
    if (result.data.translations[0].text) {
        return result.data.translations[0].text
    } else {
        return undefined
    }
}