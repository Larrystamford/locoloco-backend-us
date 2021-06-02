const router = require("express-promise-router")();
const YoutubeController = require("../controllers/download-youtube");

router
  .route("/getYoutubeVideosByChannel/:channelLink")
  .get(YoutubeController.getYoutubeVideosByChannel);

module.exports = router;
