import { useState, useReducer, useRef, useEffect, useContext, memo, useMemo, useCallback } from 'react';
//import { makeVideoCall, makeAudioCall } from '../lib/media';
import StateContext from "../components/StateContext";
// import dynamic from 'next/dynamic'
// const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false })
// import Picker from 'emoji-picker-react';

let chatRef;
const TEXT = 0, VIDEO = 1, AUDIO = 2;
let cameraStream = null;
let mediaRecorder = null;
let blobsRecorded = [];
let audioStream = null;


export default function ChatWindow ({ contact, owner, incoming, dispatch }) {
  const [mediaType, setMediaType] = useState(TEXT);
  const { name, chatId, username, id, profilePhoto, messages, showChatWindow, onCall } = contact;
  
  useEffect(() => {
	  try {
		const peer = window.peer;
		const conn = peer.connect(username);
		conn.on('connection', connection => {
			console.log('users connected')
			window.conn = connection;
		}).on('error', error => {
			console.log(error.message);
		}).on('open', () => {
			conn.send('hi')
		})
	  } catch(e) {
		  console.log(e.message)
	  }
	  return () => conn = null;
  }, [])

  return (
    <div className="chat__window"
      style={{transform: `translateX(${showChatWindow ? 0 : '110vw'})`}}
    >
      { id &&
        <>
          <ChatBar name={name} photo={profilePhoto} setMediaType={setMediaType}
            showChatWindow={showChatWindow} onCall={onCall} dispatch={dispatch} />
          <div className="chats__container">
            {mediaType === TEXT ?
				<>
					<Chats chats={messages} owner={owner} />
					<InputBar chatId={chatId} from={owner} sendTo={username} dispatch={dispatch} />
				</>
				: (mediaType === VIDEO) ?
					<Video callId={username} setMediaType={setMediaType} incoming={incoming} dispatch={dispatch} />
				:	<Audio callId={username} setMediaType={setMediaType} photo={profilePhoto} dispatch={dispatch} />
			}
          </div>
        </>
      }
    </div>
  );
}

const ChatBar = ({ name, photo, setMediaType, showChatWindow, onCall, dispatch }) => {
  const handleCloseChat = () => {
	setMediaType(TEXT);
	if(cameraStream) {
		
		if(cameraStream.state == 'recording') {
			cameraStream.stop();
		}
		cameraStream.getTracks().forEach(track => track.stop());
	}
    dispatch({ type: 'CLOSE_CHAT_WINDOW', showChatWindow: false });
  }
  const handleAudioCall = () => {
	  console.log('audio calls');
	  setMediaType(AUDIO);
	  dispatch({ type: 'ON_CALL', onCall: true });
	  //dispatch({ 'INCOMING': false });
  }
  const handleVideoCall = () => {
	  console.log('video calls');
	  setMediaType(VIDEO);
	  dispatch({ type: 'ON_CALL', onCall: true });
	  //dispatch({ 'INCOMING': false });
  }
  
  return (
    <div className="chat__bar">
      <div className="chat__bar--left">
        <button className="go__back bar__button" onClick={handleCloseChat}>
          <img
            src="/right-arrow.svg"
            alt="go back"
            width="30"
            height="30"
            className="icon__back bar__icon"
          />
        </button>

        <img
          src={`/uploads/${photo}`}
          alt={name}
          width="60"
          height="60"
          className="profile__photo"
        />
        <span>{name}</span>
      </div>

      {<div className="chat__bar--right">
        <button className="bar__button" onClick={handleAudioCall} disabled={onCall}>
          <img
            src="/icon-call.svg"
            alt="go back"
            width="30"
            height="30"
            className="bar__icon icon__call"
          />
        </button>
        <button className="bar__button" onClick={handleVideoCall} disabled={onCall}>
          <img
            src="/icon-video.svg"
            alt="go back"
            width="30"
            height="30"
            className="bar__icon icon__video"
          />
        </button>
      </div>}
    </div>
  );
}

const InputBar = ({ chatId, from, sendTo, dispatch }) => {
  const [chatInputValue, setChatInputValue] = useState('');
  const [emoji, setEmoji] = useState({ visible: false, emoji: null });
  const inputRef = useRef();


  const handleChatInput = ({ target }) => {
    setChatInputValue(target.value);
    inputRef.current.style.height = '1px';
    inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
  }

  const handleSendMessage = evt => {
	
    const message = {
      from,
      to: sendTo,
      text: chatInputValue,
      chatId,
      read: false
    }
    dispatch({ type: 'SEND_MESSAGE', message, chatId });
    inputRef.current.style.height = '1px';

    setChatInputValue('');
    setEmoji({ visible: false, emoji: null })

    if(chatRef) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }

  const handleEmojiClick = (evt, _emoji) => {
     // setEmoji({ emoji: _emoji.emoji, ...emoji });
     setChatInputValue(chatInputValue + ' ' + _emoji.emoji)
  }
  const handleEmojiToggler = (evt, _emoji) => {
     setEmoji({ ...emoji, visible: !emoji.visible })
  }


  return (
    <div className="input__bar">
      <div className="input__bar--container">
        <label htmlFor="chat-input" className="input__group">

          <button className="icon__emoji" onClick={handleEmojiToggler}>
            <img
              src="/icon-emoji.svg"
              alt="Send message"
              width="25"
              height="25"
            />
          </button>
          <textarea
            ref={inputRef}
            rows="1"
            id="chat-input"
            className="chat__input--box"
            placeholder="Type a message"
            value={chatInputValue}
            onChange={handleChatInput}
          />
        </label>
        <button className="send__message--button"
          onClick={handleSendMessage}
          disabled={!chatInputValue}
        >
          <img
            src="/icon-send.svg"
            alt="Send message"
            width="30"
            height="30"
          />
        </button>
      </div>
      {/* <div className="emoji__panel" style={{ display: `${(emoji.visible) ? 'block' : 'none' }`}}>
        <Picker onEmojiClick={handleEmojiClick} />
      </div> */}
    </div>
  );
}


const Chats = ({ chats, owner }) => {
  chatRef = useRef();
  if(chatRef) {
      try {
		  chatRef.current.scrollTop = chatRef.current.scrollHeight;
	  } catch(e) {}
  }
  return (
    <div className="chats" ref={chatRef}>
      {chats.length > 0 && chats.map(chat => {
        return <Message key={chat._id} message={chat.text} time={chat.time}
        sender={chat.from} owner={owner}/>
      })}
    </div>
  );
}

function Message({ message, time, sender, owner }) {
  const sent = new Date(time).toLocaleString('en-US', {hour: 'numeric', minute: 'numeric'});
  return (
    <div className="message">
      <ChatBubble message={message} time={sent} self={sender === owner} />
    </div>
  );
}

function ChatBubble({ message, time, self }) {
  return <span className={`bubble ${self ? 'in' : 'out'}`}>{message}
  <span className="message__time">{time}</span></span>
}

function Video({ setMediaType, dispatch, incoming, callId /* stream */ }) {
	const [appState, setAppSate] = useContext(StateContext);
	const [answered, setAnswered] = useState(false);
	const [connection, setConnection] = useState(null);
	let video, subVideo;
	
	const handleEndVideoCall = () => {
		try {
			//cameraStream.stop();
			cameraStream.getTracks().forEach(track => track.stop());
			connection.close();
		} catch(e) {
			console.log(e.message);
		}
		//clearTimeout(callTimeout);
		setMediaType(TEXT);
		dispatch({ type: 'ON_CALL', onCall: false });
	}
	
	const dataAvailable = evt => blobsRecorded.push(evt.data);
	
	/*const callTimeout = setTimeout(() => {
		setAnswered(true);
	}, 10000);*/
	
	
	
	
	useEffect(() => {
		//const getUserMedia = navigator.mediaDevices.getUserMedia || 
				//navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia;
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			video = document.getElementById('main-video');
			subVideo = document.getElementById('sub-video');
			cameraStream = stream;
			//console.log('incoming...', window.incoming);
			subVideo.srcObject = stream;
			
			const peer = window.peer;
			if(peer !== null) {
				if(window.conn){
					const call = window.call;
					call.answer(stream);
					setAnswered(true);
					call.on('stream', remoteStream => {
						video.srcObject = remoteStream;
					});
					call.on('close', () => {
						handleEndVideoCall();
					});
				} else {
					try {
						conn = peer.connect(callId);
						conn.on('connection', connection => {
							setConnection(connection);
						})
						
						const call = peer.call(callId, cameraStream);
						
						call.on('stream', function(remoteStream) {
							setAnswered(true);
							// show stream in video
							video.srcObject = remoteStream;
							video.autoplay = true;
						}).on('close', function() {
							handleEndVideoCall();
						});
					} catch(e) {
		  
					}
				}
			}
		}).catch(e => {
			console.log(e.message)
		});
		
		
		return () => {
			//removeEventListener('dataavailable', dataAvailable);
			//removeEventListener('stop', handleEndVideoCall);
			//cameraStream = null;
			//mediaRecorder = null;
			//blobsRecorded = [];
		}
	}, [incoming]);
	
	useEffect(() => {
		if(answered) {
			document.getElementById('sub-video').classList.add('sub_video__resized');
			document.getElementById('main-video').muted = false;
		}
	}, [answered]);
	
	return(
		<div className="video_call__container">
			<video id="main-video" autoPlay muted>
                your browser does not support the video tag
			</video>
			<video id="sub-video" autoPlay muted>
                your browser does not support the video tag
			</video>
			<div className="call_end__container">
				<button onClick={handleEndVideoCall}>
					<img 
						src="/icon-end-call.svg"
						alt=""
						width="50"
						height="50"
					/>
				</button>
				{answered && <Timer /> }
			</div>
		</div>
	);
}

const Timer = () => {
	let sec = 0, mm = 0, hr = 0;
	useEffect(() => {
		let p = document.getElementById('time-counter')
		const timer = setInterval(() => {
			if(sec < 59) {
				sec++
			} else {
				sec = 0;
				if(mm < 59) {
					mm++;
				} else {
					mm = 0
					hr++;
				}
			}
			p.innerText = `${hr < 10 ? '0' + hr : hr}:${mm < 10 ? '0' + mm : mm}:${sec < 10 ? '0' + sec : sec}`
		
		}, 1000);
		
		return () => clearInterval(timer);
	}, [sec]);
	
	return <p id="time-counter">00:00:00</p>
};

function Audio({ callId, setMediaType, photo, dispatch }) {
	let audio;
	
	const handleEndAudioCall = () => {
		if(audioStream.state == 'recording') {
			audioStream.stop();
		}
		audioStream.getTracks().forEach(track => track.stop());
		setMediaType(TEXT);
		dispatch({ type: 'ON_CALL', onCall: false });
	}
	
	const dataAvailable = evt => blobsRecorded.push(evt.data);
	
	useEffect(async () => {
		if(navigator.mediaDevices && window !== undefined) {
			audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(audioStream);
			mediaRecorder.addEventListener('dataavailable', dataAvailable);
			mediaRecorder.addEventListener('stop', handleEndAudioCall);
			mediaRecorder.start();
			audio = document.getElementById('audio');
			try {
				audio.srcObject = audioStream;
				audio.play();
			} catch(e) {
				console.log(e.message);
			}
			
		}
		return () => {
			removeEventListener('dataavailable', dataAvailable);
			removeEventListener('stop', handleEndAudioCall);
			audioStream = null;
			mediaRecorder = null;
			blobsRecorded = [];
		}
	}, []);
	return (
		<div className="audio_call__container">
			<h1>Voice call</h1>
			<audio id="audio" />
			<article>
				<img 
					src={`uploads/${photo}`}
					alt=""
					width="150"
					height="150"
				/>
			</article>
			<Timer />
			<div className="call_end__container">
				<button onClick={handleEndAudioCall}>
					<img 
						src="/icon-end-call.svg"
						alt=""
						width="50"
						height="50"
					/>
				</button>
			</div>
		</div>
	);
}
