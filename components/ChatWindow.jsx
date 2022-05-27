import { useState, useReducer, useRef, useEffect, useContext } from 'react';
import io from 'socket.io-client';

let chatRef;

export default function ChatWindow ({ contact, dispatch }) {
  const { name, chatId, messages, id, profilePhoto, showChatWindow } = contact

  return (
    <div className="chat__window"
      style={{transform: `translateX(${showChatWindow ? 0 : '100vw'})`}}
    >
      { id &&
        <>
          <ChatBar name={name} photo={profilePhoto}
            showChatWindow={showChatWindow} dispatch={dispatch} />
          <Chats chats={messages} />
          <InputBar id={id} dispatch={dispatch} />
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

const InputBar = ({ id, dispatch }) => {
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
    dispatch({ type: 'SEND_MESSAGE', message: chatInputValue, sender: 'owner', _id: id });
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


const Chats = ({ chats }) => {
  chatRef = useRef();
  return (
    <div className="chats" ref={chatRef}>
      {chats.length > 0 && chats.map(chat => {
        return <Message key={chat._id} message={chat.text} sender={chat.from} />
      })}
    </div>
  );
}

function Message({ message, sender }) {
  return (
    <div className="message">
      <ChatBubble message={message} sender={sender} />
    </div>
  );
}

function ChatBubble({ message, sender }) {
  return <span className={`bubble ${sender === 'owner' ? 'in' : 'out'}`}>{message}</span>
}
