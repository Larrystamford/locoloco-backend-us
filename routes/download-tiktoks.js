const router = require("express-promise-router")();
const downloadTiktoksController = require("../controllers/download-tiktoks");

router
  .route("/download/:username")
  .get(downloadTiktoksController.download);

router
  .route("/saveTikToks/:username")
  .get(downloadTiktoksController.saveTikToks);

module.exports = router;
