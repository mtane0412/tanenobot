require('dotenv').config();

const axios = require('axios');
const websterUrl = 'https://dictionaryapi.com/api/v3/references/collegiate/json/'
const websterKey = process.env.WEBSTER_DICTIONARY_API_KEY;

const dictionary = (query) => {
    return axios.get(`${websterUrl}${query}?key=${websterKey}`)
        .then((response) => {
            let result = "";
            response.data.forEach((headword, hwIndex) => {
                const hw = headword.hwi.hw.replace(/\*/g, '');
                if (query === hw) {
                    let definitions = "";
                    headword.shortdef.forEach((def, index) => {
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

module.exports = dictionary;
