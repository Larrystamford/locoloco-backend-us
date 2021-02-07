const Video = require("../models/video");
const User = require("../models/user");
const Notification = require("../models/notification");
const Admin = require("../models/admin");

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
      const listOfVideosItems = await Video.find();
      for (eachVideo of listOfVideosItems) {
        await addVideoToFeed(eachVideo._id, eachVideo.categories);
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
