import { withIronSessionSsr } from 'iron-session/next';
import { sessionOptions } from "../lib/session";
import { useReducer, useEffect, useLayoutEffect, useState, useContext } from 'react';
import Head from 'next/head'
import { useRouter } from 'next/router';
import { useSocket } from '../lib/init-socket';
import { fetchUser, fetchContacts } from '../lib/fetchUser';

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
  const [newMessage, setMessage] = useState({});
  const router = useRouter();

  const visibleHandler = evt => {
    if(document.hidden) {
      // document.title = 'Am Away(' + msgCount + ')'
    } else {
       msgCount = 0;
       document.title = 'Hey! Messenger';
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
    dispatch({ type: 'ADD_MESSAGE', message: newMessage, owner: appState.user.username });
    // if(document.hidden) {
    //   document.title = '(' + ++msgCount + ')New message | ' + document.title;
    // }
  }, [newMessage._id]);

  useEffect(() => {

    if(appState.user.isLoggedIn) {
      useSocket(appState.user.username, ({ socketId, message}) => {
        // console.log('receiving new message')
        setMessage(message);
      });
    }

    return () => console.log('Unmounting...');

  }, [appState.user.isLoggedIn]);

  useEffect(() => {
    window.addEventListener('visibilitychange', visibleHandler);
    return () => window.removeEventListener('visibilitychange', visibleHandler);
  }, []);

  if(userSession.holdRendering && !appState.user.isLoggedIn) {
    return null;
  } else {
    return (
      <Layout>
        <div className="container">
          <Head>
            <title>Hey! Messenger</title>
            <meta name="description" content="Hey Messenger" />
            <link rel="icon" href="/favicon.png" />
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
