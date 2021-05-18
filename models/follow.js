const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const followSchema = new Schema(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    followingId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const follow = mongoose.model("follow", followSchema);

module.exports = follow;