import User from '../models/userSchema';
// import Messages from '../models/messagesSchema';

export const generateID = () => {
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
}

const users = new Map();

const usersNames = ['John Doe', 'Jessie Match', 'Jane Doe', 'Nicolas Plum',
  'Jessie Match', 'Chies Lie', 'Bill Peters'
]



const addUsers = () => {
  for(let name of usersNames) {
    addNewUser(name);
  }
}
addUsers();

export function getUsers() {
  const usrs = [];
  users.forEach((user) => {
    usrs.push(user);
  });

  return usrs;
}

export function hasUserWithId(userId) {
  return users.has(userId);
}

export function getUserWithId(userId) {
  if(users.has(userId)) {
    return users.get(userId);
  }
  return -1;
}

export function addNewUser(name) {
  if(name) {
    const id = generateID();
    users.set(id, {
      id,
      name,
      isOnline: false,
      lastSeen: '09:25',
      profilePhoto: 'avatar.png',
      contacts: new Map() // { id: 'xh238_ju', messages: [], unRead: 0, msgCount }
    });
  }
}

export function addContactToUser(userId, contactId) {
  if(userId) {
    const message = {
      id: generateID(),
      read: false,
      text: "Hey! how are you?",
      time: new Date().getTime(),
      from: userId
    }
    const userExist = hasUserWithId(userId);
    const contactExist = hasUserWithId(contactId);
    if(userExist && contactExist) {
      users.get(userId).contacts.set(contactId,
        {
          id: contactId, messages: [ message ],
          unRead: 1,
          msgCount: 1
        });
    }
  }
}

export function countUnReadMessages(userId, contactId) {
  let count = 0;
  const contact = getUserWithId(userId).contacts.get(contactId);
  for(let i of contact.messages) {
    if(!i.read) {
      count++;
    }
  }
  getUserWithId(userId).contacts.get(contactId).unRead = count;
}

export function countMessages(userId, contactId) {
  let count = 0;
  const contact = getUserWithId(userId).contacts.get(contactId);
  for(let i of contact.messages) {
    count++;
  }
  getUserWithId(userId).contacts.get(contactId).msgCount = count;
}

export function markAsRead(messages) {
  for(let msg of messages) {
    msg.read = true;
  }
}

export function getLastSeen(userId) {
  if(hasUserWithId(userId)) {
    return getUserWithId(userId).lastSeen;
  }
  return '';
}

export function getLastMessage(userId, contactId) {
  if(hasUserWithId(userId) && hasUserWithId(contactId)) {
    const msgsCount = getUserWithId(userId).contacts.get(contactId).msgCount;
    return getUserWithId(userId).contacts.get(contactId).messages[msgsCount - 1];
  }
  return '';
}

export function getMessages(userId, contactId) {
  if(hasUserWithId(userId) && hasUserWithId(contactId)) {
    const messages = getUserWithId(userId).contacts.get(contactId).messages;
    getUserIdWithId(from).contacts.get(to).unRead = 0;
    markAsRead(messages);
    return messages;
  }
}

export function sendMessage(from, to, message) {
  const {id, text, time, read } = message;
  if(from && to && message) {
    getUserIdWithId(from).contacts.get(to).messages.push({ id, from, text, time, read });
    countUnReadMessages(from, to);
    // update lastSeen
    getUserIdWithId(from).lastSeen = time;
    countMessages(from, to);
  }
}


export async function getUser(userId) {
  const user = await User.findById(userId);
  return user;
}

export async function createUser(data) {
  const user = await User.create(data);
  if(user) {
    return user;
  }
  return -1;
}

export async function updateUser(data) {
  const user = await User.findAndUpdateById(data);
}
