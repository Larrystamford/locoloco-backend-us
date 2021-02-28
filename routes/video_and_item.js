const router = require("express-promise-router")();
const videoAndItemController = require("../controllers/video_and_item");

router
  .route("/getByVideoId/:videoId")
  .get(videoAndItemController.getVideosItemsByVideoId);

router
  .route("/getItemByItemId/:itemId")
  .get(videoAndItemController.getItemByItemId);

router.route("/createVideo/:userId").post(videoAndItemController.createVideo);
router.route("/createItem/:videoId").post(videoAndItemController.createItem);
router
  .route("/uploadVideoAndItem")
  .post(videoAndItemController.uploadVideoAndItem);

// actions to take after item has been purchased
router
  .route("/handleItemPurchase")
  .put(videoAndItemController.handleItemPurchase);

router
  .route("/revertItemPurchase")
  .put(videoAndItemController.revertItemPurchase);

router.route("/addReviews").get(videoAndItemController.addReviews);

module.exports = router;
