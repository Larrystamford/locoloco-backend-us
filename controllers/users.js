const JWT = require("jsonwebtoken");
const User = require("../models/user");
const Video = require("../models/video");
const BuySellItem = require("../models/buySellItem");
const SeenVideos = require("../models/seenVideos");
const { Comment, SubComment } = require("../models/comment");
const Notification = require("../models/notification");
const usersHelper = require("../helpers/usersHelper");
const sendEmailService = require("../service/email");
const moment = require("moment");
const { registerOrLogin } = require("../service/oauth");
const bcrypt = require("bcryptjs");

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
  method: 0,
  number: 0,
};

signToken = (userId) => {
  return JWT.sign(
    {
      iss: "Authenticator",
      sub: userId, // can get user id with sub after decrypt
      iat: new Date().getTime(), // Current Time
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

  // REDIRECT LOGIN
  localRedirect: async (req, res, next) => {
    const { user_id } = req.body;
    const user = await User.findOne({ _id: user_id });
    const token = signToken(user_id);

    res.status(200).json({
      token: token,
      userId: user_id,
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
      userPicture: "https://dciv99su0d7r5.cloudfront.net/favicon-96x96.png",
      userName: "vosh",
      message: "Welcome to Vosh! Start watching now!",
      notificationType: "broadcast",
      redirectLink: "/",
    });
    await welcomeNotification.save();

    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser = new User({
      method: "local",
      local: {
        email: email.toLowerCase(),
        password: passwordHash,
      },
      email: email.toLowerCase(),
      profileBio: "welcome to vosh.club 🎉",
    });

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

    newUser.userName = await usersHelper.generateUsername(newUser.email);
    newUser.firstName = newUser.userName;
    newUser.lastName = "";
    newUser.picture = locoProfilePic[randomSelectProfilePic];
    newUser.address == "";
    newUser.notifications = [welcomeNotification];

    const savedUser = await newUser.save();

    // Generate the Token
    const token = signToken(newUser);

    // send sign up email
    sendEmailService.sendEmailSignUp(
      newUser.email,
      "Welcome to Vosh Club! 🎉",
      "Message sent from vosh.club"
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

  checkCurrentPassword: async (req, res, next) => {
    try {
      const { userId, currentPassword } = req.body;

      const user = await User.findOne({ _id: userId });
      const isMatch = await user.isValidPassword(currentPassword);

      res.status(200).send(isMatch);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { userId, newPassword } = req.body;

      const user = await User.findOne({ _id: userId });
      // const salt = await bcrypt.genSalt(4);
      const passwordHash = bcrypt.hashSync(newPassword, 10);
      user.local.password = passwordHash;
      await user.save();

      res.status(200).send("success");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
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
        .populate({
          path: "videos",
          populate: { path: "reviews" },
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
        { userName: userName.toLowerCase() },
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
        })
        .populate({
          path: "videos",
          populate: { path: "reviews" },
        });

      res.status(200).send(userVideos);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  getVideosItemsByUserIdPro: async (req, res, next) => {
    const { userId } = req.params;

    try {
      const userVideos = await User.find({ _id: userId }, sensitiveDataUserId)
        .populate({
          path: "proVideos",
          populate: {
            path: "comments",
            populate: { path: "replies" },
          },
        })
        .populate("youtubeVideos")
        .populate("proYoutubeVideos")
        .populate("videos")
        .populate({
          path: "proVideos",
          populate: {
            path: "comments",
            populate: { path: "replies" },
          },
        });

      res.status(200).send(userVideos);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // use for loading users page
  getVideosItemsByUserNamePro: async (req, res, next) => {
    const { userName } = req.params;

    try {
      const userVideos = await User.find(
        { userName: userName.toLowerCase() },
        sensitiveDataUserName
      )
        .sort({ _id: 1 })
        .populate("youtubeVideos")
        .populate("proYoutubeVideos")
        .populate({
          path: "proVideos",
          populate: {
            path: "comments",
            populate: { path: "replies" },
          },
        })
        .populate({
          path: "videos",
          populate: {
            path: "comments",
            populate: { path: "replies" },
          },
        });

      res.status(200).send(userVideos);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  userNameTaken: async (req, res, next) => {
    const { userName } = req.params;
    try {
      let username = await User.findOne({ userName: userName });
      if (username) {
        username = true;
      } else {
        username = false;
      }
      res.status(201).send({ userNameTaken: username });
    } catch (err) {
      res.status(500).send(err);
    }
  },

  userNameIsPro: async (req, res, next) => {
    const { userName } = req.params;
    try {
      let username = await User.findOne({ userName: userName.toLowerCase() });
      if (username && username.accountType == "pro") {
        usernameIsPro = true;
      } else {
        usernameIsPro = false;
      }
      res.status(201).send({ userNameIsPro: usernameIsPro });
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

  // push previousProductLinks
  pushPreviousProductLinks: async (req, res, next) => {
    const { userId } = req.params;
    const { allProductLinks, proVideo, proYoutubeVideos } = req.body;
    try {
      let user;

      if (proVideo) {
        user = await User.findByIdAndUpdate(
          { _id: userId },
          {
            $addToSet: {
              proVideos: proVideo,
            },
          }
        );
      }

      if (proYoutubeVideos) {
        user = await User.findByIdAndUpdate(
          { _id: userId },
          {
            $addToSet: {
              proYoutubeVideos: proYoutubeVideos,
            },
          }
        );
      }

      for (const eachProductLink of allProductLinks) {
        let existingLink = false;
        let i = 0;
        for (i; i < user.allProductLinks.length; i++) {
          if (user.allProductLinks[i].itemId === eachProductLink.itemId) {
            existingLink = true;
            break;
          }
        }

        if (existingLink) {
          user.allProductLinks[i] = eachProductLink;
        } else {
          user.allProductLinks.unshift(eachProductLink);
        }
      }

      await user.save();

      res.status(201).send("success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

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
    const { videoId, category } = req.body;
    try {
      const video = await Video.findOne({ _id: videoId });
      const feedId = video.feedId;

      // if on fyp and feed does not exist, update the latest session nextUnseenFeedId
      // this is to update the latest feed session only. This is no updated for other categories as the
      // other categories feedId is jumping around, so we shouldnt say for sure to jump to this feedId.
      if (category == "Feed") {
        feedWatching = await SeenVideos.findOne({
          userId: userId,
          feedId: feedId,
        });

        // haven't watch this feed before
        if (!feedWatching) {
          const user = await User.findOne({ _id: userId });
          const latestFeedIdOfTheSession = user.latestFeedIdPerSession;

          // now it allow user to skip feedId if he restarts
          await SeenVideos.updateOne(
            { userId: userId, feedId: latestFeedIdOfTheSession },
            {
              nextUnseenFeedId: feedId,
            },
            { upsert: false }
          );
        }
      }

      await SeenVideos.updateOne(
        // count is not the best, use videos.length for accurate count
        { userId: userId, feedId: feedId },
        {
          $addToSet: {
            videos: videoId,
          },
          $inc: { count: 1 },
          $setOnInsert: {
            userId: userId,
            feedId: feedId,
            nextUnseenFeedId: feedId - 1,
          },
        },
        { upsert: true }
      );

      res.status(201).send("pushed");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  // check if address stored already
  getUserInfo: async (req, res, next) => {
    const { userId } = req.params;
    try {
      const userInfo = await User.find(
        { _id: userId },
        {
          address: 1,
          postalCode: 1,
          number: 1,
          country: 1,
          city: 1,
          userName: 1,
          email: 1,
          firstName: 1,
          lastName: 1,
          likedVideos: 1,
          likedComments: 1,
          notifications: 1,
        }
      );
      res.status(200).send(userInfo);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // update shipping status
  updateShippingStatus: async (req, res, next) => {
    const {
      buySellItemId,
      shippingDelayed,
      sellerDeliveryStatus,
      buyerDeliveryStatus,
      reviewId,
    } = req.body;

    // update seller item status
    try {
      if (sellerDeliveryStatus == "ordered") {
        await BuySellItem.updateOne(
          { _id: buySellItemId },
          {
            buyerDeliveryStatus: buyerDeliveryStatus,
            sellerDeliveryStatus: sellerDeliveryStatus,
          }
        );
      }

      if (sellerDeliveryStatus == "shipped") {
        const statusChangeDate = moment().format("yyyy-MM-DDTHH:mm:ss.SSS");
        await BuySellItem.updateOne(
          { _id: buySellItemId },
          {
            buyerDeliveryStatus: buyerDeliveryStatus,
            sellerDeliveryStatus: sellerDeliveryStatus,
            shippedAt: statusChangeDate,
          }
        );
      }

      if (sellerDeliveryStatus == "delivered") {
        const statusChangeDate = moment().format("yyyy-MM-DDTHH:mm:ss.SSS");

        await BuySellItem.updateOne(
          { _id: buySellItemId },
          {
            buyerDeliveryStatus: buyerDeliveryStatus,
            sellerDeliveryStatus: sellerDeliveryStatus,
            deliveredAt: statusChangeDate,
          }
        );
      }

      if (typeof shippingDelayed !== "undefined" && shippingDelayed) {
        await BuySellItem.updateOne(
          { _id: buySellItemId },
          {
            shippingDelayed: true,
          }
        );
      } else if (typeof shippingDelayed !== "undefined" && !shippingDelayed) {
        await BuySellItem.updateOne(
          { _id: buySellItemId },
          {
            shippingDelayed: false,
          }
        );
      }

      if (sellerDeliveryStatus == "refunded") {
        const statusChangeDate = moment().format("yyyy-MM-DDTHH:mm:ss.SSS");

        await BuySellItem.updateOne(
          { _id: buySellItemId },
          {
            buyerDeliveryStatus: buyerDeliveryStatus,
            sellerDeliveryStatus: sellerDeliveryStatus,
            refundedAt: statusChangeDate,
          }
        );
      }

      if (reviewId) {
        await BuySellItem.updateOne(
          { _id: buySellItemId },
          {
            reviewId: reviewId,
          }
        );
      }

      let updatedBuySellItem = await BuySellItem.find({ _id: buySellItemId });
      res.status(200).send(updatedBuySellItem);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  addCoins: async (req, res, next) => {
    const { userId } = req.params;
    const { locoCoins } = req.body;
    try {
      await User.updateOne(
        { _id: userId },
        {
          $inc: { locoCoins: locoCoins },
        },
        { upsert: false }
      );

      res.status(201).send("success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};
