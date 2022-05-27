import { useState, useReducer, useRef, useEffect, useContext } from 'react';
import io from 'socket.io-client';

let chatRef;

export default function ChatWindow ({ contact, messages, owner, dispatch }) {
  const { name, chatId, username, id, profilePhoto, showChatWindow } = contact;
  const contactMessages = messages[chatId];

  return (
    <div className="chat__window"
      style={{transform: `translateX(${showChatWindow ? 0 : '100vw'})`}}
    >
      { id &&
        <>
          <ChatBar name={name} photo={profilePhoto}
            showChatWindow={showChatWindow} dispatch={dispatch} />
          <Chats chats={contactMessages.messages} owner={owner} />
          <InputBar chatId={chatId} from={owner} sendTo={username} dispatch={dispatch} />
        </>
      }
    </div>
  );
}

const ChatBar = ({ name, photo, showChatWindow, dispatch }) => {
  const handleCloseChat = () => {
    dispatch({ type: 'CLOSE_CHAT_WINDOW', showChatWindow: false });
  }
  return (
    <div className="chat__bar">
      <div className="chat__bar--left">
        <button className="go__back" onClick={handleCloseChat}>
          <img
            src="/right-arrow.svg"
            alt="go back"
            width="30"
            height="30"
            className="icon__back"
          />
        </button>

        <img
          src={`/${photo}`}
          alt={name}
          width="60"
          height="60"
          className="profile__photo"
        />
        <span>{name}</span>
      </div>

      <div className="chat__bar--right"></div>
    </div>
  );
}

const InputBar = ({ chatId, from, sendTo, dispatch }) => {
  const [chatInputValue, setChatInputValue] = useState('');
  const inputRef = useRef();
  // const socket = useContext(SocketContext);
  const socket = io();

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

    socket.emit('my-chat', chatInputValue);

    setChatInputValue('');


    if(chatRef) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }

  const handleEmojiToggler = evt => {
    // toggle emoji [window + .]
  }


  return (
    <div className="input__bar">
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
  );
}


const Chats = ({ chats, owner }) => {
  chatRef = useRef();
  return (
    <div className="chats" ref={chatRef}>
      {chats.length > 0 && chats.map(chat => {
        return <Message key={chat._id} message={chat.text}
        sender={chat.from} owner={owner}/>
      })}
    </div>
  );
}

function Message({ message, sender, owner }) {
  return (
    <div className="message">
      <ChatBubble message={message} self={sender === owner} />
    </div>
  );
}

function ChatBubble({ message, self }) {
  return <span className={`bubble ${self ? 'in' : 'out'}`}>{message}</span>
}
