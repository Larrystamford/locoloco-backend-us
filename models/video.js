const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const videoSchema = new Schema(
  {
    //   id: Schema.Types.ObjectId,
    url: { type: String, required: true },
    coverImageUrl: String,
    mediaType: String, // video or image
    caption: String,
    likes: [String], // list of userIds that has liked the video
    likesCount: Number,
    shares: Number,
    categories: [String],
    subCategories: [String],
    shipsFrom: [String], // should be only one address here but just incase, temporarily auto set all user address to be shipFrom address
    shipsTo: [String],
    gender: String,
    averagePrice: Number,
    totalStocks: Number,
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    // which user this video belongs to
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    userName: String,
    // review related metrics to get average
    totalReviewRating: Number,
    reviewCounts: Number,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);
module.exports = Video;
