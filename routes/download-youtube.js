const router = require("express-promise-router")();
const YoutubeController = require("../controllers/download-youtube");

router
  .route("/getYoutubeVideosByChannel")
  .post(YoutubeController.getYoutubeVideosByChannel);
router.route("/update/:youtubeVideoId").put(YoutubeController.update);

module.exports = router;
