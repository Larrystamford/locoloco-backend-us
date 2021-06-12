const Review = require("../models/review");
const User = require("../models/user");
const Video = require("../models/video");
const fs = require("fs");

const {
  uploadByFolder,
  screenshotTiktok,
  readJsonInfo,
  getTikTokJson,
  CdnLinktoS3Link,
} = require("../service/upload");

const {
  saveTikTokVideo,
  execDownloadTikTokPromise,
  execInstallTTScrapper,
} = require("../service/video_and_item");

const TikTokScraper = require("tiktok-scraper");
const del = require("del");

var mongoose = require("mongoose");
const { video } = require("tiktok-scraper");
const { ConsoleTransportOptions } = require("winston/lib/winston/transports");

const defaultOptions = {
  number: 50,
  sessionList: ["sid_tt=bb1a8ea6181501d2a07acb57ba48b2f6"],

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
  //   'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4146.152 Safari/537.36',
  //   referer: 'https://www.tiktok.com/',
  //   cookie: 'tt_webid_v2=686022008211767918'
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

      let result;
      result = await getTikTokJson(userId, defaultOptions);
      if (result != "success") {
        for (let i = 0; i < 3; i++) {
          console.log("retry " + i);
          result = await getTikTokJson(userId, defaultOptions);
          if (result == "success") {
            break;
          }
        }
      }

      if (result != "success") {
        throw new Error("get tiktok json failed");
      }

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
        await User.findByIdAndUpdate(
          { _id: userId },
          {
            noNewTiktokVideos: false,
          }
        );

        await TikTokScraper.user(tiktokUsername, options);
      } else {
        await User.findByIdAndUpdate(
          { _id: userId },
          {
            noNewTiktokVideos: true,
          }
        );
      }

      console.log("success");

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
        const uploadedVideos = await uploadByFolder(
          `./tiktok-videos/${tiktokUsername}/`,
          ".mp4"
        );

        let rawJsonFile;
        try {
          rawJsonFile = await readJsonInfo(
            "./tiktok-videos/" + tiktokUsername + "-info/"
          );
        } catch {
          let result;
          result = await getTikTokJson(userId, defaultOptions);
          if (result != "success") {
            for (let i = 0; i < 5; i++) {
              console.log("retry " + i);
              result = await getTikTokJson(userId, defaultOptions);
              if (result == "success") {
                break;
              }
            }
          }

          if (result != "success") {
            throw new Error("get tiktok json failed");
          }

          rawJsonFile = await readJsonInfo(
            "./tiktok-videos/" + tiktokUsername + "-info/"
          );
        }

        const jsonObj = JSON.parse(rawJsonFile);

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

        const uploadedImages = await uploadByFolder(
          `./tiktok-videos/${tiktokUsername}/`,
          ".png"
        );

        // data processing
        const videoAndImageS3 = {};
        let videoKey;
        let imageKey;
        let jsonIndex;
        let s3Link;

        for (let i = 0; i < uploadedVideos.length; i++) {
          videoKey = uploadedVideos[i].Key.slice(0, -4);
          imageKey = uploadedImages[i].Key.slice(0, -4);

          for (let i = 0; i < jsonObj.length; i++) {
            if (jsonObj[i].id == videoKey) {
              jsonIndex = i;
              break;
            }
          }

          try {
            s3Link = await CdnLinktoS3Link(jsonObj[jsonIndex].covers.default);
          } catch (e) {
            console.log(e);
            console.log(jsonObj[jsonIndex]);
            s3Link = "";
          }

          if (videoKey && !(videoKey in videoAndImageS3)) {
            videoAndImageS3[videoKey] = {};

            videoAndImageS3[videoKey].tiktokImage = s3Link;
            videoAndImageS3[videoKey].caption = jsonObj[jsonIndex].text;
            videoAndImageS3[videoKey].createTime =
              jsonObj[jsonIndex].createTime;
            videoAndImageS3[videoKey].proShareCount =
              jsonObj[jsonIndex].shareCount * 20 +
              Math.floor(Math.random() * 40) +
              20;
            videoAndImageS3[videoKey].video = uploadedVideos[i].Location;
            videoAndImageS3[videoKey].image = uploadedImages[i].Location;
          }
        }

        // saving to mongo
        const savedVideos = [];
        for (const [key, value] of Object.entries(videoAndImageS3)) {
          if (value.video) {
            savedVideos.push(
              saveTikTokVideo(key, value, userId, tiktokUsername, "")
            );
          }
        }
        await Promise.all(savedVideos);

        if (jsonObj.length > 0) {
          await User.findByIdAndUpdate(
            { _id: userId },
            {
              latestTikTokVideoId: jsonObj[0].id,
            }
          );
        }
      }

      try {
        if (fs.existsSync(`./tiktok-videos/${tiktokUsername}/`)) {
          await del(`./tiktok-videos/${tiktokUsername}/`);
        }
        if (fs.existsSync(`./tiktok-videos/${tiktokUsername + "-info"}/`)) {
          await del(`./tiktok-videos/${tiktokUsername + "-info"}/`);
        }
      } catch (e) {
        console.log(e);
      }

      res.status(200).send("success");
    } catch (err) {
      console.log(err);
      console.log("save tiktok error");
      res.status(500).send(err);
    }
  },

  unpublish: async (req, res, next) => {
    const { userId, videoId } = req.body;
    try {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { proVideos: videoId } }
      );

      res.status(201).send("success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  tiktokProOrAll: async (req, res, next) => {
    const { userId, tiktokProOrAll } = req.body;
    try {
      await User.findByIdAndUpdate(
        { _id: userId },
        { tiktokProOrAll: tiktokProOrAll }
      );

      res.status(201).send("success");
    } catch (err) {
      console.log(err);
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

  getVideoByUrl: async (req, res, next) => {
    const { userId, videoUrl } = req.body;
    try {
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
      fs.mkdirSync(`./tiktok-videos/${tiktokUsername}/`, { recursive: true });

      const options = defaultOptions;
      options.filetype = "json";
      options.download = false;

      // data processing
      const videoAndImageS3 = {};
      let videoKey;
      let coverImageS3Link;

      await execDownloadTikTokPromise(
        videoUrl,
        `./tiktok-videos/${tiktokUsername}/`
      );
      const uploadedVideos = await uploadByFolder(
        `./tiktok-videos/${tiktokUsername}/`,
        ".mp4"
      );
      uploadedVideos[0].Location = uploadedVideos[0].Location.replace(
        "https://media2locoloco-us.s3.amazonaws.com/",
        "https://dciv99su0d7r5.cloudfront.net/"
      );

      let videoJson = await TikTokScraper.getVideoMeta(videoUrl, options);
      if (videoJson && videoJson.collector && videoJson.collector.length > 0) {
        coverImageS3Link = await CdnLinktoS3Link(
          videoJson.collector[0].imageUrl
        );
        await screenshotTiktok(
          videoKey,
          `./tiktok-videos/${tiktokUsername}/`,
          uploadedVideos[0].Location
        );
        const uploadedImages = await uploadByFolder(
          `./tiktok-videos/${tiktokUsername}/`,
          ".png"
        );

        videoKey = videoJson.collector[0].id;
        videoAndImageS3[videoKey] = {};
        videoAndImageS3[videoKey].video = uploadedVideos[0].Location;
        videoAndImageS3[videoKey].tiktokImage = coverImageS3Link;
        videoAndImageS3[videoKey].image = uploadedImages[0].Location;

        videoAndImageS3[videoKey].caption = videoJson.collector[0].text;
        videoAndImageS3[videoKey].createTime =
          videoJson.collector[0].createTime;
        videoAndImageS3[videoKey].proShareCount =
          videoJson.collector[0].shareCount * 20 +
          Math.floor(Math.random() * 40) +
          20;
      }

      // saving to mongo
      const savedVideos = [];
      for (const [key, value] of Object.entries(videoAndImageS3)) {
        if (value.video) {
          savedVideos.push(
            saveTikTokVideo(key, value, userId, tiktokUsername, videoUrl)
          );
        }
      }
      await Promise.all(savedVideos);

      await User.findByIdAndUpdate(
        { _id: userId },
        {
          latestTikTokVideoId: videoKey,
        }
      );

      try {
        if (fs.existsSync(`./tiktok-videos/${tiktokUsername}/`)) {
          await del(`./tiktok-videos/${tiktokUsername}/`);
        }
      } catch (e) {
        console.log(e);
      }

      res.status(201).send("success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  installTTScrapper: async (req, res, next) => {
    let hello = await TikTokScraper.user("larrystamford");
    console.log(hello);

    // hello = await TikTokScraper.getVideoMeta(
    //   "https://vt.tiktok.com/ZSJxDFDWU/",
    //   {
    //     download: true,
    //     headers: {
    //       "user-agent":
    //         "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4159.162 Safari/537.36",
    //       referer: "https://www.tiktok.com/",
    //       cookie:
    //         "tt_webid_v2=6972862576631924225; tt_webid=6972862576631924225; tt_csrf_token=LECs00KMIH9CvpirlEdkhN1J; ttwid=1|16eapHLj42V-VOeeAiINS5JRQrMjE4_zWCGS-YrN39M|1623496096|26e7acc45604d3461afac27d6ed4074c80d5d2c533c1f7fa9d998b9523f13a38",
    //     },
    //     filepath: "./tiktok-videos/",
    //   }
    // );
    // console.log(hello);
    res.status(200).send("success");
  },
};

module.exports = DownloadTiktoksController;
