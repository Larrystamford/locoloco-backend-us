const ytch = require("yt-channel-info");

let YoutubeController = {
  getYoutubeVideosByChannel: async (req, res, next) => {
    try {
      const { channelLink } = req.params;

      const youtubeChannelVideos = await ytch.getChannelVideos(
        "UCfRtwc6K_VU9N4OjNnU2P7g",
        "newest"
      );

      for (const video of youtubeChannelVideos.items) {
        console.log(video.videoId);
      }

      res.status(200).send("success");
    } catch (err) {
      console.log(err);
      console.log("save youtube error");
      res.status(500).send(err);
    }
  },
};

module.exports = YoutubeController;
