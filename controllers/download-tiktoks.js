const Review = require("../models/review");
const User = require("../models/user");
const Video = require("../models/video");

const TikTokScraper = require('tiktok-scraper');

var mongoose = require("mongoose");

let DownloadTiktoksController = {
  getTikToksFromUser: async (req, res, next) => {
    try {
      const { username } = req.params;
      console.log(username)

 
      const posts = await TikTokScraper.user('larrystamford', { number: 1, sessionList: ['sid_tt=612d5cda4a5db3478df5b1ca434d5430;'] });
      console.log(posts.collector);

      res.status(200).send("hello");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};

module.exports = DownloadTiktoksController;
