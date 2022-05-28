import { Server } from 'socket.io';
import User from '../../models/userSchema';
import Message from '../../models/messagesSchema';
import dbConnect from '../../lib/dbConnect';

let io;

export default async function handler(req, res) {

  dbConnect();

  const { username } = req.query;
  let user;
  const rooms = [];
  const onlineUsers = [];

  if(username) {
    user = await User.findOne({ username }).select('contacts');
  }
  if(user) {
    // console.log(user)
    for (var room of user.contacts) {
      rooms.push(room.chatId)
    }
    // console.log(roomIds)
  }

  // console.log('contacts on server:...', req.query)

  if(res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    io = new Server(res.socket.server);
    res.socket.server.io = io;
    // { transports: ['websocket'], upgrade: false }
    // communicator(io);
  }

  communicator(res.socket.server.io, rooms);

  res.end();
}

let counter = 0;
function communicator(io, rooms) {
  if(counter < 1) {
    io.on('connection', socket => {
      console.log(socket.id);
      console.log('counter', counter++);
      for (let room of rooms) {
        socket.join(room);
        // send message to all users in room can be use for is online functionalty
        socket.broadcast.to(room).emit('is online', true);
      }

      socket.on('my-chat', msg => {
        socket.to(msg.chatId).emit('my-chat', msg)
        // socket.broadcast.emit('your-chat' + msg + ' from server');
        // console.log(msg);
      });

    });

    io.on('disconnect', socket =>  {
      console.log('disconnected');
    })
  }
}
