const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.Mixed, // Accepts both ObjectId and String guest IDs
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
