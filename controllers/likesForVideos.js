const likesForVideos = require("../models/likesForVideos");
const Video = require("../models/video");

module.exports = {
  // likerId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },
  // videoId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Video",
  // },

  like: async (req, res, next) => {
    try {
      const { likerId, videoId } = req.body;

      await likesForVideos.updateOne(
        { likerId: likerId, videoId: videoId },
        {
          $setOnInsert: { likerId: likerId, videoId: videoId },
        },
        { upsert: true }
      );

      await Video.updateOne(
        { _id: videoId },
        {
          $inc: { likesCount: 1 },
        }
      );

      res.status(200).send("success");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  unlike: async (req, res, next) => {
    try {
      const { likerId, videoId } = req.body;

      await likesForVideos.deleteOne({
        likerId: likerId,
        videoId: videoId,
      });

      await Video.updateOne(
        { _id: videoId },
        {
          $inc: { likesCount: -1 },
        }
      );

      res.status(200).send("success");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  isLiked: async (req, res, next) => {
    try {
      const { likerId, videoId } = req.params;

      let isLiked = await likesForVideos.findOne({
        likerId: likerId,
        videoId: videoId,
      });

      if (isLiked) {
        isLiked = true;
      } else {
        isLiked = false;
      }

      res.status(200).send({
        isLiked: isLiked,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
};
