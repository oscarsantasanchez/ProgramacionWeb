// /models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  text:     { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);