const Review = require("../models/review");
const User = require("../models/user");
const Video = require("../models/video");
const fs = require("fs");
const shell = require("shelljs");

const {
  uploadByFolder,
  screenshotTiktok,
  readJsonInfo,
} = require("../service/upload");

const { saveTikTokVideo } = require("../service/video_and_item");

const TikTokScraper = require("tiktok-scraper");
const del = require("del");

var mongoose = require("mongoose");

const defaultOptions = {
  number: 50,
  sessionList: ["sid_tt=1160c86a1fa35ccd0c26486683521293"],

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
  filetype: "json",

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
  hdVideo: true,

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
  getInfo: async (req, res, next) => {
    try {
      const { userId } = req.params;

      let tiktokUsername;
      const user = await User.findById(userId);
      for (const eachSocialAccount of user.socialAccounts) {
        if (eachSocialAccount.socialType == "TikTok") {
          tiktokUsername = eachSocialAccount.userIdentifier;
        }
      }

      if (fs.existsSync(`./tiktok-videos/${tiktokUsername}/`)) {
        await del(`./tiktok-videos/${tiktokUsername}/`);
      }
      if (fs.existsSync(`./tiktok-videos/${tiktokUsername + "-info"}/`)) {
        await del(`./tiktok-videos/${tiktokUsername + "-info"}/`);
      }

      const options = defaultOptions;
      options.filetype = "json";

      options.filepath = "./tiktok-videos/" + tiktokUsername + "-info/";
      if (!fs.existsSync(options.filepath)) {
        fs.mkdirSync(options.filepath, { recursive: true });
      }

      options.download = false;
      await TikTokScraper.user(tiktokUsername, options);

      res.status(200).send("success");
    } catch (err) {
      console.log(err);
      console.log("tiktok getinfo error");
      res.status(500).send(err);
    }
  },

  download: async (req, res, next) => {
    try {
      console.log("downloading tiktoks");
      const { userId } = req.params;

      const options = defaultOptions;
      options.download = true;
      options.filepath = "./tiktok-videos";
      options.filetype = "na";
      options.number = 3;

      let tiktokUsername;
      const user = await User.findById(userId);
      for (const eachSocialAccount of user.socialAccounts) {
        if (eachSocialAccount.socialType == "TikTok") {
          tiktokUsername = eachSocialAccount.userIdentifier;
        }
      }

      const latestTikTokVideoId = user.latestTikTokVideoId;
      if (latestTikTokVideoId) {
        let counter = 0;

        let rawJsonFile;
        let jsonObj;
        try {
          rawJsonFile = await readJsonInfo(
            "./tiktok-videos/" + tiktokUsername + "-info/"
          );
          jsonObj = JSON.parse(rawJsonFile);
          for (let i = 0; i < jsonObj.length; i++) {
            if (latestTikTokVideoId == jsonObj[i].id) {
              break;
            }
            counter += 1;
          }
        } catch (e) {
          console.log("json read error");
          console.log(e);
          // just get latest 50 if error reading json
          counter = 50;
        }

        if (counter == 0) {
          // already have the latest post downloaded
          options.number = -1;
        } else {
          options.number = counter;
        }
      } else {
        options.number = 50;
      }

      if (options.number >= 0) {
        await TikTokScraper.user(tiktokUsername, options);
      } else {
        await User.findByIdAndUpdate(
          { _id: userId },
          {
            noNewTiktokVideos: true,
          }
        );
      }

      res.status(200).send("success");
    } catch (err) {
      console.log(err);
      console.log("download tiktok error");
      res.status(500).send(err);
    }
  },

  saveTikToks: async (req, res, next) => {
    try {
      console.log("saving tiktoks");

      const { userId } = req.params;

      let tiktokUsername;
      const user = await User.findById(userId);
      for (const eachSocialAccount of user.socialAccounts) {
        if (eachSocialAccount.socialType == "TikTok") {
          tiktokUsername = eachSocialAccount.userIdentifier;
        }
      }

      if (!user.noNewTiktokVideos) {
        const [uploadedVideos, rawJsonFile] = await uploadByFolder(
          `./tiktok-videos/${tiktokUsername}/`,
          ".mp4"
        );

        const screenShots = [];
        for (const videoFile of uploadedVideos) {
          let newImageName = videoFile.Key.slice(0, -4);
          screenShots.push(
            screenshotTiktok(
              newImageName,
              `./tiktok-videos/${tiktokUsername}/`,
              videoFile.Location.replace(
                "https://media2locoloco-us.s3.amazonaws.com/",
                "https://dciv99su0d7r5.cloudfront.net/"
              )
            )
          );
        }
        await Promise.all(screenShots);

        const [uploadedImages, _] = await uploadByFolder(
          `./tiktok-videos/${tiktokUsername}/`,
          ".png"
        );

        // data processing
        const videoAndImageS3 = {};
        let videoKey;
        let imageKey;
        const jsonObj = JSON.parse(rawJsonFile);
        for (let i = 0; i < uploadedVideos.length; i++) {
          videoKey = uploadedVideos[i].Key.slice(0, -4);
          imageKey = uploadedImages[i].Key.slice(0, -4);
          jsonKey = jsonObj[i].id;

          if (!(videoKey in videoAndImageS3)) {
            videoAndImageS3[videoKey] = {};
          }
          if (!(imageKey in videoAndImageS3)) {
            videoAndImageS3[imageKey] = {};
          }
          if (!(jsonKey in videoAndImageS3)) {
            videoAndImageS3[jsonKey] = {};
          }

          videoAndImageS3[videoKey].video = uploadedVideos[i].Location;
          videoAndImageS3[imageKey].image = uploadedImages[i].Location;
          videoAndImageS3[jsonKey].caption = jsonObj[i].text;
          videoAndImageS3[jsonKey].createTime = jsonObj[i].createTime;
          videoAndImageS3[jsonKey].proShareCount = jsonObj[i].shareCount;
        }

        // saving to mongo
        const savedVideos = [];
        for (const [key, value] of Object.entries(videoAndImageS3)) {
          savedVideos.push(saveTikTokVideo(key, value, userId, tiktokUsername));
        }
        await Promise.all(savedVideos);

        const fullRawJsonObj = await readJsonInfo(
          "./tiktok-videos/" + tiktokUsername + "-info/"
        );
        const fullJsonObj = JSON.parse(fullRawJsonObj);
        if (fullJsonObj.length > 0) {
          await User.findByIdAndUpdate(
            { _id: userId },
            {
              latestTikTokVideoId: fullJsonObj[0].id,
            }
          );
        }
      }

      await User.findByIdAndUpdate(
        { _id: userId },
        {
          noNewTiktokVideos: false,
        }
      );

      if (fs.existsSync(`./tiktok-videos/${tiktokUsername}/`)) {
        await del(`./tiktok-videos/${tiktokUsername}/`);
      }
      if (fs.existsSync(`./tiktok-videos/${tiktokUsername + "-info"}/`)) {
        await del(`./tiktok-videos/${tiktokUsername + "-info"}/`);
      }

      res.status(200).send("success");
    } catch (err) {
      console.log(err);
      console.log("save tiktok error");
      res.status(500).send(err);
    }
  },

  downloadLimit: async (req, res, next) => {
    try {
      console.log("downloading tiktoks");
      const { userId, importNumber } = req.body;

      const options = defaultOptions;
      options.download = true;
      options.filepath = "./tiktok-videos/";
      options.number = importNumber;

      let tiktokUsername;
      const user = await User.findById(userId);
      for (const eachSocialAccount of user.socialAccounts) {
        if (eachSocialAccount.socialType == "TikTok") {
          tiktokUsername = eachSocialAccount.userIdentifier;
        }
      }

      await TikTokScraper.user(tiktokUsername, options);

      res.status(200).send("success");
    } catch (err) {
      console.log(err);
      console.log("download tiktok error");
      res.status(500).send(err);
    }
  },

  saveTikToksLimit: async (req, res, next) => {
    try {
      console.log("saving tiktoks");

      const { userId } = req.params;

      let tiktokUsername;
      const user = await User.findById(userId);
      for (const eachSocialAccount of user.socialAccounts) {
        if (eachSocialAccount.socialType == "TikTok") {
          tiktokUsername = eachSocialAccount.userIdentifier;
        }
      }

      const [uploadedVideos, rawJsonFile] = await uploadByFolder(
        `./tiktok-videos/${tiktokUsername}/`,
        ".mp4"
      );

      const screenShots = [];
      for (const videoFile of uploadedVideos) {
        let newImageName = videoFile.Key.slice(0, -4);
        screenShots.push(
          screenshotTiktok(
            newImageName,
            `./tiktok-videos/${tiktokUsername}/`,
            videoFile.Location
          )
        );
      }
      await Promise.all(screenShots);

      const [uploadedImages, _] = await uploadByFolder(
        `./tiktok-videos/${tiktokUsername}/`,
        ".png"
      );

      // data processing
      const videoAndImageS3 = {};
      let videoKey;
      let imageKey;
      const jsonObj = JSON.parse(rawJsonFile);
      for (let i = 0; i < uploadedVideos.length; i++) {
        videoKey = uploadedVideos[i].Key.slice(0, -4);
        imageKey = uploadedImages[i].Key.slice(0, -4);
        jsonKey = jsonObj[i].id;

        if (!(videoKey in videoAndImageS3)) {
          videoAndImageS3[videoKey] = {};
        }
        if (!(imageKey in videoAndImageS3)) {
          videoAndImageS3[imageKey] = {};
        }
        if (!(jsonKey in videoAndImageS3)) {
          videoAndImageS3[jsonKey] = {};
        }

        videoAndImageS3[videoKey].video = uploadedVideos[i].Location;
        videoAndImageS3[imageKey].image = uploadedImages[i].Location;
        videoAndImageS3[jsonKey].caption = jsonObj[i].text;
        videoAndImageS3[jsonKey].createTime = jsonObj[i].createTime;
        videoAndImageS3[jsonKey].proShareCount = jsonObj[i].shareCount;
      }

      // saving to mongo
      const savedVideos = [];
      for (const [key, value] of Object.entries(videoAndImageS3)) {
        savedVideos.push(saveTikTokVideo(key, value, userId, tiktokUsername));
      }
      await Promise.all(savedVideos);

      if (fs.existsSync(`./tiktok-videos/${tiktokUsername}/`)) {
        await del(`./tiktok-videos/${tiktokUsername}/`);
      }

      res.status(200).send("success");
    } catch (err) {
      console.log(err);
      console.log("save tiktok error");
      res.status(500).send(err);
    }
  },

  deleteTikTokFolder: async (req, res, next) => {
    if (fs.existsSync(`./tiktok-videos/`)) {
      await del(`./tiktok-videos/`);
    }
    res.status(200).send("success");
  },

  createTikTokFolder: async (req, res, next) => {
    if (!fs.existsSync(`./tiktok-videos/`)) {
      fs.mkdirSync(`./tiktok-videos/`, { recursive: true });
    }
    res.status(200).send("success");
  },
};

module.exports = DownloadTiktoksController;
