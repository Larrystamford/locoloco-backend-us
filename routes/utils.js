const router = require("express-promise-router")();
const UtilsController = require("../controllers/utils");

router
  .route("/addNewFieldToCollection/")
  .post(UtilsController.addNewFieldToCollection);

router
  .route("/broadcastNotification")
  .post(UtilsController.broadcastNotification);

router
  .route("/addExistingVideosToFeed")
  .get(UtilsController.addExistingVideosToFeed);

router.route("/changeSeaToUsLinks").get(UtilsController.changeSeaToUsLinks);
router.route("/changeAmazonLinks").get(UtilsController.changeAmazonLinks);

router.route("/createAdmin").get(UtilsController.createAdmin);

router.route("/convertCDNToFile").get(UtilsController.convertCDNToFile);

router
  .route("/getImageURLByScrapping")
  .get(UtilsController.getImageURLByScrapping);

router
  .route("/getAmazonProductDetails")
  .get(UtilsController.getAmazonProductDetails);

module.exports = router;
