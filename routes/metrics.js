const router = require("express-promise-router")();
const MetricsController = require("../controllers/metrics");

router.route("/incrementMetrics").post(MetricsController.incrementMetrics);

module.exports = router;
