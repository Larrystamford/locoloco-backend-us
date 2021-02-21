const Video = require("../models/video");
const Item = require("../models/item");
const User = require("../models/user");
const BuySellItem = require("../models/buySellItem");

const sendEmailService = require("../service/email");
const videoItemService = require("../service/video_and_item");

const { addVideoToFeed, getPotentialFeed } = require("../service/feed");

let winston = require("winston"),
  WinstonCloudWatch = require("winston-cloudwatch");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

winston.add(
  new WinstonCloudWatch({
    logGroupName: "handleItemStock",
    logStreamName: "first",
    awsAccessKeyId: process.env.AWS_ACCESS_ID,
    awsSecretKey: process.env.AWS_SECRET_KEY,
    awsRegion: process.env.AWS_REGION,
  })
);

let VideoAndItemController = {
  getVideosItemsByVideoId: async (req, res, next) => {
    const { videoId } = req.params;

    try {
      const videoItems = await Video.find({ _id: videoId })
        .populate({
          path: "comments",
          populate: { path: "replies" },
        })
        .populate("user")
        .populate("items");

      res.status(200).send(videoItems);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  getItemByItemId: async (req, res, next) => {
    const { itemId } = req.params;

    try {
      const item = await Item.find({ _id: itemId });
      res.status(200).send(item);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  createVideo: async (req, res, next) => {
    let user;
    const { userId } = req.params;

    const newVideo = new Video(req.body);
    newVideo.likes = [];
    newVideo.shares = 0;
    try {
      user = await User.findById(userId);
    } catch (err) {
      res.status(500).send(err);
    }

    newVideo.user = user;
    newVideo.userName = user.userName;
    try {
      await newVideo.save();
    } catch (err) {
      res.status(500).send(err);
    }

    user.videos = [...user.videos, newVideo._id];
    try {
      await user.save();
      res.status(201).send(newVideo);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // requires videoId param (to do: add multiple items at once)
  createItem: async (req, res, next) => {
    let video;

    const { videoId } = req.params;
    const newItem = new Item(req.body);

    try {
      video = await Video.findById(videoId);
    } catch (err) {
      console.log("1", err);
      res.status(500).send(err);
    }

    newItem.video = video;

    try {
      await newItem.save();
    } catch (err) {
      console.log("2", err);
      res.status(500).send(err);
    }

    video.items = [...video.items, newItem._id];

    try {
      await video.save();
      res.status(201).send(newItem);
    } catch (err) {
      console.log("3", err);

      res.status(500).send(err);
    }
  },

  uploadVideoAndItem: async (req, res, next) => {
    let user;

    const userId = req.query.userId;
    const amazonLink = req.query.amazonLink;

    req.body.video.categories = req.body.video.categories.map((v) =>
      v.toLowerCase()
    );
    req.body.video.subCatergories = req.body.video.subCatergories.map((v) =>
      v.toLowerCase()
    );
    req.body.video.gender = req.body.video.gender.toLowerCase();

    let newVideo = new Video(req.body.video);
    newVideo.likes = [];
    newVideo.shares = 0;
    try {
      user = await User.findById(userId);
    } catch (err) {
      res.status(500).send(err);
    }

    newVideo.user = user;
    newVideo.userName = user.userName;
    newVideo.shipsFrom = ["United States"];
    newVideo.shipsTo = ["United States"];

    // SAVING VIDEO
    try {
      newVideo = await newVideo.save();
    } catch (err) {
      res.status(500).send(err);
    }

    // SAVING USER
    user.videos = [...user.videos, newVideo._id];
    try {
      await user.save();
    } catch (err) {
      res.status(500).send(err);
    }

    // SAVING VIDEO TO FEED
    try {
      await addVideoToFeed(newVideo._id, newVideo.categories);
    } catch (err) {
      res.status(500).send(err);
    }

    const newItems = req.body.items;
    let totalPrice = 0;
    let totalStocks = 0;
    for (let eachItem of newItems) {
      eachItem = new Item(eachItem);
      eachItem.video = newVideo;
      totalPrice = totalPrice + eachItem.price;
      totalStocks = totalStocks + eachItem.stocks;

      try {
        eachItem = await eachItem.save();
      } catch (err) {
        console.log("Saving each item", err);
        res.status(500).send(err);
      }

      newVideo.items = [...newVideo.items, eachItem._id];
    }

    // save video again with updated fields
    newVideo.averagePrice = totalPrice / newItems.length;
    newVideo.totalStocks = totalStocks;

    await videoItemService.saveAmazonReviews(newVideo._id, amazonLink);

    try {
      await newVideo.save();
      res.status(201).send(newVideo);
    } catch (err) {
      console.log("save video again with updated fields", err);
      res.status(500).send(err);
    }
  },

  // might not use this anymore
  // logging an item purchase
  handleItemPurchase: async (req, res, next) => {
    const { userId, sellerId, quantity, itemId } = req.body;

    // check and deduct stock
    const [newBuySellItemId, error] = await videoItemService.handleItemStock(
      userId,
      sellerId,
      quantity,
      itemId
    );

    if (error == null) {
      // get buyer email
      // const buyer = await User.find({ _id: userId });
      // const buyerEmail = buyer[0].email;

      // sendEmailService.sendEmailPurchase(
      //   buyerEmail,
      //   "Your purchase was successful! 🥳",
      //   "Message sent from www.shoplocoloco.com"
      // );

      res
        .status(200)
        .send({ status: "success", newBuySellItemId: newBuySellItemId });
    } else {
      // insufficient stock error or some other error (already reverted)
      res.send({
        status: error.toString(),
        newBuySellItemId: newBuySellItemId,
      });
    }
  },

  // revert item purchase
  revertItemPurchase: async (req, res, next) => {
    const { userId, sellerId, quantity, itemId, newBuySellItemId } = req.body;
    try {
      // check and deduct stock
      await videoItemService.handleStocksRevert(
        userId,
        sellerId,
        quantity,
        itemId,
        newBuySellItemId
      );

      res.status(200).send("reverted");
    } catch (err) {
      winston.error("revert failed" + err.toString());
      console.log("revert failed" + err.toString());
      res.status(400).send(err.toString());
    }
  },

  // post review using amazon link, not in use currently merged into the post video item
  postReview: async (req, res, next) => {
    let page = req.query.page;
    let limit = req.query.limit;

    console.log(page, limit);
    // let { videoId, amazonLink } = req.body;
    try {
      // await videoItemService.saveAmazonReviews(videoId, amazonLink);

      res.status(201).send("done");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};

module.exports = VideoAndItemController;
