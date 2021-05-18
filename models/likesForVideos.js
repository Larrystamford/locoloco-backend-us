const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const likesForVideosSchema = new Schema(
  {
    likerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
  },
  { timestamps: true }
);

const likesForVideos = mongoose.model("likesForVideos", likesForVideosSchema);

module.exports = likesForVideos;
