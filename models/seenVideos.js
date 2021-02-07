const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const seenVideosSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    feedId: { type: Number, required: true, unqiue: true },
    nextUnseenFeedId: { type: Number, required: true },
    count: Number,
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

const SeenVideos = mongoose.model("SeenVideos", seenVideosSchema);

module.exports = SeenVideos;
