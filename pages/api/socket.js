import { Server } from 'socket.io';

export default function handler(req, res) {
  let io;
  if(res.socket.server.io) {
    console.log('Socket is already running');
    // communicator(io);
  } else {
    console.log('Socket is initializing');
    io = new Server(res.socket.server);
    res.socket.server.io = io;
    // { transports: ['websocket'], upgrade: false }
    // communicator(io);
  }

  communicator(res.socket.server.io);

  res.end();
}

function communicator(io) {
  io.on('connection', socket => {
    console.log(socket.id);
    socket.on('my-chat', msg => {
      socket.broadcast.emit('your-chat', msg + ' from server');
      console.log(msg);
    });

  });
  io.on('disconnect', socket =>  {
    console.log('disconnected');
  })
}
