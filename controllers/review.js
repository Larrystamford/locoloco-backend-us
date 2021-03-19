const Review = require("../models/review");
const User = require("../models/user");
const Video = require("../models/video");

var mongoose = require("mongoose");

let ReviewController = {
  postItemReview: async (req, res, next) => {
    try {
      let newReview = req.body;
      const user = await User.findById(newReview.userId);
      newReview.userName = user.userName;
      newReview.userPicture = user.picture;
      newReview = new Review(newReview);
      const reviewId = await newReview.save();

      await User.updateOne(
        { _id: newReview.userId },
        {
          $push: {
            reviews: newReview,
          },
        },
        { upsert: false }
      );

      await Video.findByIdAndUpdate(
        { _id: newReview.videoId },
        {
          $push: { reviews: newReview },
          $inc: { reviewCounts: 1, totalReviewRating: newReview.rating },
        }
      );

      res.status(200).send(reviewId._id);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};

module.exports = ReviewController;
