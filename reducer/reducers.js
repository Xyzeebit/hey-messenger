// import io from 'socket.io-client';
// const socket = io();
import { socket } from '../lib/init-socket';
import { nanoid } from 'nanoid';

export const initialState = {
  contacts: [],
  user: {
    name: 'John Doe',
    profilePhoto: '/avatar.png',
    contacts: [
      {
        _id: 'ui3oiw7sn',
        name: 'Amelia Nelson',
        photo: '/avatar.png',
        isOnline: true,
        lastSentMessage: 'Hello, how are you?',
        lastConversionTime: (new Date().getTime()),
        notications: 16
      },
      {
        _id: 'uio3iw7sn',
        name: 'Jane Doe',
        photo: '/avatar.png',
        isOnline: false,
        lastSentMessage: 'Hello, how are you?',
        lastConversionTime: (new Date().getTime()),
        notications: 1
      },
      {
        _id: 'uidoiw7sn',
        name: 'Nicolas Plum',
        photo: '/avatar.png',
        isOnline: true,
        lastSentMessage: 'Hello, how are you?',
        lastConversionTime: (new Date().getTime()),
        notications: 7
      },
      {
        _id: 'uioiw97sn',
        name: 'Jessie Match',
        photo: '/avatar.png',
        isOnline: true,
        lastSentMessage: 'Hello, how are you? I want to find out if you got my message',
        lastConversionTime: (new Date().getTime()),
        notications: 0
      },
      {
        _id: 'uio09iw7sn',
        name: 'Chies Lie',
        photo: '/avatar.png',
        isOnline: false,
        lastSentMessage: 'Hello, how are you?',
        lastConversionTime: (new Date().getTime()),
        notications: 4
      },
      {
        _id: 'y9899p0msi',
        name: 'Bill Peters',
        photo: '/avatar.png',
        lastConversionTime: (new Date().getTime()),
        lastSentMessage: 'Hello, how are you?',
        isOnline: true,
        notications: 4
      }
    ]
  },
  chats: {

  },
  newConversation: {
    name: '',
    username: '',
    profilePhoto: '',
    messages: [],
    showChatWindow: false
  },
  active: 'home'
};

function contactsReducer(state, action) {
  var contact, index;
  switch (action.type) {
    case 'ADD_CONTACT':
      const found = state.find(c => c.username === action.contact.username);
      if(found) {
        return state;
      }
      // console.log(action.contact)
      return [...state, action.contact ];
    case 'GET_CONTACT':
      contact = state.find(c => c.username === action.username);
      return contact;

    case 'SEND_MESSAGE':
      // contact = state.find(c => c.username === action.username);
      let time = new Date().getTime();
      const newMsg = {
        _id: nanoid(20),
        from: action.message.from,
        to: action.message.to,
        text: action.message.text,
        time,
        chatId: action.chatId
      };
      console.log('reducer socket id', socket.id);
      socket.emit('my-chat', newMsg);
      return state;

    case 'ADD_MESSAGE':
      if(action.owner === action.message.from || action.owner === action.message.to) {
        if(action.message.from !== action.message.to) {
          contact = state.find(c => c.username === action.message.to);
          let sender = state.find(c => c.username === action.message.from);

          if(contact) {
            index = state.indexOf(contact);
            contact.messages.messages.push(action.message);
            state[index] = contact;
          }
          if(sender) {
            index = state.indexOf(sender);
            sender.messages.messages.push(action.message);
            state[index] = sender;
          }
        }
      }

      return state;

    case 'UPDATE_CHATS':

      state[action.chatId] = action.messages;
      return state;


    default: return state;
  }
}

// function chatReducer(state, action) {
  // switch (action.type) {
  //   case 'SEND_MESSAGE':
  //     let time = new Date().getTime();
  //     const newMsg = {
  //       _id: time,
  //       from: action.message.from,
  //       to: action.message.to,
  //       text: action.message.text,
  //       time,
  //       chatId: action.chatId
  //     }
  //     console.log('reducer socket id', socket.id);
  //     socket.emit(socket.id, newMsg);
  //
  //     return state;
  //
  //   case 'ADD_MESSAGE':
  //   // console.log('adding message before state', state)
  //     if(state[action.chatId]) {
  //       // console.log('about to add message...')
  //       state[action.chatId].messages.push(action.message);
  //       // console.log('message added: ', state[action.chatId].messages)
  //     }
  //     // console.log('message added: ', state)
  //     return state;
  //   case 'UPDATE_CHATS':
  //     state[action.chatId] = action.messages;
  //     return state;
  //
  //   default: return state;
  // }
// }

function userReducer(state, action) {
  switch (action.type) {
    case 'USER':
      return state.user;

    default: return state;
  }
}

function newConversationReducer(state, action) {
  switch (action.type) {
    case 'START_CHAT':
      return {...action.contact, showChatWindow: action.showChatWindow };
    case 'SHOW_CHAT_WINDOW': return { ...state, showChatWindow: action.showChatWindow }
    case 'CLOSE_CHAT_WINDOW': return { ...state, showChatWindow: action.showChatWindow }

      break;
    default: return state;

  }
}

function activeLinkReducer(state, action) {
  switch (action.type) {
    case 'SELECTED':
      return action.selected
    default: return state;

  }
}


export function appReducer(state, action) {
  return {
    user: userReducer(state.user, action),
    // chats: chatReducer(state.chats, action),
    newConversation: newConversationReducer(state.newConversation, action),
    active: activeLinkReducer(state.active, action),
    contacts: contactsReducer(state.contacts, action)
  }
}
