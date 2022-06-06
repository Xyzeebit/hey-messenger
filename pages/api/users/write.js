import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/userSchema';
import Messages from '../../../models/messagesSchema';

export default async function handler(req, res) {

  dbConnect();

  const message = req.body;
  console.log('writing to...', message.chatId)

  const messages = await Messages.findOne({ chatId: message.chatId }).select('messages').exec();
  if(messages) {
    // console.log(messages)
    const { text, time, from, to, _id, read } = message;
    messages.messages.push({
      msgId: _id,
      from,
      to,
      time,
      text,
      read
    });
    await messages.save();
    res.json(messages);
  }

  res.end();
}
