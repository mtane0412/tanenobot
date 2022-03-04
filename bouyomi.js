exports.sendBouyomi = (options, message) => {
const messageBuffer = new Buffer.from(message);

const buffer = new Buffer.alloc(15 + messageBuffer.length);
buffer.writeUInt16LE(0x0001, 0);
buffer.writeUInt16LE(0xFFFF, 2);
buffer.writeUInt16LE(0xFFFF, 4);
buffer.writeUInt16LE(0xFFFF, 6);
buffer.writeUInt16LE(0000, 8);
buffer.writeUInt8(00, 10);
buffer.writeUInt32LE(messageBuffer.length, 11);
messageBuffer.copy(buffer, 15, 0, messageBuffer.length);

require('net')
    .connect(options)
    .on('error', (err) => {
        if (err.message.includes('ECONNREFUSED')) {
            console.error("棒読みちゃんの接続に失敗しました。")
        } else {
            console.error(err);
        }
    })
    .end(buffer);
}