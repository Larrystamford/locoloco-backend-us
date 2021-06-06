const router = require("express-promise-router")();
const downloadTiktoksController = require("../controllers/download-tiktoks");

router.route("/getInfo/:userId").get(downloadTiktoksController.getInfo);
router.route("/download/:userId").get(downloadTiktoksController.download);
router.route("/saveTikToks/:userId").get(downloadTiktoksController.saveTikToks);

router
  .route("/createTikTokFolder")
  .get(downloadTiktoksController.createTikTokFolder);
router
  .route("/deleteTikTokFolder")
  .get(downloadTiktoksController.deleteTikTokFolder);

router.route("/unpublish").put(downloadTiktoksController.unpublish);

router.route("/tiktokProOrAll").put(downloadTiktoksController.tiktokProOrAll);

module.exports = router;
