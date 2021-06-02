const router = require("express-promise-router")();
const EmailController = require("../controllers/email");

router.route("/onSignUp").post(EmailController.onSignUp);
router.route("/onPurchase").post(EmailController.onPurchase);
router.route("/customerSupport").post(EmailController.customerSupport);
router.route("/customerFeedback").post(EmailController.customerFeedback);
router.route("/advertisementEmail").post(EmailController.advertisementEmail);
router.route("/influencerGetStarted").post(EmailController.influencerGetStarted);
router.route("/severeError").post(EmailController.severeError);

module.exports = router;
