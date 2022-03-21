import * as net from 'net';

export const bouyomiConnect = (message:string):void => {
    const client = new net.Socket();

    client.connect(50001, '127.0.0.1', () => {
        const iCommand = Buffer.alloc(2);
        iCommand.writeInt16LE(1, 0);  //コマンド（ 0:メッセージ読み上げ）
        client.write(iCommand);

        const iSpeed = Buffer.alloc(2);
        iSpeed.writeInt16LE(-1, 0);   //速度   （-1:棒読みちゃん画面上の設定）
        client.write(iSpeed);

        const iTone = Buffer.alloc(2);
        iTone.writeInt16LE(-1, 0);    //音程   （-1:棒読みちゃん画面上の設定）
        client.write(iTone);

        const iVolume = Buffer.alloc(2);
        iVolume.writeInt16LE(-1, 0);  //音量   （-1:棒読みちゃん画面上の設定）
        client.write(iVolume);

        const iVoice = Buffer.alloc(2);
        iVoice.writeInt16LE(1, 0);    //声質   （ 1:女性)
        client.write(iVoice);

        const bCode = Buffer.alloc(1);
        bCode.writeInt8(0, 0);        //文字列のbyte配列の文字コード(0:UTF-8, 1:Unicode, 2:Shift-JIS)
        client.write(bCode);

        const bMessage = Buffer.from(message, 'utf8'); //文字列のbyte配列
        const iLength = Buffer.alloc(4);
        iLength.writeInt32LE(bMessage.length, 0); //文字列のbyte配列の長さ
        client.write(iLength);
        client.write(bMessage);
        client.end();
    });

    /*
    client.on('close', function(){
        console.log('client-> connection is closed');
    });
    */
}