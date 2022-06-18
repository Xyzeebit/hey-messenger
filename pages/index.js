import { withIronSessionSsr } from 'iron-session/next';
import { sessionOptions } from "../lib/session";
import { useReducer, useEffect, useCallback, useState, useContext, useMemo } from 'react';
import Head from 'next/head'
import { useRouter } from 'next/router';
// import { connectSocket, socket } from '../lib/init-socket';
import { fetchUser } from '../lib/fetchUser';
import { writeMessage } from '../lib/write-message';

import Layout from '../components/Layout';
import { ContactList } from '../components/Contact';
import ChatWindow from '../components/ChatWindow';
import { appReducer, initialState } from '../reducer/reducers';
import StateContext from '../components/StateContext';
// import io from 'socket.io-client';
// import { Peer } from 'peerjs';

import io from "socket.io-client";

export const socket = io("/");

let msgCount = 0

export default function Home({ userSession }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [appState, setAppState] = useContext(StateContext);
  const { contacts, newConversation } = state;
  const [newMessage, setMessage] = useState({ mid: '', message: {}});
  const [oldMsgId, setOldMsgId] = useState('');
  const [isOnline, setOnline] = useState({ online: false, username: '' });
  const router = useRouter();

  const visibleHandler = evt => {
    let fav = document.getElementById('favicon');
    if(document.hidden) {
      if(newMessage.message) {
        if(oldMsgId && oldMsgId !== newMessage.message._id) {
          if(fav.href.endsWith('favicon.png')) {
            fav.href = fav.href.replace('favicon.png', 'favicon-alt.png');
          }
        }
      }
    } else {
      if(fav.href.endsWith('favicon-alt.png')) {
        fav.href = fav.href.replace('favicon-alt.png', 'favicon.png')
      }
    }
  }

  // const active = useMemo(() => 'home', [])


  useEffect(() => {
    setAppState({ ...appState, active: 'home' });
  }, []);

  const getUser = useCallback(() => {
    if (localStorage.getItem("hey_messenger")) {
      const localSession = JSON.parse(localStorage.getItem("hey_messenger"));
      if (localSession.isLoggedIn) {
        fetchUser(localSession.username, false, (user) => {
          if (user) {
            setAppState({ ...appState, user, isLoggedIn: true });
          }
        });
      } else {
        router.push("/login");
      }
    } else {
      router.push("/signup");
    }
  }, [appState, router]);

  useEffect(() => {
    getUser();
  }, []);

  useCallback(() => {
    console.log('is online callback');
    if (isOnline.online) {
      console.log('dispatching is online')
      dispatch({ type: "USERS_ONLINE", username: isOnline.username });
    }
  }, [isOnline])

  const sendMessage = useCallback(() => {
    const { mid, message } = newMessage;
    if (mid !== oldMsgId) {
      dispatch({
        type: "ADD_MESSAGE",
        message,
        owner: appState.user.username,
        isOpen: newConversation.showChatWindow,
      });
      setOldMsgId(mid);
      if (appState.user.username === message.from) {
        writeMessage(newConversation.username, message, (resp) => {
          // console.log('writing message status', resp)
        });
      }
    }
  }, [oldMsgId, newMessage]);

  useEffect(() => {
    sendMessage();
  }, [newMessage]); //, appState.user.username, newConversation.showChatWindow, newMessage, oldMsgId]


  useEffect(() => {
    socket.on("connect", () => {
      console.log("client connected");
    });

    socket.on("connect_error", (err) => {
      console.log("client connection error", err);
    });

    if (socket.connected) {
      setInterval(() => {
        socket.emit("is online", { username });
      }, 10000);
    }

    socket.on("is online", (user) => {
      isOnline = setOnline({ online: true, username: user.username });
    });

    socket.on("my-chat", (message) => {
      // console.log('message received', msg)

      setMessage({
        message,
        mid: message._id !== newMessage.mid ? message._id : newMessage.mid,
      });
      // callback({ message: msg });
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  }, []);

  // const connectToSocket = useCallback(() => {
  //   console.log('calling connect from callback');
  //   connectSocket(appState.user.username, dispatch, ({ message }) => {
  //     setMessage({
  //       message,
  //       mid: message._id !== newMessage.mid ? message._id : newMessage.mid,
  //     });
  //   });
  // }, [appState.user.username, newMessage.mid]);

  // useEffect(() => {
  //   if(!socket.connected) {
  //     console.log('socket is not connected retry');
  //     const soct = setInterval(() => {
  //       socket.connected ? "" : connectToSocket();
  //     }, 10000)
  //   }
    
  //   return () => clearInterval(soct);
  // }, [socket.connected])

  // useEffect(() => {

  //   if (appState.user.isLoggedIn) {
  //     console.log('user is logged in')
  //     connectToSocket()
  //   } else {
  //     console.log('user is not logged in');
  //   }

  //   return () => {
  //     socket.disconnect();
  //     console.log('Unmounting...');
  //   };

  // }, [appState.user.isLoggedIn]);

  // useEffect(() => {
  //   window.addEventListener('visibilitychange', visibleHandler);
  //   return () => window.removeEventListener('visibilitychange', visibleHandler);
  // }, []);

  // useEffect(() => {
  //   import('peerjs').then(({ default: Peer }) => {
  //     const peer = new Peer(appState.user._id, {
  //       path: '/hey',
  //       host: 'localhost',
  //       port: 3001
  //     });
  //     console.log(contacts)
  //     if(appState.user.contacts) {
  //       for(let contact of appState.user.contacts) {
  //         peer.connect(contact._id);
  //       }
  //     }
  //     // peer.connect('jessie/')
  //     // console.log("peer id", peer);
  //     peer.on('connection', (conn) => {
  //       console.log('peer connected');
  //       conn.on('data', data => {
  //         console.log('peer data', data)
  //       });
  //       conn.on('open', () => {
  //         conn.send('hello from peer');
  //       })
  //     })
  //   })
  //
  // }, [appState.user.isLoggedIn]);

  if(userSession.holdRendering && !appState.user.isLoggedIn) {
    return null;
  } else {
    return (
      <Layout>
        <div className="container">
          <Head>
            <title>Hey! Messenger</title>
            <meta name="description" content="Hey Messenger" />
            <link id="favicon" rel="icon" href="/favicon.png" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome-min.css" />
          </Head>

          <div className="main">
            <ContactList contacts={contacts} dispatch={dispatch} />
            <ChatWindow
              contact={newConversation}
              owner={appState.user.username}
              dispatch={dispatch}
            />
          </div>

        </div>
      </Layout>
    )
  }
}

// export async function getStaticProps() {
//   return { props: { holdRendering: true } }
// }

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;
    // console.log('user session...', user)
    return {
      props: {
        userSession: { ...user, holdRendering: true }
      }
    }
  }, sessionOptions);
