const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

// Create a Schema
const userSchema = new Schema(
  {
    method: {
      type: String,
      enum: ["local", "google", "facebook"],
    },

    google: {
      id: {
        type: String,
      },
      email: {
        type: String,
        lowercase: true,
      },
    },
    local: {
      email: {
        type: String,
        lowercase: true,
      },
      password: {
        type: String,
      },
    },

    authStatus: String, // temp for checking if first time user

    userName: String,
    email: String,
    firstName: String,
    lastName: String,
    picture: String,
    number: String,
    country: String,
    city: String,
    postalCode: String,
    address: String,
    profileBio: String,
    latestFeedIdPerSession: Number,
    locoCoins: Number,
    followers: [
      {
        id: String,
        userName: String,
        picture: String,
      },
    ],
    followings: [
      {
        id: String,
        userName: String,
        picture: String,
      },
    ],
    purchases: [
      {
        type: Schema.Types.ObjectId,
        ref: "BuySellItem",
      },
    ],
    sales: [
      {
        type: Schema.Types.ObjectId,
        ref: "BuySellItem",
      },
    ],
    // video objects that the user has liked
    likedVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    likedComments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likedSubComments: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubComment",
      },
    ],
    // videos posted by user
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    pushNotificationSubscriptions: [
      {
        type: Schema.Types.ObjectId,
        ref: "PushNotificationSubscription",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    subComments: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubComment",
      },
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.isValidPassword = async function (enterPassword) {
  try {
    const passwordMatch = bcrypt.compareSync(
      enterPassword,
      this.local.password
    );

    return passwordMatch; // True if matches
  } catch (error) {
    throw new Error(error);
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
