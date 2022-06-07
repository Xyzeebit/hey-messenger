import { withIronSessionSsr } from 'iron-session/next';
import { sessionOptions } from "../lib/session";
import { useReducer, useEffect, useLayoutEffect, useState, useContext } from 'react';
import Head from 'next/head'
import { useRouter } from 'next/router';
import { useSocket } from '../lib/init-socket';
import { fetchUser, fetchContacts } from '../lib/fetchUser';
import { writeMessage } from '../lib/write-message';

import Layout from '../components/Layout';
import { ContactList } from '../components/Contact';
import ChatWindow from '../components/ChatWindow';
import { appReducer, initialState } from '../reducer/reducers';
import StateContext from '../components/StateContext';
import io from 'socket.io-client';


// const connectToSocket = async (username) => {
//   await fetch('/api/socket?username=' + username);
// }

// // const URL = 'api/socket'
// let socket = io();
// let callCount = 0;
let msgCount = 0

export default function Home({ userSession }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [appState, setAppState] = useContext(StateContext);
  const { contacts, newConversation } = state;
  const [newMessage, setMessage] = useState({ mid: '', message: {}});
  const [oldMsgId, setOldMsgId] = useState('');
  // const [isOnline, setI] = useState([]);
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

  useEffect(() => {
    setAppState({ ...appState, active: 'home' });
  }, [])

  useEffect(() => {
    if(localStorage.getItem('hey_messenger')) {
      const localSession = JSON.parse(localStorage.getItem('hey_messenger'));
      if(localSession.isLoggedIn) {
        fetchUser(localSession.username, false, user => {
          if(user) {
            setAppState({ ...appState, user, isLoggedIn: true });
          }
        });

      } else {
        router.push('/login')
      }
    } else {
      router.push('/signup');
    }

  }, []);

  useEffect(() => {
    const { mid, message } = newMessage;
    console.log('dispatching id: ' + mid, 'old id ' + oldMsgId + ' message ' + message.text);
    if(mid !== oldMsgId) {
      dispatch({ type: 'ADD_MESSAGE', message,
        owner: appState.user.username, isOpen: newConversation.showChatWindow });
        setOldMsgId(mid);
        // write to db if sender is owner
        if(newConversation.username === message.from) {
          writeMessage(newConversation.username, message, resp => {
            console.log('writing message status', resp)
          });
        }
    }
  }, [newMessage.mid]);

  useEffect(() => {

    if(appState.user.isLoggedIn) {
      useSocket(appState.user.username, dispatch, ({ message }) => {
        setMessage({ message, mid: (message._id !== newMessage.mid) ? message._id : newMessage.mid });
      });
    }

    return () => console.log('Unmounting...');

  }, [appState.user.isLoggedIn]);

  useEffect(() => {
    window.addEventListener('visibilitychange', visibleHandler);
    return () => window.removeEventListener('visibilitychange', visibleHandler);
  }, []);

  // useEffect(() => {
  //   if(usersOnline) {
  //
  //   }
  // }, [usersOnline]);

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
