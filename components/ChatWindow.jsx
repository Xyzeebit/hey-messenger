import { useState, useReducer, useRef, useEffect, useContext, memo } from 'react';
// import dynamic from 'next/dynamic'
// const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false })
// import Picker from 'emoji-picker-react';

let chatRef;
const TEXT = 0, VIDEO = 1, AUDIO = 2;


export default function ChatWindow ({ contact, owner, dispatch }) {
  const [mediaType, setMediaType] = useState(TEXT);
  const { name, chatId, username, id, profilePhoto, messages, showChatWindow } = contact;

  return (
    <div className="chat__window"
      style={{transform: `translateX(${showChatWindow ? 0 : '110vw'})`}}
    >
      { id &&
        <>
          <ChatBar name={name} photo={profilePhoto} setMediaType={setMediaType}
            showChatWindow={showChatWindow} dispatch={dispatch} />
          <div className="chats__container">
            {mediaType === TEXT ?
				<>
					<Chats chats={messages} owner={owner} />
					<InputBar chatId={chatId} from={owner} sendTo={username} dispatch={dispatch} />
				</>
				: (mediaType === VIDEO) ?
					<Video setMediaType={setMediaType} />
				:	<Audio setMediaType={setMediaType} />
			}
          </div>
        </>
      }
    </div>
  );
}

const ChatBar = ({ name, photo, setMediaType, showChatWindow, dispatch }) => {
  const handleCloseChat = () => {
	setMediaType(TEXT);
    dispatch({ type: 'CLOSE_CHAT_WINDOW', showChatWindow: false });
  }
  const handleAudioCall = () => {
	  console.log('audio calls');
	  setMediaType(AUDIO);
  }
  const handleVideoCall = () => {
	  console.log('video calls');
	  setMediaType(VIDEO);
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
        <button className="bar__button" onClick={handleAudioCall}>
          <img
            src="/icon-call.svg"
            alt="go back"
            width="30"
            height="30"
            className="bar__icon icon__call"
          />
        </button>
        <button className="bar__button" onClick={handleVideoCall}>
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
          disabled={chatInputValue.length < 1 && true}
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

function Video({ setMediaType }) {
	const handleEndVideoCall = () => {
		setMediaType(TEXT);
	}
	return(
		<div className="video_call__container">
			<video id="main-video" controls>
				<source src="/movie.mp4" type="video/mp4" />
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
			</div>
		</div>
	);
}

function Audio({ setMediaType }) {
	const handleEndAudioCall = () => {
		setMediaType(TEXT);
	}
	return (
		<div className="audio_call__container">
			<h1>Audio call</h1>
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
