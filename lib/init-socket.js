import io from 'socket.io-client';

const initSocket = async (socket, dispatch) => {
  await fetch('/api/socket');
  socket = io();

  socket.on('connect', () => {
    console.log('connected');
  });

  socket.emit('my-chat', 'hello world');

  socket.on('your-chat', msg => {
    console.log(msg);
  });
}

export default initSocket;
