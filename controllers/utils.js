const Video = require("../models/video");
const Item = require("../models/item");
const User = require("../models/user");
const Notification = require("../models/notification");
const Admin = require("../models/admin");
const { addVideoToFeed } = require("../service/feed");
const videoItemService = require("../service/video_and_item");

var mongoose = require("mongoose");

var util = require("util"),
  OperationHelper = require("apac").OperationHelper;

var opHelper = new OperationHelper({
  awsId: process.env.AWS_ACCESS_ID,
  awsSecret: process.env.AWS_SECRET_KEY,
  assocId: "shoplocoloc06-20",
});

const {
  uploadByFolder,
  screenshotTiktok,
  readJsonInfo,
  getTikTokJson,
  CdnLinktoS3Link,
  getOpenGraphImage1,
  getOpenGraphImage2,
} = require("../service/upload");

let UtilsController = {
  addNewFieldToCollection: async (req, res, next) => {
    Video.update(
      {},
      { $set: { comments: [] } },
      { upsert: false, multi: true }
    );
    const results = await Video.find();
    res.status(200).send(results);
  },

  // broadcast Notification to Inbox of user
  broadcastNotification: async (req, res, next) => {
    const notification = new Notification(req.body);
    try {
      await notification.save();

      await User.updateMany(
        {},
        {
          $push: { notifications: notification },
        }
      );

      res.status(200).send("success");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // temporary use
  addExistingVideosToFeed: async (req, res, next) => {
    try {
      const listOfVideosItems = await Video.find().sort({
        createdAt: -1,
        timeCreated: -1,
      });

      for (eachVideo of listOfVideosItems) {
        await addVideoToFeed(eachVideo._id, eachVideo.categories);
      }

      res.status(200).send("success");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // temporary use
  changeSeaToUsLinks: async (req, res, next) => {
    try {
      const listOfVideosItems = await Video.find();
      for (eachVideo of listOfVideosItems) {
        let videoUrl = eachVideo.url;
        let videoCoverImageUrl = eachVideo.coverImageUrl;

        let newVideoUrl = videoUrl.split(".com");
        newVideoUrl = "https://dciv99su0d7r5.cloudfront.net/" + newVideoUrl[1];

        let newVideoCoverImageUrl = videoCoverImageUrl.split(".com");
        newVideoCoverImageUrl =
          "https://dciv99su0d7r5.cloudfront.net/" + newVideoCoverImageUrl[1];

        console.log(newVideoUrl);

        console.log(newVideoCoverImageUrl);
        eachVideo.url = newVideoUrl;
        eachVideo.coverImageUrl = newVideoCoverImageUrl;

        await eachVideo.save();
      }

      const listOfItems = await Item.find();
      for (eachItem of listOfItems) {
        let imageUrl = eachItem.image;

        let newImageUrl = imageUrl.split(".com");
        newImageUrl = "https://dciv99su0d7r5.cloudfront.net/" + newImageUrl[1];

        console.log(newImageUrl);

        eachItem.image = newImageUrl;

        await eachItem.save();
      }

      res.status(200).send("success");
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // temporary use
  createAdmin: async (req, res, next) => {
    try {
      const newAdmin = new Admin({
        userId: mongoose.Types.ObjectId("5fdb8fc88dc4cb1ef7f727e5"),
      });
      await newAdmin.save();
      res.status(200).send(newAdmin);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // temporary use for changing amazon reviews
  changeAmazonLinks: async (req, res, next) => {
    try {
      const listOfVideosItems = await Video.find();
      for (eachVideo of listOfVideosItems) {
        eachVideo.url = eachVideo.url.replace(
          "https://media2locoloco-us.s3.amazonaws.com/",
          "https://dciv99su0d7r5.cloudfront.net/"
        );
        eachVideo.coverImageUrl = eachVideo.coverImageUrl.replace(
          "https://media2locoloco-us.s3.amazonaws.com/",
          "https://dciv99su0d7r5.cloudfront.net/"
        );

        // eachVideo.reviews = [];
        // eachVideo.reviewCounts = 0;
        // eachVideo.totalReviewRating = 0;
        await eachVideo.save();
      }
      res.status(201).send("done");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  convertCDNToFile: async (req, res, next) => {
    try {
      const cdnLink =
        "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/6baa7d9c989f48638ad6d37568520047_1621507449~tplv-dmt-logom:tos-alisg-pv-0037/0d659de4408245e49b64fc193b76a7d6.image?x-expires=1621526400&x-signature=4J3rEzKKbY%2FvDzn5oHX%2FNNx7j%2Fc%3D";

      let s3link = await CdnLinktoS3Link(cdnLink);
      console.log(s3link);

      res.status(201).send(s3link);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  getImageURLByScrapping: async (req, res, next) => {
    try {
      const webLink =
        "https://www.lazada.sg/products/baseus-4pcs-car-clip-hook-cable-organiser-for-usb-cable-key-earphone-storage-management-protector-wall-hook-hanger-auto-sticker-holder-i481878022-s1314966183.html?spm=a2o42.pdp_revamp.0.0.394566f2kc3Y61&promotionId=91471120584690";

      let imgLink = await getOpenGraphImage1(webLink);
      if (!imgLink) {
        imgLink = await getOpenGraphImage2(webLink);
      }

      if (!imgLink) {
        for (let i = 0; i < 20; i++) {
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

      if (imgLink) {
        try {
          imgLink = await CdnLinktoS3Link(imgLink);
        } catch {
          console.log("not a cdn link");
        }
      }

      res.status(201).send({ imgLink: imgLink });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  getAmazonProductDetails: async (req, res, next) => {
    try {
      opHelper.execute(
        "ItemLookup",
        {
          ItemId: "B08B55P42N",
          MechantId: "All",
          Condition: "All",
          ResponseGroup: "Medium",
        },
        function (error, results) {
          if (error) {
            console.log("Error: " + error + "\n");
          }
          console.log(results);
          console.log("Results:\n" + util.inspect(results) + "\n");
        }
      );

      res.status(201).send("success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  // temporary use
  createAllProductLinks: async (req, res, next) => {
    try {
      // const allUsers = await User.find().populate({
      //   path: "videos",
      // });

      // for (eachUser of allUsers) {
      //   let userVideos = eachUser.videos;
      //   let allProductLinks = [];

      //   for (eachVideo of userVideos) {
      //     for (eachProduct of eachVideo.affiliateProducts) {
      //       eachProduct["itemId"] = eachProduct.id;
      //     }
      //   }
      // break;
      // eachUser.allProductLinks = allProductLinks;

      // await eachUser.save();
      // const checkUSer = await User.findById({ _id: eachUser._id });
      // console.log(eachUser.userName);
      // console.log(eachUser.allProductLinks);

      const listOfVideosItems = await Video.find();
      for (const eachVideo of listOfVideosItems) {
        let productList = [];
        for (const eachProduct of eachVideo.affiliateProducts) {
          eachProduct["itemId"] = eachProduct.id;
          productList.push(eachProduct);
        }

        eachVideo.affiliateProducts = productList;
        eachVideo.markModified("affiliateProducts");
        // console.log(eachVideo.affiliateProducts);
        await eachVideo.save();
        const checkUSer = await Video.findById({ _id: eachVideo._id });
        console.log(checkUSer.affiliateProducts);
      }

      res.status(201).send("done");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};

module.exports = UtilsController;

// const checkForSpecialChar = function (char) {
//   const specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
//   if (specialChars.includes(char)) {
//     return true;
//   }

//   return false;
// };

// if (imgLink) {
//   while (checkForSpecialChar(imgLink[0])) {
//     imgLink = imgLink.substring(1);
//   }
// }
