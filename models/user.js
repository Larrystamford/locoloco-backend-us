const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

// Create a Schema
const userSchema = new Schema(
  {
    method: {
      type: String,
      enum: ['local', 'google', 'facebook'],
    },

    google: {
      id: {
        type: String,
      },
      email: {
        type: String,
        lowercase: true,
      },
    },
    local: {
      email: {
        type: String,
        lowercase: true,
      },
      password: {
        type: String,
      },
    },

    authStatus: String, // temp for checking if first time user

    userName: String,
    email: String,
    firstName: String,
    lastName: String,
    picture: String,
    number: String,
    country: String,
    city: String,
    postalCode: String,
    address: String,
    profileBio: String,
    latestFeedIdPerSession: Number,
    locoCoins: Number,
    followers: [
      {
        id: String,
        userName: String,
        picture: String,
      },
    ],
    followings: [
      {
        id: String,
        userName: String,
        picture: String,
      },
    ],
    followersCount: { type: Number, default: 0 },
    purchases: [
      {
        type: Schema.Types.ObjectId,
        ref: 'BuySellItem',
      },
    ],
    sales: [
      {
        type: Schema.Types.ObjectId,
        ref: 'BuySellItem',
      },
    ],
    // video objects that the user has liked
    likedVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    likedComments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    likedSubComments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SubComment',
      },
    ],
    // videos posted by user
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    tiktokProOrAll: {
      type: Boolean,
      default: false,
    },
    // youtube videos
    youtubeVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'YoutubeVideo',
      },
    ],
    // published youtube videos
    proYoutubeVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'YoutubeVideo',
      },
    ],
    youtubeProOrAll: {
      type: Boolean,
      default: false,
    },
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Notification',
      },
    ],
    pushNotificationSubscriptions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PushNotificationSubscription',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    subComments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SubComment',
      },
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    processingTikToksStartTime: Number,
    latestTikTokVideoId: String,
    accountType: String,
    noNewTiktokVideos: Boolean,
    proVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    socialAccounts: [
      {
        id: String,
        userIdentifier: String,
        socialType: String,
        socialLink: String,
      },
    ],
    proLinks: [
      {
        id: String,
        proLinkName: String,
        proLinkDesc: String,
        proLink: String,
        proLink2: String,
        proLink3: String,
        proLink4: String,
        proLink5: String,
        productImageLink: String,
        tiktokVideoLink: String,
        tiktokEmbedLink: String,
        tiktokCoverImage: String,
        tiktokCaption: String,
        linkClickCount: { type: Number, default: 0 },
      },
    ],
    proCategories: [
      {
        id: String,
        proCategoryName: String,
        proCategoryImage: String,
      },
    ],
    proTheme: {
      arrangement: String,
      // background
      background1: {
        type: String,
        default: 'https://dciv99su0d7r5.cloudfront.net/vosh-template-bg12.jpg',
      },
      // box background
      background2: {
        type: String,
        default: 'https://dciv99su0d7r5.cloudfront.net/white_bg.jpg',
      },

      background3: { imageUrl: String, videoUrl: String },

      primaryFontColor: { type: String, default: 'black' },
      socialIconsColor: { type: String, default: 'black' },
      linkBoxColor: { type: String, default: 'slategray' },
      linkWordsColor: { type: String, default: 'white' },
      categoryWordsColor: { type: String, default: 'black' },
    },

    // sense this change
    allProductLinks: [
      {
        id: String,
        itemId: String,
        itemLink: String,
        itemLinkName: String,
        itemLinkDesc: String,
        itemImage: String,
        taggedSrcLinks: [],
      },
    ],
    // to be deprecated
    previousProductLinks: [
      {
        id: String,
        itemLink: String,
        itemLinkName: String,
        itemImage: String,
      },
    ],
    previousMainHashtags: [String],
    previousSubHashtags: [String],
    showSocialSelections: [],
  },
  { timestamps: true },
)

userSchema.methods.isValidPassword = async function (enterPassword) {
  try {
    const passwordMatch = bcrypt.compareSync(enterPassword, this.local.password)

    return passwordMatch // True if matches
  } catch (error) {
    throw new Error(error)
  }
}

const User = mongoose.model('User', userSchema)
module.exports = User
