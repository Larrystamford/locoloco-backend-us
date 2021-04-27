const router = require("express-promise-router")();
const downloadTiktoksController = require("../controllers/download-tiktoks");

router.route("/getTikToksFromUser/:username").get(downloadTiktoksController.getTikToksFromUser);

module.exports = router;
