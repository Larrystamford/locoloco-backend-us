const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const likesSchema = new Schema(
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

const likes = mongoose.model("likes", likesSchema);

module.exports = likes;
