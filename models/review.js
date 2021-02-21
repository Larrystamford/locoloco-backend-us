const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const reviewSchema = new Schema(
  {
    videoId: String,
    userName: String, // temp fake user names
    userId: String,
    rating: Number, // which video it belongs to
    text: String,
    media: String, // uploaded review image or video
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
