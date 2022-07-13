import CircleImage from './CircleImage';
import { useState, useReducer, useEffect, useContext } from 'react';
import StateContext from './StateContext';
import { fetchContacts } from '../lib/fetchUser';
import { readMessages } from '../lib/read-messages';

export function Contact({ id, name, username, profilePhoto,
        lastSeen, lastSent, isOnline,
        notifications, chatId, messages, dispatch }) {

  const [h,m] = new Date(lastSeen).toTimeString().split(':');
  const handleStartChat = () => {

    dispatch({
      type: 'START_CHAT',
      contact: { name, chatId, username, id, profilePhoto, messages },
      showChatWindow: true
    });
    dispatch({ type: 'CLEAR_NOTIFICATIONS', username });
  }

  return (
    <div className="contact"
      onClick={handleStartChat}
	  aria-label={`username ${username}`}
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

const CallContact = ({ caller, type }) => {
	const rejectCall = () => {}
	const answerCall = () => {}
	return (
		<article className="contact">
			<button onClick={rejectCall}>
				<img 
					src="/icon-call.svg"
					alt="reject call call icon"
					width="30"
					height="30"
				/>
			</button>
			<p>{type} call from <span>{caller}</span></p>
			<button onClick={answerCall}>
				<img 
					src="/icon-call.svg"
					alt="reject call call icon"
					width="30"
					height="30"
				/>
			</button>
			<img 
			/>
		</article>
	);
}

export const ContactList = ({ contacts, dispatch, incoming }) => {
  const [appState] = useContext(StateContext);
  //console.log('ContactList:', incoming)
  useEffect(() => {
    if(appState.user.isLoggedIn) {
      if(appState.user.contacts) {
        fetchContacts(appState.user.contacts, (_user) => {
          dispatch({ type: 'ADD_CONTACT', contact: _user });
        });
      }
    }
  }, [appState.user.isLoggedIn, appState.user.contacts, dispatch]);

  useEffect(() => {
    if(appState.user.isLoggedIn) {
      if(appState.user.contacts) {
        const chatIds = appState.user.contacts.map(c => c.chatId);
        readMessages(chatIds, messages => {
          // console.log(messages);
          dispatch({ type: 'DB_MESSAGES', contacts: appState.user.contacts, messages });
        });
      }
    }
  }, [appState.user.isLoggedIn, appState.user.contacts, dispatch]);

  // console.log('finding user contacts', contacts);

  return (
    <div className="contact__list" aria-label="My contact list">
      { contacts &&
        contacts.map((contact, i) => (
          <div key={contact.id} aria-label={contact.name}>
			{incoming.call && contact.username === incoming.caller ? 
				<CallContact caller={contact.name} type={incoming.type} /> :
				<Contact {...contact} dispatch={dispatch} />
			}
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
