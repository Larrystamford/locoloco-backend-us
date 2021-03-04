const router = require("express-promise-router")();
const reviewController = require("../controllers/review");

router.route("/postItemReview").post(reviewController.postItemReview);

module.exports = router;
