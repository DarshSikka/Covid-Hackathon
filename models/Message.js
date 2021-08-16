const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  content: {
    required: true,
    type: String,
  },
  author: {
    type: String,
    required: true,
  },
  postedAt: {
    type: Date,
    default: new Date(),
  },
});
const Message = mongoose.model("Message", schema, "chat");
module.exports = Message;
