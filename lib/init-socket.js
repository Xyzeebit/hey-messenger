import io from 'socket.io-client';

export const socket = io();

export const useSocket = async (username, dispatch, callback) => {
  await fetch('/api/socket?username=' + username);

  socket.on('connect', () => {
    console.log('connected');
  });

  if(socket.connected) {
    setInterval(() => {
      socket.emit('is online', { username });
    }, 10000);
  }

  socket.on('is online', user => {
    dispatch({ type: 'USERS_ONLINE', username: user.username });
  });

  socket.on('disconnect', () => {
    console.log('disconnected')
  });


  socket.on('my-chat', msg => {
    callback({ message: msg });
  });
}
