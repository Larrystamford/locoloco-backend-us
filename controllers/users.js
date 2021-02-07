const JWT = require("jsonwebtoken");
const User = require("../models/user");
const Video = require("../models/video");
const BuySellItem = require("../models/buySellItem");
const SeenVideos = require("../models/seenVideos");
const { Comment, SubComment } = require("../models/comment");
const Notification = require("../models/notification");
const usersHelper = require("../helpers/usersHelper");
const sendEmailService = require("../service/email");
const { registerOrLogin } = require("../service/oauth");

const _ = require("lodash/core");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const sensitiveDataUserId = {
  number: 0,
};

const sensitiveDataUserName = {
  google: 0,
  firstName: 0,
  lastName: 0,
  email: 0,
  authStatus: 0,
  purchases: 0,
  likedVideo: 0,
  seenVideos: 0,
  method: 0,
  number: 0,
};

signToken = (userId) => {
  return JWT.sign(
    {
      iss: "Authenticator",
      sub: userId, // can get user id with sub after decrypt
      iat: new Date().getTime(), // Current Time
      exp: new Date().setDate(new Date().getDate() + 10000000), // Expiry Date = Current Time + 1 Day ahead
    },
    "authentication"
  );
};

module.exports = {
  // LOGIN RELATED
  googleOAuth: async (req, res, next) => {
    // Generate Token
    const token = signToken(req.user._id);
    res.status(200).json({
      token: token,
      authStatus: req.user.authStatus,
      userId: req.user._id,
      userName: req.user.userName,
      picture: req.user.picture,
    });
  },

  // REDIRECT LOGIN
  googleIdToken: async (req, res, next) => {
    const { id_token } = req.body;
    const user = await registerOrLogin(id_token);
    const token = signToken(user._id);

    res.status(200).json({
      token: token,
      userId: user._id,
      userName: user.userName,
      picture: user.picture,
    });
  },

  signUp: async (req, res, next) => {
    const { email, password } = req.value.body;

    const foundUser = await User.findOne({ "local.email": email });
    if (foundUser) {
      return res
        .status(403)
        .json({ error: "This email has already been registered." });
    }

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
      method: "local",
      local: {
        email: email.toLowerCase(),
        password: password,
      },
      email: email.toLowerCase(),
    });

    newUser.userName = await usersHelper.generateUsername(newUser.email);
    newUser.firstName = newUser.userName;
    newUser.lastName = "";
    newUser.picture =
      "https://media2locoloco.s3-ap-southeast-1.amazonaws.com/default_profile_pic.jpg";
    newUser.address == "";
    newUser.notifications = [welcomeNotification];

    const savedUser = await newUser.save();

    // Generate the Token
    const token = signToken(newUser);
    console.log(savedUser);

    // send sign up email
    sendEmailService.sendEmailSignUp(
      newUser.email,
      "Welcome to the Loco Family! 🎉",
      "Message sent from www.shoplocoloco.com"
    );

    /// Respond to Client with Token
    res.status(200).json({
      token: token,
      userId: savedUser._id,
      userName: savedUser.userName,
      picture: savedUser.picture,
    });
  },

  signIn: async (req, res, next) => {
    // Generate Token
    const token = signToken(req.user);

    res.status(200).json({
      token: token,
      userId: req.user._id,
      userName: req.user.userName,
      picture: req.user.picture,
    });
  },

  secret: async (req, res, next) => {
    console.log(`UsersController.secret() called!`);
    res.json({ secret: "secret resource" });
  },

  // REST
  // use for loading profile page
  getVideosItemsByUserId: async (req, res, next) => {
    const { userId } = req.params;

    try {
      const userVideos = await User.find({ _id: userId }, sensitiveDataUserId)
        .populate({
          path: "videos",
          populate: {
            path: "comments",
            populate: { path: "replies" },
          },
        })
        .populate({
          path: "videos",
          populate: {
            path: "items",
          },
        })
        .populate("purchases")
        .populate("sales");

      res.status(200).send(userVideos);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // use for loading users page
  getVideosItemsByUserName: async (req, res, next) => {
    const { userName } = req.params;

    try {
      const userVideos = await User.find(
        { userName: userName },
        sensitiveDataUserName
      )
        .sort({ _id: 1 })
        .populate({
          path: "videos",
          populate: {
            path: "comments",
            populate: { path: "replies" },
          },
        })
        .populate({
          path: "videos",
          populate: {
            path: "items",
          },
        });
      console.log(userVideos);
      res.status(200).send(userVideos);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // use for editing -> adding in delivery details, update seen videos etc. Data that is only edited by one user can use this.
  update: async (req, res, next) => {
    const { userId } = req.params;
    try {
      let user = await User.findByIdAndUpdate({ _id: userId }, req.body);
      user = await User.find({ _id: userId });
      res.status(201).send(user);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // ACTIONS
  // update followings and followers needs to be synchronous as it can be done by many people at one time
  pushFollowers: async (req, res, next) => {
    const { userId } = req.params;
    const newFollower = req.body;
    try {
      let user = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { followers: newFollower } }
      );
      user = await User.find({ _id: userId });
      res.status(201).send(user);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  pullFollowers: async (req, res, next) => {
    const { userId } = req.params;
    const oldFollower = req.body;
    try {
      let user = await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { followers: oldFollower } }
      );
      user = await User.find({ _id: userId });
      res.status(201).send(user);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  pushFollowings: async (req, res, next) => {
    const { userId } = req.params;
    const newFollowing = req.body;
    try {
      let user = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { followings: newFollowing } }
      );
      user = await User.find({ _id: userId });
      res.status(201).send(user);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  pullFollowings: async (req, res, next) => {
    const { userId } = req.params;
    const oldFollowing = req.body;
    try {
      let user = await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { followings: oldFollowing } }
      );
      user = await User.find({ _id: userId });
      res.status(201).send(user);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  pushUserFavourites: async (req, res, next) => {
    const { userId } = req.params;
    const { videoId } = req.body;

    // update user
    try {
      let user = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { likedVideos: videoId } }
      );
      // user = await User.find({ _id: userId });
    } catch (err) {
      res.status(500).send(err);
    }

    // update video
    try {
      let video = await Video.findByIdAndUpdate(
        { _id: videoId },
        { $push: { likes: userId }, $inc: { likesCount: 1 } }
      );
      // video = await Video.find({ _id: videoId });
      res.status(201).send("success");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  pullUserFavourites: async (req, res, next) => {
    const { userId } = req.params;
    const { videoId } = req.body;

    // update user
    try {
      let user = await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { likedVideos: videoId } }
      );
      // user = await User.find({ _id: userId });
      // res.status(201).send(user);
      res.status(201).send("success");
    } catch (err) {
      res.status(500).send(err);
    }

    // lets remove the like from user but keep the video one because it means the video got engagement anyways
    // update video no change
  },

  pushUserCommentFavourites: async (req, res, next) => {
    const { userId } = req.params;
    const { commentId } = req.body;

    // update user
    try {
      let user = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { likedComments: commentId } }
      );
      // user = await User.find({ _id: userId });
    } catch (err) {
      res.status(500).send(err);
    }

    // update comment
    try {
      let comment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        { $push: { likes: userId }, $inc: { likesCount: 1 } }
      );
      // comment = await Comment.find({ _id: commentId });
      res.status(201).send("success");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  pullUserCommentFavourites: async (req, res, next) => {
    const { userId } = req.params;
    const { commentId } = req.body;

    // update user
    try {
      let user = await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { likedComments: commentId } }
      );

      // user = await User.find({ _id: userId });
    } catch (err) {
      res.status(500).send(err);
    }

    // update comment
    try {
      let comment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        { $pull: { likes: userId } }
      );
      // comment = await Comment.find({ _id: commentId });
      res.status(201).send("success");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  pushUserSubCommentFavourites: async (req, res, next) => {
    const { userId } = req.params;
    const { commentId } = req.body;

    // update user
    try {
      let user = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { likedSubComments: commentId } }
      );
      // user = await User.find({ _id: userId });
    } catch (err) {
      res.status(500).send(err);
    }

    // update comment
    try {
      let subComment = await SubComment.findByIdAndUpdate(
        { _id: commentId },
        { $push: { likes: userId }, $inc: { likesCount: 1 } }
      );
      // comment = await Comment.find({ _id: commentId });
      res.status(201).send("success");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  pullUserSubCommentFavourites: async (req, res, next) => {
    const { userId } = req.params;
    const { commentId } = req.body;
    console.log(commentId);
    // update user
    try {
      let user = await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { likedSubComments: commentId } }
      );

      // user = await User.find({ _id: userId });
    } catch (err) {
      res.status(500).send(err);
    }

    // update comment
    try {
      let subComment = await SubComment.findByIdAndUpdate(
        { _id: commentId },
        { $pull: { likes: userId } }
      );
      res.status(201).send("success");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  pushVideoSeen: async (req, res, next) => {
    const { userId } = req.params;
    const { videoId, feedId } = req.body;
    try {
      // will deprecate soon. Just to easily see what the users doing for now
      await User.findOneAndUpdate(
        { _id: userId },
        { $push: { seenVideos: videoId } }
      );

      await SeenVideos.updateOne(
        { userId: userId, feedId: feedId }, // current max count is 6
        {
          $push: {
            videos: videoId,
          },
          $inc: { count: 1 },
          $setOnInsert: { userId: userId, feedId: feedId },
        },
        { upsert: true }
      );

      const seensdsd = await SeenVideos.find();
      console.log(seensdsd);

      res.status(201).send("pushed");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // check if address stored already
  getUserShippingAddress: async (req, res, next) => {
    const { userId } = req.params;
    try {
      const userAddress = await User.find(
        { _id: userId },
        { address: 1, postalCode: 1, number: 1, country: 1, city: 1 }
      );
      res.status(200).send(userAddress);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // update shipping status
  updateShippingStatus: async (req, res, next) => {
    const {
      buySellItemId,
      sellerDeliveryStatus,
      buyerDeliveryStatus,
    } = req.body;

    // update seller item status
    try {
      await BuySellItem.updateOne(
        { _id: buySellItemId },
        {
          buyerDeliveryStatus: buyerDeliveryStatus,
          sellerDeliveryStatus: sellerDeliveryStatus,
        }
      );

      let updatedBuySellItem = await BuySellItem.find({ _id: buySellItemId });
      res.status(200).send(updatedBuySellItem);
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
