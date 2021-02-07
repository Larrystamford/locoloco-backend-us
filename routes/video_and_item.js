const router = require("express-promise-router")();
const videoAndItemController = require("../controllers/video_and_item");

// router.route("/list_videos").get(videoAndItemController.listVideos);
// router.route("/list_items").get(videoAndItemController.listItems);
// router.route("/list_videos_items").get(videoAndItemController.listVideosItems);

router.route("/list_videos_items").get(videoAndItemController.listVideosItems);

router
  .route("/list_videos_items_by_categories/:category")
  .get(videoAndItemController.listVideosItemsByCategory);

router
  .route("/getByVideoId/:videoId")
  .get(videoAndItemController.getVideosItemsByVideoId);

router
  .route("/getItemByItemId/:itemId")
  .get(videoAndItemController.getItemByItemId);

router.route("/createVideo/:userId").post(videoAndItemController.createVideo);
router.route("/createItem/:videoId").post(videoAndItemController.createItem);
router
  .route("/uploadVideoAndItem/:userId")
  .post(videoAndItemController.uploadVideoAndItem);

// actions to take after item has been purchased
router
  .route("/handleItemPurchase")
  .put(videoAndItemController.handleItemPurchase);

router
  .route("/revertItemPurchase")
  .put(videoAndItemController.revertItemPurchase);

module.exports = router;
