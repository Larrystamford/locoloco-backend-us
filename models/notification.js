const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const notificationSchema = new Schema(
  {
    userPicture: String,
    userName: String,
    userId: String,
    message: String,
    videoCoverImage: String,
    videoId: String,
    notificationType: String,
    redirectLink: String,
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
