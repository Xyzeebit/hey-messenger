import io from 'socket.io-client';

export const socket = io();

export const useSocket = async (username, callback) => {
  await fetch('/api/socket?username=' + username);

  socket.on('connect', () => {
    console.log('connected');
  });

  // socket.emit('my-chat', 'hello world');

  // socket.on('your-chat', msg => {
  //   console.log(msg);
  // });

  socket.on('my-chat', msg => {
    // console.log('from: ', msg.from, 'to: ', msg.to, 'chat id:', msg.chatId,
    // 'body: ', msg.text, 'socket id', socket.id);
    callback({ socketId: socket.id, message: msg });
  });
}
