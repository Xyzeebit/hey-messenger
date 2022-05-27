import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/userSchema';
import Messages from '../../../models/messagesSchema';

export default async function handler(req, res) {

  await dbConnect();

  const { slug } = req.query;
  const { minimal } = req.body;


  if(minimal) {
    console.log('minimal')
    const user = await User.findOne({ username: slug })
      .populate('messages', 'messages chatId')
      .exec();
    if(user) {
      const notifications = getNotifications(user.messages);
      const lastSent = getLastSent(user.messages);
      const _user = {
        id: user._id,
        name: user.name,
        username: user.username,
        profilePhoto: user.profilePhoto,
        lastSeen: user.lastSeen,
        lastSent,
        isOnline: user.isOnline,
        messages: user.messages,
        notifications,
      }
      res.json(_user);
    } else {
      res.status(400).json({ isLoggedIn: false, successful: false });
    }

  } else {
    const user = await User.findOne({ username: slug });
    if(user) {

      const _user = {
        id: user._id,
        name: user.name,
        username: user.username,
        isLoggedIn: true,
        profilePhoto: user.profilePhoto,
        email: user.email,
        link: user.link,
        chatId: user.chatId,
        contacts: user.contacts
      }
      res.json(_user);
    } else {
      res.status(400).json({ isLoggedIn: false, successful: false });
    }
  }
}

function getNotifications(messages) {
  let count = 0;
  if(messages.length > 0) {
    for (var msg of messages) {
      if(!msg.read) {
        count++;
      }
    }
  }
  return count;
}

function getLastSent(messages) {
  if(messages.length > 0) {
    const idx = messages.length - 1;
    const last = messages[idx].text;
    return last;
  }
  return '';
}
