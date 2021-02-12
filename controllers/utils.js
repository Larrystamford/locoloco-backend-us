const Video = require("../models/video");
const Item = require("../models/item");
const User = require("../models/user");
const Notification = require("../models/notification");
const Admin = require("../models/admin");
const { addVideoToFeed } = require("../service/feed");

var mongoose = require("mongoose");

let UtilsController = {
  addNewFieldToCollection: async (req, res, next) => {
    Video.update(
      {},
      { $set: { comments: [] } },
      { upsert: false, multi: true }
    );
    const results = await Video.find();
    res.status(200).send(results);
  },

  // broadcast Notification to Inbox of user
  broadcastNotification: async (req, res, next) => {
    const notification = new Notification(req.body);
    try {
      await notification.save();

      await User.updateMany(
        {},
        {
          $push: { notifications: notification },
        }
      );

      res.status(200).send("success");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // temporary use
  addExistingVideosToFeed: async (req, res, next) => {
    try {
      const listOfVideosItems = await Video.find().sort({
        createdAt: -1,
        timeCreated: -1,
      });

      for (eachVideo of listOfVideosItems) {
        await addVideoToFeed(eachVideo._id, eachVideo.categories);
      }

      res.status(200).send("success");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // temporary use
  changeSeaToUsLinks: async (req, res, next) => {
    try {
      const listOfVideosItems = await Video.find();
      for (eachVideo of listOfVideosItems) {
        let videoUrl = eachVideo.url;
        let videoCoverImageUrl = eachVideo.coverImageUrl;

        let newVideoUrl = videoUrl.split(".com");
        newVideoUrl =
          "https://media2locoloco-us.s3.amazonaws.com" + newVideoUrl[1];

        let newVideoCoverImageUrl = videoCoverImageUrl.split(".com");
        newVideoCoverImageUrl =
          "https://media2locoloco-us.s3.amazonaws.com" +
          newVideoCoverImageUrl[1];

        console.log(newVideoUrl);

        console.log(newVideoCoverImageUrl);
        eachVideo.url = newVideoUrl;
        eachVideo.coverImageUrl = newVideoCoverImageUrl;

        await eachVideo.save();
      }

      const listOfItems = await Item.find();
      for (eachItem of listOfItems) {
        let imageUrl = eachItem.image;

        let newImageUrl = imageUrl.split(".com");
        newImageUrl =
          "https://media2locoloco-us.s3.amazonaws.com" + newImageUrl[1];

        console.log(newImageUrl);

        eachItem.image = newImageUrl;

        await eachItem.save();
      }

      res.status(200).send("success");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // temporary use
  createAdmin: async (req, res, next) => {
    try {
      const newAdmin = new Admin({
        userId: mongoose.Types.ObjectId("5fdb8fc88dc4cb1ef7f727e5"),
      });
      await newAdmin.save();
      res.status(200).send(newAdmin);
    } catch (err) {
      res.status(500).send(err);
    }
  },
};

module.exports = UtilsController;
