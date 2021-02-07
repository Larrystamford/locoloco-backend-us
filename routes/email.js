const router = require("express-promise-router")();
const EmailController = require("../controllers/email");

router.route("/onSignUp").post(EmailController.onSignUp);
router.route("/onPurchase").post(EmailController.onPurchase);

module.exports = router;
