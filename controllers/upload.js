const {
  uploadFileToAws,
  uploadFirstFrame,
  ffmpegSync,
} = require("../service/upload");

const {
  CdnLinktoS3Link,
  getOpenGraphImage1,
  getOpenGraphImage2,
} = require("../service/upload");

const extractFrames = require("ffmpeg-extract-frames");
var fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

async function uploadFileToAwsCtrl(req, res, next) {
  try {
    if (req.files && req.files.media) {
      const file = req.files.media;
      const uploadRes = await uploadFileToAws(file);
      uploadRes.url = uploadRes.url.replace(
        "https://media2locoloco-us.s3.amazonaws.com/",
        "https://dciv99su0d7r5.cloudfront.net/"
      );

      https: return res.send(uploadRes);
    }
    const errMsg = {
      message: "FILES_NOT_FOUND",
      messageCode: "FILES_NOT_FOUND",
      statusCode: 404,
    };
    return res.status(404).send(errMsg);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

async function uploadVideoAndFirstFrameToAws(req, res, next) {
  try {
    //     print("Input the TikTok URL")
    // url = input()
    // from TikTokApi import TikTokApi
    // api = TikTokApi()
    // video_bytes = api.get_Video_No_Watermark(url)
    // with open("tiktok.mp4", 'wb') as output:
    //     output.write(video_bytes)

    if (req.files && req.files.media) {
      const file = req.files.media;
      const uploadRes = await uploadFileToAws(file);
      const updatedCdnUrl = uploadRes.url.replace(
        "https://media2locoloco-us.s3.amazonaws.com/",
        "https://dciv99su0d7r5.cloudfront.net/"
      );
      uploadRes.url = updatedCdnUrl;

      // ffmpeg -i inputfile.mkv -vf "select=eq(n\,0)" -q:v 3 output_image.jpg
      // await extractFrames({
      //   input: uploadRes.url,
      //   output: "./helpers/firstFrame/firstFrame.jpg",
      //   offsets: [1],
      // });

      // taking screen shot of video
      await ffmpegSync(uploadRes);
      const data = await readFile("./helpers/firstFrame/firstFrame.png");
      const uploadFirstFrameRes = await uploadFirstFrame(
        data,
        file.name + "first_frame",
        "image/png"
      );

      return res.send({
        videoUrl: updatedCdnUrl,
        imageUrl: uploadFirstFrameRes.url.replace(
          "https://media2locoloco-us.s3.amazonaws.com/",
          "https://dciv99su0d7r5.cloudfront.net/"
        ),
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

async function getImageURLByScrapping(req, res, next) {
  try {
    const { webLink } = req.body;
    let productLink;

    if (
      webLink.indexOf("https://amzn.to") > -1 ||
      webLink.indexOf("https://www.amazon.com") > -1
    ) {
      productLink = "";
    } else {
      let imgLink = await getOpenGraphImage1(webLink);
      if (!imgLink && imgLink != "error") {
        imgLink = await getOpenGraphImage2(webLink);
      }

      if (!imgLink && imgLink != "error") {
        for (let i = 0; i < 1; i++) {
          console.log("retry " + i);
          imgLink = await getOpenGraphImage1(webLink);
          if (!imgLink) {
            imgLink = await getOpenGraphImage2(webLink);
          }

          if (imgLink) {
            break;
          }
        }
      }

      if (imgLink && imgLink != "error") {
        try {
          productLink = await CdnLinktoS3Link(imgLink);
        } catch (e) {
          productLink = imgLink;
        }
      } else {
        productLink = "";
      }
    }

    res.status(201).send({ productLink: productLink });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

module.exports = {
  uploadFileToAwsCtrl,
  uploadVideoAndFirstFrameToAws,
  getImageURLByScrapping,
};
