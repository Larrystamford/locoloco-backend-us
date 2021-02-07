const router = require("express-promise-router")();
const paymentController = require("../controllers/payment");

router
  .route("/create-payment-intent")
  .post(paymentController.createPaymentIntent);

router
  .route("/charge-google-token")
  .post(paymentController.chargeGoogleToken);

module.exports = router;
