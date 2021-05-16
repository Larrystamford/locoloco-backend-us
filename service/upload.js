const AWS = require("aws-sdk");
const fs = require("fs");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);
const User = require("../models/user");

const path = require("path");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const TikTokScraper = require("tiktok-scraper");
const del = require("del");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

async function uploadFileToAws(file) {
  const fileName = `${new Date().getTime()}_${file.name}`;
  const mimetype = file.mimetype;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: file.data,
    ContentType: mimetype,
  };
  if (process.env.NODE_ENV === "dev") {
    params["ACL"] = "public-read";
  }
  const res = await new Promise((resolve, reject) => {
    s3.upload(params, (err, data) =>
      err == null ? resolve(data) : reject(err)
    );
  });
  return { url: res.Location };
}

async function uploadFirstFrame(data, fileName, mimetype) {
  const fileNameFirstFrame = `${new Date().getTime()}_${fileName}`;
  const paramsFirstFrame = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileNameFirstFrame,
    Body: data,
    ContentType: mimetype,
  };
  if (process.env.NODE_ENV === "dev") {
    paramsFirstFrame["ACL"] = "public-read";
  }
  const resFirstFrame = await new Promise((resolve, reject) => {
    s3.upload(paramsFirstFrame, (err, data) =>
      err == null ? resolve(data) : reject(err)
    );
  });

  return { url: resFirstFrame.Location };
}

async function readJsonInfo(folderPathName) {
  const filenames = await readdir(folderPathName);
  let jsonFileData;
  let curFileExtension;

  for (const filename of filenames) {
    curFileExtension = path.extname(filename);
    if (curFileExtension == ".json") {
      jsonFileData = await readfile(folderPathName + filename);
      break;
    }
  }

  return jsonFileData;
}

async function uploadByFolder(folderPathName, fileExtension) {
  const uploadedFiles = [];
  const filenames = await readdir(folderPathName);
  let curFileExtension;
  let fileData;
  let res;
  let params;
  let jsonFileData;

  console.log("number of downloaded videos");
  console.log(filenames.length);

  for (const filename of filenames) {
    curFileExtension = path.extname(filename);
    if (curFileExtension == fileExtension) {
      fileData = await readfile(folderPathName + filename);
      params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: filename,
        Body: fileData,
      };

      if (process.env.NODE_ENV === "dev") {
        params["ACL"] = "public-read";
      }
      res = new Promise((resolve, reject) => {
        s3.upload(params, (err, data) =>
          err == null ? resolve(data) : reject(err)
        );
      });

      uploadedFiles.push(res);
    }
  }

  return await Promise.all(uploadedFiles);
}

function ffmpegSync(uploadRes) {
  return new Promise((resolve, reject) => {
    ffmpeg(uploadRes.url)
      .screenshots({
        // Will take screens at 20%, 40%, 60% and 80% of the video
        filename: "firstFrame.png",
        timestamps: [0.001],
        folder: "./helpers/firstFrame/",
      })
      .on("end", async () => {
        console.log("Screenshot taken");
        resolve();
      });
  });
}

function screenshotTiktok(imageName, downloadToPath, videoFileLocation) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoFileLocation)
      .screenshots({
        // Will take screens at 20%, 40%, 60% and 80% of the video
        filename: imageName,
        timestamps: [0.001],
        folder: downloadToPath,
      })
      .on("end", async () => {
        console.log("Screenshot taken");
        resolve();
      });
  });
}

async function getTikTokJson(userId, defaultOptions) {
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

    return "success";
  } catch (e) {
    console.log(e);
    return "failed";
  }
}

module.exports = {
  uploadFileToAws,
  uploadFirstFrame,
  uploadByFolder,
  ffmpegSync,
  screenshotTiktok,
  readJsonInfo,
  getTikTokJson,
};
