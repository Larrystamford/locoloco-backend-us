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
    // video ids that user has seen
    seenVideos: [String],
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
  },
  { timestamps: true }
);

// Mongoose functionality which allows us to run a function before something happens.
userSchema.pre("save", async function (next) {
  // In this, we want this function to run before the userschema is saved
  try {
    if (this.method !== "local") {
      next();
    }
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    const passwordHash = await bcrypt.hash(this.local.password, salt);
    // Store hashed password instead of original password
    this.local.password = passwordHash;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function (enterPassword) {
  try {
    const passwordMatch = await bcrypt.compare(
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
