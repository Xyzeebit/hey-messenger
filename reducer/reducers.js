import { socket } from '../lib/init-socket';
import { nanoid } from 'nanoid';

export const initialState = {
  contacts: [],
  newConversation: {
    name: '',
    username: '',
    profilePhoto: '',
    messages: [],
    showChatWindow: false
  },
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

      let time = new Date().getTime();
      const newMsg = {
        _id: nanoid(20),
        from: action.message.from,
        to: action.message.to,
        text: action.message.text,
        time,
        chatId: action.chatId,
        read: false
      };
      // console.log('sending message to ', socket.id);
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
            contact.lastSent = action.message.text;
            state[index] = contact;
          }
          if(sender) {
            // index = state.indexOf(sender);
            sender.messages.messages.push(action.message);
            if(action.isOpen) {
              sender.notifications = 0
            } else {
              sender.notifications++;
            }
            // state[index] = sender;
          }
        }
      }

      return state;

    case 'UPDATE_CHATS':

      state[action.chatId] = action.messages;
      return state;

    case 'CLEAR_NOTIFICATIONS':
      contact = state.find(c => c.username === action.username);
      if(contact) {
        contact.notifications = 0;
      }
      return state;

    case 'USERS_ONLINE':
      if(action.username) {
        contact = state.find(u => u.username === action.username);
        if(contact) {
          contact.isOnline = true;
        }
      }
      return state;

    default: return state;
  }
}

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


export function appReducer(state, action) {
  return {
    user: userReducer(state.user, action),
    newConversation: newConversationReducer(state.newConversation, action),
    contacts: contactsReducer(state.contacts, action)
  }
}
