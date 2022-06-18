// import { EventEmitter } from 'events';
// import { Server } from 'socket.io';
import User from '../../models/userSchema';
import Message from '../../models/messagesSchema';
import dbConnect from '../../lib/dbConnect';
import { Server } from 'socket.io';

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

 
  if(req.io) {
    console.log('Socket is already running');
    communicator(req.io, rooms);
  } else {
    // console.log('Socket is initializing');
    // io = new Server(res.socket.server);
    // req.io = io;
  }
  
  // communicator(io, req.rooms)


  res.end();
}

let counter = 0;
function communicator(io, rooms) {

    io.on('connection', socket => {
      console.log('server connected...')

      for (let room of rooms) {
        socket.join(room);
      }

      socket.on('is online', username => {
        socket.broadcast.emit('is online', username);
        console.log(username, ' is online')
      });

      socket.on('my-chat', msg => {
        io.to(msg.chatId).emit('my-chat', msg)
          // console.log('writing message to db', msg);
      });
      
    });

    io.on('disconnect', socket =>  {
      console.log('server disconnected');
      socket.disconnect();
      socket.removeAllListener('my-chat');
      socket = null;
    });
}
