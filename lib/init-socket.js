import io from 'socket.io-client';

export const socket = io('/');
// export let isOnline = { online: false, username: '' };

// socket.on("connect", () => {
//   console.log("client connected");
// });

// socket.on("connect_error", (err) => {
//   console.log("client connection error", err);
// });

// if (socket.connected) {
//   setInterval(() => {
//     socket.emit("is online", { username });
//   }, 10000);
// }

//  socket.on("is online", (user) => {
//    isOnline = { online: true, username: user.username };
//  });

// socket.on("my-chat", (msg) => {
//   // console.log('message received', msg)
//   callback({ message: msg });
// });

// socket.on("disconnect", () => {
//   console.log("disconnected");
// });

export const connectSocket = async (username) => {
  await fetch('/api/socket?username=' + username);
  //await fetch('/');
  // console.log('socket state', socket);

  // socket.on('connect', () => {
  //   console.log('client connected');

  // });
  // socket.on('connect_error', (err) => {
  //   console.log('client connection error', err);
  // });

  // if(socket.connected) {
  //   console.log('connected');
  // }

  // if(socket.connected) {
  //   setInterval(() => {
  //     socket.emit('is online', { username });
  //   }, 10000);
  // }

  // socket.on('is online', user => {
  //   isOnline = { online: true, username: user.username }
  // });

  // socket.on('disconnect', () => {
  //   console.log('disconnected')
  // });


  // socket.on('my-chat', msg => {
  //   // console.log('message received', msg)
  //   callback({ message: msg });
  // });
}

