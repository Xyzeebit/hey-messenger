import CircleImage from './CircleImage';
import { useState, useReducer, useEffect, useContext } from 'react';
import StateContext from './StateContext';
import { fetchContacts } from '../lib/fetchUser';

export function Contact({ id, name, username, profilePhoto,
        lastSeen, lastSent, isOnline,
        notifications, messages, dispatch }) {

  const [h,m] = new Date(lastSeen).toTimeString().split(':');
  const handleStartChat = () => {
    // console.log('starting conversation', messages, 'with ' + username)
    const chatId = messages.chatId;
    dispatch({ type: 'START_CHAT',
      contact: { name, chatId, username, id, profilePhoto,
        messages: messages.messages }, showChatWindow: true });
    dispatch({ type: 'CLEAR_NOTIFICATIONS', username });
  }

  return (
    <div className="contact"
      onClick={handleStartChat}
    >
        <CircleImage image={profilePhoto} isOnline={isOnline} />
        <div className="contact__name--message">
          <span>{name}</span>
          <span>{lastSent}</span>
        </div>
        <div className="time__count">
          <span>{`${h}:${m}`}</span>
          {notifications > 0 && notifications < 10 ?
            <span className="badge">{notifications}</span> : (notifications > 10) &&
            <span className="badge">9+</span>
          }
        </div>
    </div>
  );
}

export const ContactList = ({ contacts, dispatch }) => {
  const [appState] = useContext(StateContext);
  useEffect(() => {
    if(appState.user.isLoggedIn) {
      if(appState.user.contacts) {
        fetchContacts(appState.user.contacts, (_user) => {
          dispatch({ type: 'ADD_CONTACT', contact: _user });
        });
      }
    }
  }, [appState.user.contacts]);

  // console.log('finding user contacts', contacts);

  return (
    <div className="contact__list">
      { contacts &&
        contacts.map((contact, i) => (
          <div key={contact.id}>
            <Contact {...contact} dispatch={dispatch} />
            {i < contacts.length - 1 &&
              <div className="contact__divider">
                <div className="contact__divider--left"/>
                <div className="contact__divider--right"/>
              </div>
            }
          </div>
        ))
      }
    </div>
  );
}
