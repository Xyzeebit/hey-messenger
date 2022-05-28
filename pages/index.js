import { withIronSessionSsr } from 'iron-session/next';
import { sessionOptions } from "../lib/session";
import { useReducer, useEffect, useLayoutEffect, useState, useContext } from 'react';
import Head from 'next/head'
import { useRouter } from 'next/router';
import initSocket from '../lib/init-socket';
import { fetchUser, fetchContacts } from '../lib/fetchUser';

import Layout from '../components/Layout';
import { ContactList } from '../components/Contact';
import ChatWindow from '../components/ChatWindow';
import { appReducer, initialState } from '../reducer/reducers';
import StateContext from '../components/StateContext';
import io from 'socket.io-client';


const connectToSocket = async (username) => {
  await fetch('/api/socket?username=' + username);
}

// const URL = 'api/socket'
let socket = io();
let callCount = 0;

export default function Home({ userSession }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [appState, setAppState] = useContext(StateContext);
  const { user, contacts, chats, newConversation } = state;
  const [users, setUsers] = useState({});
  const [messages, setMessages] = useState({});
  const [newMessage, setMessage] = useState({});
  const router = useRouter();

  useEffect(() => {
    setAppState({ ...appState, active: 'home' });
  }, [])

  useEffect(() => {
    if(localStorage.getItem('hey_messenger')) {
      const localSession = JSON.parse(localStorage.getItem('hey_messenger'));
      if(localSession.isLoggedIn) {
        fetchUser(localSession.username, false, user => {
          if(user) {
            console.log('fetched user', user)
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
    setMessages(chats);
  }, [chats])

  useEffect(() => {
    dispatch({ type: 'ADD_MESSAGE', message: newMessage, chatId: newMessage.chatId });
    console.log('new message', newMessage)
    // const msgs = messages[newMessage.chatId].messages;
    // msgs.messages.push(newMessage);
    // setMessages({ ...messages, [(newMessage.chatId)]: msgs })
    // console.log(messages)
  }, [newMessage.time]);


  useEffect(() => {

    if(appState.user.isLoggedIn) {
      connectToSocket(appState.user.username);
       // socket = io();
      // socket.auth = { username: appState.user.username } // Change to chatId
      // socket.connect();
      socket.on('connect', () => {
        console.log('connected');

      });

      // socket.emit('my-chat', 'hello world');

      socket.on('my-chat', msg => {
        console.log('from: ', msg.from, 'to: ', msg.to, 'chat id:', msg.chatId,
        'body: ', msg.text);
        // alert(msg.text);
        setMessage(msg);
      });
      socket.on('is online', msg => {
        console.log('I am ', msg);
      });
    }

  }, [appState.user.isLoggedIn]);

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
              messages={messages}
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
    console.log('user session...', user)
    return {
      props: {
        userSession: { ...user, holdRendering: true }
      }
    }
  }, sessionOptions);
