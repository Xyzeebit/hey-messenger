import { socket } from '../lib/socket';
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
      if(socket.connected) {
        // console.log('reducer connected');
        socket.emit("my chat", newMsg);
      }
      return state;

    case 'ADD_MESSAGE':
	  if(action.oldMsgId === action.message._id) return state;
      if(action.owner === action.message.from || action.owner === action.message.to) {
        if(action.message.from !== action.message.to) {
          contact = state.find(c => c.username === action.message.to);
          let sender = state.find(c => c.username === action.message.from);
		
          if(contact) {
            // index = state.indexOf(contact);
			if(!inMessages(contact.messages, action.message._id)) {
				contact.messages.push(action.message);
				contact.lastSent = action.message.text;
			}
          }
          if(sender) {
            // index = state.indexOf(sender);
			if(!inMessages(sender.messages, action.message._id)) {
				sender.messages.push(action.message);
				if(action.isOpen) {
					sender.notifications = 0
				} else {
					sender.notifications++;
				}
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

    case 'DB_MESSAGES':
      for(let ct of action.contacts) {
        contact = state.find(c => c.username === ct.contactUsername);
        if(contact && !contact.messages) {
          contact.messages = action.messages[ct.chatId].messages;
          contact.chatId = ct.chatId;

          let lastMsg = '';
          let msgs = action.messages[ct.chatId].messages;

          for(let i = msgs.length - 1; i > 0; i--) {
            if(msgs[i].from !== contact.username) {
              lastMsg = msgs[i].text;
              break;
            }
          }
          contact.lastSent = lastMsg;
          // console.log(contact)
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

function inMessages(messages, id) {
	const msg = messages.find(m => m._id === id);
	if(msg) return true;
	return false;
}
