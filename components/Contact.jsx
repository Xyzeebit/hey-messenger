import CircleImage from './CircleImage';
import { useState, useReducer, useEffect, useContext } from 'react';
import StateContext from './StateContext';
import { fetchContacts } from '../lib/fetchUser';

export function Contact({ id, name, username, profilePhoto,
        lastSeen, lastSent, isOnline,
        notifications, messages, dispatch }) {

  const [h,m] = new Date(lastSeen).toTimeString().split(':');
  const handleStartChat = () => {
    const chatId = messages.chatId;
    dispatch({ type: 'START_CHAT',
      contact: { name, chatId, username, messages, id, profilePhoto, },
      showChatWindow: true });
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
          {notifications > 0 && <span className="badge">{notifications}</span>}
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
          dispatch({ type: 'UPDATE_CHATS', messages: _user.messages, chatId: _user.messages.chatId });
        });
      }
    }
  }, [appState.user.contacts]);

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
