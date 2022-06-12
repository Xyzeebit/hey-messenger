// import { EventEmitter } from 'events';
// import { Server } from 'socket.io';
import User from '../../models/userSchema';
import Message from '../../models/messagesSchema';
import dbConnect from '../../lib/dbConnect';
// import { PeerServer } from 'peer';
// import { Peer } from 'peerjs';
// const io = require('../../server');

// const emitter = new EventEmitter();
// emitter.setMaxListeners(100);

// let io;

export default async function handler(req, res) {

  dbConnect();

  // console.log('calling socket', req.io);

  const { username } = req.query;
  let user;
  const rooms = [];
  const onlineUsers = [];

  // const peerServer = PeerServer({ port: 3001, path: '/hey'});

  // peerServer = PeerServer(Server, { debug: true })

  // const peer = new Peer('video-call');
  // conn.on('open', () => {
  //   conn.send('hi!');
  // })


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


  res.end();
}

let counter = 0;
function communicator(io, rooms) {

    io.on('connection', socket => {
      console.log('server connected...')

      for (let room of rooms) {
        socket.join(room);
      }

    });

    io.on('disconnect', socket =>  {
      console.log('server disconnected');
      socket.disconnect();
      socket.removeAllListener('my-chat');
      socket = null;
    });
}
