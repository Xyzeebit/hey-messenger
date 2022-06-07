import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/userSchema';
import Messages from '../../../models/messagesSchema';

export default async function handler(req, res) {

  dbConnect();

  const chatIds = req.body;

  var messages = {};
  for (let chatId of chatIds) {
    messages[chatId] = await Messages.findOne({ chatId }).select('messages');
  }

  res.json(messages);
}
