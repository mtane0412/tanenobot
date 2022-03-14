import * as dotenv from "dotenv";
import axios from 'axios';

dotenv.config();

export const dictionary = (query:string) => {
    const websterUrl:string = 'https://dictionaryapi.com/api/v3/references/collegiate/json/'
    if(!process.env.WEBSTER_DICTIONARY_API_KEY) throw Error('dictionary api error');
    const websterKey:string = process.env.WEBSTER_DICTIONARY_API_KEY;
    return axios.get(`${websterUrl}${query}?key=${websterKey}`)
        .then((response) => {
            let result:string = "";
            response.data.forEach((headword:any, hwIndex:number) => {
                const hw = headword.hwi.hw.replace(/\*/g, '');
                if (query === hw) {
                    let definitions:string = "";
                    headword.shortdef.forEach((def:string, index:number) => {
                        definitions += `${index+1}: ${def} | `
                    })
                    result += `【${hwIndex + 1}】 ${headword.hwi.hw} (${headword.fl}) - ${definitions} `
                }
                
            })
            return result;
        }
        ).catch((error) => {
            console.log(error);
            return `辞書に載ってないよ`
        });
}