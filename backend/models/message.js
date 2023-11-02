const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  content: { type: String, required: true },
  sender: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Message', messageSchema);
