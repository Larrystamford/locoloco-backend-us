const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_AUTH_ID);
const User = require("../models/user");
const usersHelper = require("../helpers/usersHelper");
const sendEmailService = require("./email");
const Notification = require("../models/notification");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

async function registerOrLogin(id_token) {
  const ticket = await client.verifyIdToken({
    idToken: id_token,
    audience: process.env.GOOGLE_AUTH_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload["sub"];
  const email = payload["email"];

  try {
    // Check whether this current user exists in our Database
    const existingUser = await User.findOne({ "google.id": userid });
    if (existingUser) {
      console.log("User already exist in our DB");

      return existingUser;
    } else {
      console.log(
        "User doesn't exist - We are creating a new one with Google Account"
      );

      const newUserName = await usersHelper.generateUsername(email);

      const welcomeNotification = new Notification({
        userPicture:
          "https://media2locoloco.s3-ap-southeast-1.amazonaws.com/just_loco_loco.jpg",
        userName: "shoplocoloco",
        message: "Welcome to the Loco Family! Start watching now!",
        notificationType: "broadcast",
        redirectLink: "/",
      });
      await welcomeNotification.save();

      const newUser = new User({
        method: "google",
        google: {
          id: userid,
          email: email,
        },

        firstName: newUserName,
        lastName: "",
        picture:
          "https://media2locoloco.s3-ap-southeast-1.amazonaws.com/default_profile_pic.jpg",
        email: email,
        seenVideos: [],
        likedVideos: [],
      });
      newUser.notifications = [welcomeNotification];
      newUser.userName = newUserName;
      await newUser.save();

      sendEmailService.sendEmailSignUp(
        email,
        "Welcome to the Loco Family! 🎉",
        "Message sent from www.shoplocoloco.com"
      );

      return newUser;
    }
  } catch (error) {
    return error;
  }
}

module.exports = {
  registerOrLogin,
};
