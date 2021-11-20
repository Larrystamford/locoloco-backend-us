const Video = require('../models/video')
const Item = require('../models/item')
const User = require('../models/user')
const Notification = require('../models/notification')
const Admin = require('../models/admin')
const { addVideoToFeed } = require('../service/feed')
const videoItemService = require('../service/video_and_item')
const rp = require('request-promise')

var mongoose = require('mongoose')

var util = require('util'),
  OperationHelper = require('apac').OperationHelper

var opHelper = new OperationHelper({
  awsId: process.env.AWS_ACCESS_ID,
  awsSecret: process.env.AWS_SECRET_KEY,
  assocId: 'shoplocoloc06-20',
})

const {
  uploadByFolder,
  screenshotTiktok,
  readJsonInfo,
  getTikTokJson,
  CdnLinktoS3Link,
  getOpenGraphImage1,
  getOpenGraphImage2,
} = require('../service/upload')

let UtilsController = {
  addNewFieldToCollection: async (req, res, next) => {
    Video.update({}, { $set: { comments: [] } }, { upsert: false, multi: true })
    const results = await Video.find()
    res.status(200).send(results)
  },

  // broadcast Notification to Inbox of user
  broadcastNotification: async (req, res, next) => {
    const notification = new Notification(req.body)
    try {
      await notification.save()

      await User.updateMany(
        {},
        {
          $push: { notifications: notification },
        },
      )

      res.status(200).send('success')
    } catch (err) {
      res.status(500).send(err)
    }
  },

  // temporary use
  addExistingVideosToFeed: async (req, res, next) => {
    try {
      const listOfVideosItems = await Video.find().sort({
        createdAt: -1,
        timeCreated: -1,
      })

      for (eachVideo of listOfVideosItems) {
        await addVideoToFeed(eachVideo._id, eachVideo.categories)
      }

      res.status(200).send('success')
    } catch (err) {
      res.status(500).send(err)
    }
  },

  // temporary use
  changeSeaToUsLinks: async (req, res, next) => {
    try {
      const listOfVideosItems = await Video.find()
      for (eachVideo of listOfVideosItems) {
        let videoUrl = eachVideo.url
        let videoCoverImageUrl = eachVideo.coverImageUrl

        let newVideoUrl = videoUrl.split('.com')
        newVideoUrl = 'https://dciv99su0d7r5.cloudfront.net/' + newVideoUrl[1]

        let newVideoCoverImageUrl = videoCoverImageUrl.split('.com')
        newVideoCoverImageUrl =
          'https://dciv99su0d7r5.cloudfront.net/' + newVideoCoverImageUrl[1]

        console.log(newVideoUrl)

        console.log(newVideoCoverImageUrl)
        eachVideo.url = newVideoUrl
        eachVideo.coverImageUrl = newVideoCoverImageUrl

        await eachVideo.save()
      }

      const listOfItems = await Item.find()
      for (eachItem of listOfItems) {
        let imageUrl = eachItem.image

        let newImageUrl = imageUrl.split('.com')
        newImageUrl = 'https://dciv99su0d7r5.cloudfront.net/' + newImageUrl[1]

        console.log(newImageUrl)

        eachItem.image = newImageUrl

        await eachItem.save()
      }

      res.status(200).send('success')
    } catch (err) {
      res.status(500).send(err)
    }
  },

  // temporary use
  createAdmin: async (req, res, next) => {
    try {
      const newAdmin = new Admin({
        userId: mongoose.Types.ObjectId('5fdb8fc88dc4cb1ef7f727e5'),
      })
      await newAdmin.save()
      res.status(200).send(newAdmin)
    } catch (err) {
      res.status(500).send(err)
    }
  },

  // temporary use for changing amazon reviews
  changeAmazonLinks: async (req, res, next) => {
    try {
      const listOfVideosItems = await Video.find()
      for (eachVideo of listOfVideosItems) {
        eachVideo.url = eachVideo.url.replace(
          'https://media2locoloco-us.s3.amazonaws.com/',
          'https://dciv99su0d7r5.cloudfront.net/',
        )
        eachVideo.coverImageUrl = eachVideo.coverImageUrl.replace(
          'https://media2locoloco-us.s3.amazonaws.com/',
          'https://dciv99su0d7r5.cloudfront.net/',
        )

        // eachVideo.reviews = [];
        // eachVideo.reviewCounts = 0;
        // eachVideo.totalReviewRating = 0;
        await eachVideo.save()
      }
      res.status(201).send('done')
    } catch (err) {
      console.log(err)
      res.status(500).send(err)
    }
  },

  convertCDNToFile: async (req, res, next) => {
    try {
      const { cdnLink } = req.body
      console.log(cdnLink)
      let s3link = await CdnLinktoS3Link(
        'https://v39-as.tiktokcdn.com/e9aca426d49a6c00240311caf021cfc3/6192b0d4/video/tos/useast2a/tos-useast2a-ve-0068c004/05e5d9dd05734da3ad8fe6ed7016f2ab/?a=1233&br=1796&bt=898&cd=0%7C0%7C1&ch=0&cr=0&cs=0&cv=1&dr=0&ds=3&er=&ft=wZmopFaWkag3-I&l=20211115131108010245242249232D22B1&lr=tiktok_m&mime_type=video_mp4&net=0&pl=0&qs=0&rc=amg5cTw6Zms1ODMzNzczM0ApOmU6NmY5NzxkN2k6ZjUzPGcycmJfcjRnZ25gLS1kMTZzc2EtMWMuNTQxM2IuMTItLy86Yw%3D%3D&vl=&vr=',
      )
      console.log(s3link)

      res.status(201).send(s3link)
    } catch (err) {
      console.log(err)
      res.status(500).send(err)
    }
  },

  getImageURLByScrapping: async (req, res, next) => {
    try {
      const webLink =
        'https://www.lazada.sg/products/baseus-4pcs-car-clip-hook-cable-organiser-for-usb-cable-key-earphone-storage-management-protector-wall-hook-hanger-auto-sticker-holder-i481878022-s1314966183.html?spm=a2o42.pdp_revamp.0.0.394566f2kc3Y61&promotionId=91471120584690'

      let imgLink = await getOpenGraphImage1(webLink)
      if (!imgLink) {
        imgLink = await getOpenGraphImage2(webLink)
      }

      if (!imgLink) {
        for (let i = 0; i < 20; i++) {
          console.log('retry ' + i)
          imgLink = await getOpenGraphImage1(webLink)
          if (!imgLink) {
            imgLink = await getOpenGraphImage2(webLink)
          }

          if (imgLink) {
            break
          }
        }
      }

      if (imgLink) {
        try {
          imgLink = await CdnLinktoS3Link(imgLink)
        } catch {
          console.log('not a cdn link')
        }
      }

      res.status(201).send({ imgLink: imgLink })
    } catch (err) {
      console.log(err)
      res.status(500).send(err)
    }
  },

  getAmazonProductDetails: async (req, res, next) => {
    try {
      opHelper.execute(
        'ItemLookup',
        {
          ItemId: 'B08B55P42N',
          MechantId: 'All',
          Condition: 'All',
          ResponseGroup: 'Medium',
        },
        function (error, results) {
          if (error) {
            console.log('Error: ' + error + '\n')
          }
          console.log(results)
          console.log('Results:\n' + util.inspect(results) + '\n')
        },
      )

      res.status(201).send('success')
    } catch (err) {
      console.log(err)
      res.status(500).send(err)
    }
  },

  getRedirectedLink: async (req, res, next) => {
    try {
      const {
        query: { webLink },
      } = req

      const redirectedLink = await new Promise((resolve, reject) => {
        rp({ url: webLink, followAllRedirects: true }, (err, res, body) => {
          // hard coded for shopee's universal-link
          let lastLink = res.request.uri.href
          resolve(lastLink)
        })
      })

      let extract = redirectedLink.split('video/')

      function isNumeric(value) {
        return /^-?\d+$/.test(value)
      }

      if (extract.length > 1) {
        let tiktokVideoId = extract[1]
        for (let i = 0; i < tiktokVideoId.length; i++) {
          if (!isNumeric(tiktokVideoId[i])) {
            extract = tiktokVideoId.slice(0, i)
            break
          }
        }
      }

      res
        .status(201)
        .send({ redirectedLink: redirectedLink, tiktokVideoId: extract })
    } catch (err) {
      console.log(err)
      return 'error'
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

      const listOfVideosItems = await Video.find()
      for (const eachVideo of listOfVideosItems) {
        let productList = []
        for (const eachProduct of eachVideo.affiliateProducts) {
          eachProduct['itemId'] = eachProduct.id
          productList.push(eachProduct)
        }

        eachVideo.affiliateProducts = productList
        eachVideo.markModified('affiliateProducts')
        // console.log(eachVideo.affiliateProducts);
        await eachVideo.save()
        const checkUSer = await Video.findById({ _id: eachVideo._id })
        console.log(checkUSer.affiliateProducts)
      }

      res.status(201).send('done')
    } catch (err) {
      console.log(err)
      res.status(500).send(err)
    }
  },

  // temporary use
  migrateToProLinks: async (req, res, next) => {
    const {
      query: { item, count },
    } = req
    let user = await User.findOne({ userName: 'larry1' })

    // let updateObj = {
    //   proLinks: [],
    // }
    user.proLinks[item]['linkClickCount'] = parseInt(count)

    // for (const eachItemLink of user.proLinks) {
    //   updateObj.proLinks.push({
    //     id: eachItemLink.id,
    //     proLink: eachItemLink.proLink,
    //     proLinkName: eachItemLink.proLinkName,
    //     productImageLink: eachItemLink.productImageLink,
    //     linkClickCount: 4,
    //   })
    // }
    console.log(user.proLinks)
    await User.findByIdAndUpdate(
      { _id: '61895f08be3ebf41072c61db' },
      user.proLinks,
    )

    let user2 = await User.findOne({ userName: 'larry1' })
    console.log(user2.proLinks)
    res.status(201).send('done')
  },
}

module.exports = UtilsController

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
