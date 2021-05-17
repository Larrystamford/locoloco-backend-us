const router = require("express-promise-router")();
const voshMetricsController = require("../controllers/voshMetrics");

router.route("/incrementMetrics").post(voshMetricsController.incrementMetrics);

module.exports = router;
