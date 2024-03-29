const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const reviewSchema = new Schema(
  {
    videoId: String,
    itemId: String,
    itemName: String,
    userName: String, // temp fake user names
    userPicture: String,
    userId: String,
    rating: Number, // which video it belongs to
    text: String,
    media: String, // media link
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
