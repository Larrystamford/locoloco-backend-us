const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const feedSchema = new Schema(
  {
    id: { type: Number, required: true, unqiue: true }, // id will start from 1 and keep incrementing -> can easily get the lastest id
    count: Number,
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    categories_list: [{ type: Array }],
  },
  { timestamps: true }
);

const Feed = mongoose.model("Feed", feedSchema);

module.exports = Feed;
