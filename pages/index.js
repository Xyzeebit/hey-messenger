// import { withIronSessionSsr } from "iron-session/next";
// import { sessionOptions } from "../lib/session";
import {
  useReducer,
  useEffect,
  useCallback,
  useState,
  useContext,
  useMemo,
} from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { fetchUser } from "../lib/fetchUser";
import { writeMessage } from "../lib/write-message";
import Layout from "../components/Layout";
import { ContactList } from "../components/Contact";
import ChatWindow from "../components/ChatWindow";
import Notice from '../components/ChatWindow';
import { Spinner } from '../components/form-components';
import { appReducer, initialState } from "../reducer/reducers";
import { socket } from '../lib/socket';
import StateContext from "../components/StateContext";

let sendingCount = 0;

export default function Home() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [appState, setAppState] = useContext(StateContext);
  const { contacts, newConversation } = state;
  const [newMessage, setMessage] = useState({ mid: "", message: {} });
  const [oldMsgId, setOldMsgId] = useState("");
  const [isOnline, setOnline] = useState({ online: false, username: "" });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const visibleHandler = (evt) => {
    let fav = document.getElementById("favicon");
    if (document.hidden) {
      if (newMessage.message) {
        if (oldMsgId && oldMsgId !== newMessage.message._id) {
          if (fav.href.endsWith("favicon.png")) {
            fav.href = fav.href.replace("favicon.png", "favicon-alt.png");
          }
        }
      }
    } else {
      if (fav.href.endsWith("favicon-alt.png")) {
        fav.href = fav.href.replace("favicon-alt.png", "favicon.png");
      }
    }
  };

  useEffect(() => {
    setAppState({ ...appState, active: "home" });
  }, []);

  const getUser = useCallback(() => {
    if (localStorage.getItem("hey_messenger")) {
      const localSession = JSON.parse(localStorage.getItem("hey_messenger"));
      if (localSession.isLoggedIn) {
        fetchUser(localSession.username, false, (user) => {
          if (user) {
            setAppState({ ...appState, user, isLoggedIn: true });
            setLoading(false);
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

  useEffect(() => {
    if (isOnline.online) {
      dispatch({ type: "USERS_ONLINE", username: isOnline.username });
    }
  }, [isOnline.username]);
  

  useEffect(() => {
    const { mid, message } = newMessage;
    if (mid !== oldMsgId) {
      dispatch({
        type: "ADD_MESSAGE",
        message,
		oldMsgId,
        owner: appState.user.username,
        isOpen: newConversation.showChatWindow,
      });
      setOldMsgId(mid);
	  sendingCount = 0;
      if (appState.user.username === message.from) {
        writeMessage(newConversation.username, message, (resp) => {
          //console.log('writing message status', resp)
        });
      }
    }
  }, [newMessage]);

  const rooms = useMemo(() => {
    let rm = [];
    if (appState.user.contacts) {
      for (let contact of appState.user.contacts) {
        rm.push(contact.chatId);
      }
    }
    return rm;
  }, [appState.user.contacts]);
  
  useEffect(() => {
    socket.on("connect", () => {
      console.log("client connected");
    });

    socket.on("connect_error", (err) => {
      console.log("client connection error", err);
    });
	
	let isOnlineInterval;
    if (appState.user.isLoggedIn) {
      if (socket.connected) {
        isOnlineInterval = setInterval(() => {
          socket.emit("is online", { username: appState.user.username });
        }, 10000);
      }
    }

    socket.on("is online", (user) => {
      setOnline({ online: true, username: user.username });
    });

    socket.on("my chat", (message) => {
		
	   if(oldMsgId !== message._id && sendingCount++ < 1) {
		  
		  setMessage({
			message,
			mid: message._id !== newMessage.mid ? message._id : newMessage.mid,
		});
	   }
    });

    

    socket.on("rooms", (myRooms) => {
      //console.log("joining rooms", myRooms);
    });

    //if (socket.connected) {
      // connect socket to rooms
      // console.log('my rooms', rooms);
      //socket.emit("rooms", rooms);
    //}

    socket.on("disconnect", () => {
      console.log("disconnected client");
    });

    return () => {
      console.log("unmounting...");
	  clearInterval(isOnlineInterval);
      // socket.disconnect();
    };
  }, [appState.user.isLoggedIn]);
  
  useEffect(() => {
	if (socket.connected) {
      // connect socket to rooms
      //console.log('my rooms', rooms);
      socket.emit("rooms", rooms);
	}
  }, [rooms, socket.connected]);


  // useEffect(() => {
  //   window.addEventListener('visibilitychange', visibleHandler);
  //   return () => window.removeEventListener('visibilitychange', visibleHandler);
  // }, []);
  
  useEffect( async() => {
	  const Peer = (await import('peerjs')).default;
	  const myPeer = new Peer(undefined, {
		  path: '/hey',
		  host: '/',
		  port: '3001',
		  debug: 3
	  });
	  myPeer.on('open', id => {
		  console.log('my peer opened');
		  // socket.emit('join-meet', {});
	  });
	  // declare video document
  }, []);

  if (loading) {
    return (
      <div className="main_spinner">
        <Spinner />;
      </div>
    );
  } else {
    return (
      <Layout>
        <div className="container">
          <Head>
            <title>Hey! Messenger</title>
            <meta name="description" content="Hey Messenger Chat Application" />
            <link id="favicon" rel="icon" href="/favicon.png" />
          </Head>

          <div className="main">
		  {appState.user.contacts.length > 0 ? 
			<>
				<ContactList contacts={contacts} dispatch={dispatch} />
				<ChatWindow
					contact={newConversation}
					owner={appState.user.username}
					dispatch={dispatch}
				/>

			</> :
			
			<div className="notice">
				<h4>You do not have any contacts in your contact list. To add contact, go to your profile page to get your <span>profile</span> link</h4>
			</div>
		  }
			
          </div>
        </div>
      </Layout>
    );
  }
}
