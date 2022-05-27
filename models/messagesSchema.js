import mongoose from 'mongoose';

const chatSchema = mongoose.Schema({
  from: {
    type: String,
  },
  to: {
    type: String
  },
  text: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now()
  },
  read: {
    type: Boolean,
    default: false
  }
})

const messagesSchema = mongoose.Schema({
  chatId: {
    type: String,
    unique: true
  },
  messages: [chatSchema],
}, { collection: 'messages' });

module.exports = mongoose.models.Messages || mongoose.model('Messages', messagesSchema);
