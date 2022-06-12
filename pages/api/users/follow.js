import User from '../../../models/userSchema';
import Messages from '../../../models/messagesSchema';
import dbConnect from '../../../lib/dbConnect';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {

  dbConnect();

  const { username, userToFollow } = req.body;
  
  const user = await User.findOne({ username });
  if(user) {
    const shouldFollow = await User.findOne({ username: userToFollow });
    if(shouldFollow) {
      let alreadExistingUser = false;
      for(let contact of user.contacts) {
        if(contact.contactUsername === shouldFollow.username) {
          alreadExistingUser = true;
        }
      }
      if(!alreadExistingUser) {
        const chatId = nanoid(15);
        const msg = {
          from: user.username,
          to: shouldFollow.username,
          text: 'Hello, how are you?'
        };
        let messages = new Messages({ chatId,  messages: [msg] });
        messages = await messages.save();
        // user to follow does not exit in contacts
        user.contacts.push({
          contactUsername: shouldFollow.username,
          lastSentMessage: '',
          unRead: 0,
          chatId
        });
        // user.messages = messages._id;
        const updatedUser = await user.save();

        shouldFollow.contacts.push({
          contactUsername: user.username,
          lastSentMessage: '',
          unRead: 0,
          chatId
        });
        // shouldFollow.messages = messages._id;
        const updatedFollow = await shouldFollow.save();

        if(updatedUser && updatedFollow && messages) {

          res.json({ successful: true });

        } else {
          res.json({ successful: false });
        }
      } else {
        // user already exist in contacts
        res.json({ successful: false, exist: true });
      }
    }
  }
  res.end();
}
