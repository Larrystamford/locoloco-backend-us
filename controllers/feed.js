const Video = require("../models/video");
const Item = require("../models/item");
const User = require("../models/user");

const { getPotentialFeed, filterVideosByCategory } = require("../service/feed");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

let FeedController = {
  // AUTO PAGINATE FEED
  listVideosItems: async (req, res, next) => {
    try {
      const {
        query: { userId, watchedFeedId },
      } = req;

      let totalVideoCount = 0;
      const potentialFeeds = [];

      let potentialFeed = await getPotentialFeed(userId, watchedFeedId);
      let watchingFeedId = potentialFeed.id;
      if (potentialFeed.id != 0) {
        totalVideoCount += potentialFeed.videos.length;
      }
      potentialFeeds.push(potentialFeed);

      console.log(potentialFeed, watchingFeedId, totalVideoCount, "sdsdfdsf");

      while (watchingFeedId > 1 && totalVideoCount < 3) {
        potentialFeed = await getPotentialFeed(userId, watchingFeedId);
        potentialFeeds.push(potentialFeed);
        if (potentialFeed.id == 0) {
          break;
        } else {
          totalVideoCount += potentialFeed.videos.length;
          watchingFeedId -= 1;
        }
      }

      res.status(200).send(potentialFeeds);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  // for searching by category
  listVideosItemsByCategory: async (req, res, next) => {
    try {
      const { category } = req.params;
      const {
        query: { userId, watchedFeedId },
      } = req;

      let totalVideoCount = 0;
      const potentialFeeds = [];

      let potentialFeed = await getPotentialFeed(userId, watchedFeedId);
      let watchingFeedId = potentialFeed.id;

      if (watchingFeedId != 0) {
        potentialFeed = filterVideosByCategory(potentialFeed, category);
        console.log("category", category);
        console.log(potentialFeed);
        totalVideoCount += potentialFeed.videos.length;
      }
      potentialFeeds.push(potentialFeed);

      while (watchingFeedId > 1 && totalVideoCount < 3) {
        potentialFeed = await getPotentialFeed(userId, watchingFeedId);
        potentialFeed = filterVideosByCategory(potentialFeed, category);
        potentialFeeds.push(potentialFeed);
        if (potentialFeed.id == 0) {
          break;
        } else {
          totalVideoCount += potentialFeed.videos.length;
          watchingFeedId -= 1;
        }
      }

      res.status(200).send(potentialFeeds);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};

module.exports = FeedController;
