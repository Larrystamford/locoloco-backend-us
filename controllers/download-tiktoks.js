const Review = require("../models/review");
const User = require("../models/user");
const Video = require("../models/video");
const { uploadByFolder } = require("../service/upload");
const TikTokScraper = require("tiktok-scraper");
const del = require("del");

var mongoose = require("mongoose");

const options = {
  number: 2,
  sessionList: ["sid_tt=612d5cda4a5db3478df5b1ca434d5430"],

  // Set proxy {string[] | string default: ''}
  // http proxy: 127.0.0.1:8080
  // socks proxy: socks5://127.0.0.1:8080
  // You can pass proxies as an array and scraper will randomly select a proxy from the array to execute the requests
  proxy: "",
  by_user_id: false,

  download: true,

  // How many post should be downloaded asynchronously. Only if {download:true}: {int default: 5}
  asyncDownload: 5,

  // How many post should be scraped asynchronously: {int default: 3}
  // Current option will be applied only with current types: music and hashtag
  // With other types it is always 1 because every request response to the TikTok API is providing the "maxCursor" value
  // that is required to send the next request
  asyncScraping: 3,

  // File path where all files will be saved: {string default: 'CURRENT_DIR'}
  filepath: "./tiktok-videos/",

  // fileName: `CURRENT_DIR`,

  // Output with information can be saved to a CSV or JSON files: {string default: 'na'}
  // 'csv' to save in csv
  // 'json' to save in json
  // 'all' to save in json and csv
  // 'na' to skip this step
  filetype: `json`,

  // Set custom headers: user-agent, cookie and etc
  // NOTE: When you parse video feed or single video metadata then in return you will receive {headers} object
  // that was used to extract the information and in order to access and download video through received {videoUrl} value you need to use same headers

  // headers: {
  //   "user-agent": "BLAH",
  //   referer: "https://www.tiktok.com/",
  //   cookie: `tt_webid_v2=68dssds`,
  // },

  // Download video without the watermark: {boolean default: false}
  // Set to true to download without the watermark
  // This option will affect the execution speed
  noWaterMark: true,

  // Create link to HD video: {boolean default: false}
  // This option will only work if {noWaterMark} is set to {true}
  hdVideo: false,

  // verifyFp is used to verify the request and avoid captcha
  // When you are using proxy then there are high chances that the request will be
  // blocked with captcha
  // You can set your own verifyFp value or default(hardcoded) will be used

  // verifyFp: "",

  // Switch main host to Tiktok test enpoint.
  // When your requests are blocked by captcha you can try to use Tiktok test endpoints.

  useTestEndpoints: false,
};

let DownloadTiktoksController = {
  download: async (req, res, next) => {
    try {
      const { username } = req.params;

      await TikTokScraper.user(username, options);
      // console.log(tiktokContent);
      // const uploadedFiles = await uploadByFolder(
      //   `./tiktok-videos/${username}/`,
      //   ".mp4"
      // );

      // await del(`./tiktok-videos/${username}/`);

      // console.log(uploadedFiles);

      res.status(200).send("success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  saveTikToks: async (req, res, next) => {
    try {
      const { username } = req.params;

      const uploadedFiles = await uploadByFolder(
        `./tiktok-videos/${username}/`,
        ".mp4"
      );

      await del(`./tiktok-videos/${username}/`);

      // console.log(uploadedFiles);

      res.status(200).send({ uploadedFiles: uploadedFiles });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};

module.exports = DownloadTiktoksController;
