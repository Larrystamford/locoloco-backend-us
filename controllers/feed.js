const Video = require("../models/video");
const Item = require("../models/item");
const User = require("../models/user");
const SeenVideos = require("../models/seenVideos");

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

  // history feed
  getHistoryFeed: async (req, res, next) => {
    try {
      const {
        query: { userId, skip },
      } = req;

      let feedWatched;
      let skipCount = 0;

      if (skip) {
        skipCount = parseInt(skip) + 1;

        feedWatched = await SeenVideos.find({
          userId: userId,
        })
          .sort({ updatedAt: -1 })
          .skip(skipCount)
          .populate("videos")
          .populate({
            path: "videos",
            populate: { path: "items" },
          })
          .populate({
            path: "videos",
            populate: { path: "comments", populate: { path: "replies" } },
          })
          .populate({
            path: "videos",
            populate: { path: "reviews" },
          });

        feedWatched = feedWatched[0];
        if (!feedWatched) {
          feedWatched = {
            videos: [],
            count: -1,
          };
        }

        // use count as skip
        feedWatched.count = skipCount;

        let currentFeedId = feedWatched.feedId;

        feedWatched.videos = feedWatched.videos.reverse();
        while (feedWatched.videos.length < 4 && currentFeedId > 1) {
          skipCount += 1;
          let nextFeedWatched = await SeenVideos.find({
            userId: userId,
          })
            .sort({ updatedAt: -1 })
            .skip(skipCount)
            .populate("videos")
            .populate({
              path: "videos",
              populate: { path: "items" },
            })
            .populate({
              path: "videos",
              populate: { path: "comments", populate: { path: "replies" } },
            })
            .populate({
              path: "videos",
              populate: { path: "reviews" },
            });

          nextFeedWatched = nextFeedWatched[0];

          if (!nextFeedWatched) {
            break;
          }

          feedWatched.videos = [
            ...feedWatched.videos,
            ...nextFeedWatched.videos.reverse(),
          ];

          // use count as skip
          feedWatched.count = skipCount;
        }
      } else {
        feedWatched = await SeenVideos.find({
          userId: userId,
        })
          .sort({ updatedAt: -1 })
          .skip(skipCount)
          .populate("videos")
          .populate({
            path: "videos",
            populate: { path: "items" },
          })
          .populate({
            path: "videos",
            populate: { path: "comments", populate: { path: "replies" } },
          })
          .populate({
            path: "videos",
            populate: { path: "reviews" },
          });

        feedWatched = feedWatched[0];
        if (!feedWatched) {
          feedWatched = {
            videos: [],
            count: -1,
          };
        }
        // use count as skip
        feedWatched.count = skipCount;

        let currentFeedId = feedWatched.feedId;

        feedWatched.videos = feedWatched.videos.reverse();
        while (feedWatched.videos.length < 4 && currentFeedId > 1) {
          skipCount += 1;
          let nextFeedWatched = await SeenVideos.find({
            userId: userId,
          })
            .sort({ updatedAt: -1 })
            .skip(skipCount)
            .populate("videos")
            .populate({
              path: "videos",
              populate: { path: "items" },
            })
            .populate({
              path: "videos",
              populate: { path: "comments", populate: { path: "replies" } },
            })
            .populate({
              path: "videos",
              populate: { path: "reviews" },
            });

          nextFeedWatched = nextFeedWatched[0];

          if (!nextFeedWatched) {
            break;
          }

          feedWatched.videos = [
            ...feedWatched.videos,
            ...nextFeedWatched.videos.reverse(),
          ];

          // use count as skip
          feedWatched.count = skipCount;
        }
      }

      res.status(200).send(feedWatched);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};

module.exports = FeedController;
