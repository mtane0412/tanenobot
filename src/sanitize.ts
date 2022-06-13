import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";

export const sanitize = (msg: TwitchPrivateMessage, bttvEmotes: Set<string>): string => {
    /*
        sanitize: テキストを抽出する
    */
    let sanitizedMessage: string = '';
    // テキストのみを抽出
    msg.parseEmotes().forEach(parsedMessage => {
        if (parsedMessage.type === 'text') {
            sanitizedMessage += parsedMessage.text;
        }
    });

    // 絵文字除去
    sanitizedMessage = sanitizedMessage.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    
    // BTTV/FFZのエモートを除去
    bttvEmotes.forEach(emote=> {
        sanitizedMessage = sanitizedMessage.replace(emote, '');
    })

    return sanitizedMessage;
}