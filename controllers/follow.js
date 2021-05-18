const follow = require("../models/follow");
const User = require("../models/user");

module.exports = {
  followUser: async (req, res, next) => {
    try {
      const { followerId, followingId } = req.body;

      await follow.updateOne(
        { followerId: followerId, followingId: followingId },
        {
          $setOnInsert: { followerId: followerId, followingId: followingId },
        },
        { upsert: true }
      );

      await User.updateOne(
        { _id: followingId },
        {
          $inc: { followersCount: 1 },
        }
      );

      res.status(200).send("success");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  unfollowUser: async (req, res, next) => {
    try {
      const { followerId, followingId } = req.body;

      await follow.deleteOne({
        followerId: followerId,
        followingId: followingId,
      });

      await User.updateOne(
        { _id: followingId },
        {
          $inc: { followersCount: -1 },
        }
      );

      res.status(200).send("success");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  isFollowing: async (req, res, next) => {
    try {
      const { followerId, followingId } = req.params;

      let isFollowing = await follow.findOne({
        followerId: followerId,
        followingId: followingId,
      });

      if (isFollowing) {
        isFollowing = true;
      } else {
        isFollowing = false;
      }

      res.status(200).send({
        isFollowing: isFollowing,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
};
