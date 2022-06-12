const express = require('express');
const next = require('next');
// const { ExpressPeerServer, PeerServer } = require('peer');


const dev = process.env.NODE_ENV !== 'production';
const port = 3000;
const app = next({ dev, port });
const handle = app.getRequestHandler();

// const peerServer; //PeerServer({ port: 3001, path: '/hey' });

app.prepare()
  .then(() => {
    const server = express();
    const http = require('http').createServer(express);
    const { Server } = require('socket.io');




    // const peerServer = ExpressPeerServer(server, { debug: true });

    // server.use('/peerjs', peerServer);


    const listener = server.listen(port, err => {
      if(err) throw err;
      console.log('listening on port 3000');
    });

    io = new Server(listener);

    server.all('*', (req, res) => {
      req.io = io;
      return handle(req, res);
    });

    communicator(io, []);

    // const peerExpress = require('express');
    // const peerApp = peerExpress();
    // const peerServer = require('http').createServer(peerApp);
    // peerApp.use('/hey', ExpressPeerServer(peerServer, { debug: true }));
    // peerServer.listen(3001);
    //
    // peerServer.on('connection', client => {
    //   console.log('peer client connected to server');
    //
    //   // client.on('data', data => {
    //   //
    //   // })
    // });
    // peerServer.on('disconnect', client => {
    //   console.log('peer client disconnected from server');
    // });
  })
  .catch((error) => {
    console.log(error);
  })




  function communicator(io, rooms) {

      io.on('connection', socket => {
        console.log('connected...')

        socket.on('is online', username => {
          socket.broadcast.emit('is online', username);
        });

        socket.on('my-chat', msg => {
          io.to(msg.chatId).emit('my-chat', msg)
          // console.log('writing message to db', msg);
        });

      });

      io.on('disconnect', socket =>  {
        console.log('disconnected');
        socket.disconnect();
        socket.removeAllListener('my-chat');
        socket = null;
      });
  }
