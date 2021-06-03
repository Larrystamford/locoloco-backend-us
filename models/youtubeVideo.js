const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const youtubeVideoSchema = new Schema(
  {
    videoId: String,
    coverImageUrl: String,
    proCategories: [String],
    affiliateGroupName: String,
    affiliateProducts: [],
  },
  { timestamps: true }
);

const YoutubeVideo = mongoose.model("YoutubeVideo", youtubeVideoSchema);
module.exports = YoutubeVideo;
