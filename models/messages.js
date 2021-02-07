const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const messagesSchema = new Schema({
    message: String,
    owner: String,
    name: String,
    sent: Boolean,
    timestamp: String,
});


const Messages = mongoose.model("messages", messagesSchema)

module.exports = Messages;