const router = require("express-promise-router")();
const feedController = require("../controllers/feed");

router.route("/list_videos_items").get(feedController.listVideosItems);
router
  .route("/list_videos_items_by_categories/:category")
  .get(feedController.listVideosItemsByCategory);

module.exports = router;
