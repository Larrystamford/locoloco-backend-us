const router = require("express-promise-router")();
const likesForVideosController = require("../controllers/likesForVideos");

router.route("/like").post(likesForVideosController.like);
router.route("/unlike").post(likesForVideosController.unlike);
router
  .route("/isLiked/:likerId/:videoId")
  .get(likesForVideosController.isLiked);

module.exports = router;
