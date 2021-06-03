const ytch = require("yt-channel-info");
const getYoutubeChannelId = require("get-youtube-channel-id");
const e = require("express");
const { CdnLinktoS3Link } = require("../service/upload");

const YoutubeVideo = require("../models/youtubeVideo");
const User = require("../models/user");

let YoutubeController = {
  getYoutubeVideosByChannel: async (req, res, next) => {
    try {
      const { userId } = req.body;

      let channelLink;
      const user = await User.findById(userId);
      for (const eachSocialAccount of user.socialAccounts) {
        if (eachSocialAccount.socialType == "Youtube") {
          channelLink = eachSocialAccount.socialLink;
        }
      }

      if (!channelLink) {
        throw new error("user has no channel link");
      }

      let channelId = false;
      channelId = await getYoutubeChannelId(channelLink);
      let getYoutubeVideos = [];

      if (channelId) {
        channelId = channelId.id;
        const youtubeChannelVideos = await ytch.getChannelVideos(
          channelId,
          "newest"
        );

        const user = await User.findById({ _id: userId }).populate(
          "youtubeVideos"
        );
        const existingYoutubeVideos = user.youtubeVideos;
        let latestYoutubeVideoId = "";

        if (existingYoutubeVideos.length > 0) {
          latestYoutubeVideoId = existingYoutubeVideos[0].videoId;
        }

        for (const video of youtubeChannelVideos.items) {
          let videoId;
          let coverImageUrl = "";
          if (video.videoId) {
            videoId = video.videoId;
          } else {
            continue;
          }

          // don't reimport old videos
          if (videoId == latestYoutubeVideoId) {
            break;
          }

          if (video.videoThumbnails && video.videoThumbnails.length > 0) {
            try {
              coverImageUrl = await CdnLinktoS3Link(
                video.videoThumbnails[video.videoThumbnails.length - 1].url
              );
            } catch {
              coverImageUrl =
                video.videoThumbnails[video.videoThumbnails.length - 1].url;
            }
          }

          let newYoutubeVideo = new YoutubeVideo({
            videoId: videoId,
            coverImageUrl: coverImageUrl,
          });

          newYoutubeVideo = await newYoutubeVideo.save();
          getYoutubeVideos.push(newYoutubeVideo);
        }

        getYoutubeVideos = [...getYoutubeVideos, ...existingYoutubeVideos];
        await User.findByIdAndUpdate(
          { _id: userId },
          {
            youtubeVideos: getYoutubeVideos,
          }
        );
      }

      res.status(200).send({
        youtubeVideos: getYoutubeVideos,
      });
    } catch (err) {
      console.log(err);
      console.log("save youtube error");
      res.status(500).send(err);
    }
  },

  update: async (req, res, next) => {
    const { youtubeVideoId } = req.params;

    try {
      await YoutubeVideo.findByIdAndUpdate({ _id: youtubeVideoId }, req.body);

      res.status(201).send("success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};

module.exports = YoutubeController;
