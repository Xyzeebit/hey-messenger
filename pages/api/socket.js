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

    for (var room of user.contacts) {
      rooms.push(room.chatId)
    }

  }

  if(res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    io = new Server(res.socket.server);
    res.socket.server.io = io;
  }

  communicator(res.socket.server.io, rooms);

  res.end();
}

let counter = 0;
function communicator(io, rooms) {
  // if(counter < 1) {
    io.on('connection', socket => {
      // console.log(socket.id, ' connecting for the ' + counter + ' time');
      // console.log('counter', counter++);

      for (let room of rooms) {
        socket.join(room);
      }

      socket.on('my-chat', msg => {
        io.to(msg.chatId).emit('my-chat', msg)
      });
      
    });

    io.on('disconnect', socket =>  {
      console.log('disconnected');
    })
  // }
}
