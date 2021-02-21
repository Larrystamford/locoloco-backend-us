const fileUploadService = require("../service/upload");
const extractFrames = require("ffmpeg-extract-frames");
var fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

async function uploadFileToAws(req, res, next) {
  try {
    if (req.files && req.files.media) {
      const file = req.files.media;
      const uploadRes = await fileUploadService.uploadFileToAws(file);

      return res.send(uploadRes);
    }
    const errMsg = {
      message: "FILES_NOT_FOUND",
      messageCode: "FILES_NOT_FOUND",
      statusCode: 404,
    };
    return res.status(404).send(errMsg);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function uploadVideoAndFirstFrameToAws(req, res, next) {
  try {
    if (req.files && req.files.media) {
      const file = req.files.media;
      const uploadRes = await fileUploadService.uploadFileToAws(file);

      // ffmpeg -i inputfile.mkv -vf "select=eq(n\,0)" -q:v 3 output_image.jpg
      // await extractFrames({
      //   input: uploadRes.url,
      //   output: "./helpers/firstFrame/firstFrame.jpg",
      //   offsets: [1],
      // });

      // taking screen shot of video
      await ffmpegSync(uploadRes);
      const data = await readFile("./helpers/firstFrame/firstFrame.png");
      const uploadFirstFrameRes = await fileUploadService.uploadFirstFrame(
        data,
        file.name + "first_frame",
        "image/png"
      );

      return res.send({
        videoUrl: uploadRes.url,
        imageUrl: uploadFirstFrameRes.url,
      });
    }
    const errMsg = {
      message: "FILES_NOT_FOUND",
      messageCode: "FILES_NOT_FOUND",
      statusCode: 404,
    };
    console.log(errMsg);
    return res.status(404).send(errMsg);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
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

module.exports = { uploadFileToAws, uploadVideoAndFirstFrameToAws };
