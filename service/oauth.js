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

      const randomSelectProfilePic = Math.floor(Math.random() * 8);
      const locoProfilePic = [
        "https://dciv99su0d7r5.cloudfront.net/profile_pic_loco_1.png",
        "https://dciv99su0d7r5.cloudfront.net/profile_pic_loco_2.png",
        "https://dciv99su0d7r5.cloudfront.net/profile_pic_loco_3.png",
        "https://dciv99su0d7r5.cloudfront.net/profile_pic_loco_4.png",
        "https://dciv99su0d7r5.cloudfront.net/profile_pic_loco_5.png",
        "https://dciv99su0d7r5.cloudfront.net/profile_pic_loco_6.png",
        "https://dciv99su0d7r5.cloudfront.net/profile_pic_loco_7.png",
        "https://dciv99su0d7r5.cloudfront.net/profile_pic_loco_8.png",
      ];

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
        picture: locoProfilePic[randomSelectProfilePic],
        email: email,
        likedVideos: [],
        profileBio: "welcome to shoplocoloco.com 🎉",
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
