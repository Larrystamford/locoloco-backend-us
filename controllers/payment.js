const Item = require("../models/item");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const videoItemService = require("../service/video_and_item");

let winston = require("winston"),
  WinstonCloudWatch = require("winston-cloudwatch");

winston.add(
  new WinstonCloudWatch({
    logGroupName: "stripeBackendApis",
    logStreamName: "first",
    awsAccessKeyId: process.env.AWS_ACCESS_ID,
    awsSecretKey: process.env.AWS_SECRET_KEY,
    awsRegion: process.env.AWS_REGION,
  })
);

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = {
  createPaymentIntent: async (req, res) => {
    const { userId, sellerId, quantity, itemId } = req.body;

    const itemObject = await Item.find({ _id: itemId });

    // shipping
    // let totalPrice = Math.round(
    //   itemObject[0].price * quantity * 100 + 500 * quantity
    // );

    let totalPrice = Math.round(itemObject[0].price * quantity * 100);

    if (totalPrice == 0) {
      res.status(400).send(err);
    }

    // check and handle item stock -> handles revert if got error
    const [newBuySellItemId, error] = await videoItemService.handleItemStock(
      userId,
      sellerId,
      quantity,
      itemId
    );

    if (error == null) {
      try {
        // Create a PaymentIntent with the order amount and currency
        console.log("total price ", totalPrice);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalPrice,
          currency: "usd",
          // Verify your integration in this guide by including this parameter
          metadata: { integration_check: "accept_a_payment" },
        });

        // Send publishable key and PaymentIntent details to client
        res.send({
          status: "success",
          publishableKey: process.env.STRIPE_PUBLISH_KEY,
          clientSecret: paymentIntent.client_secret,
          newBuySellItemId: newBuySellItemId,
        });
      } catch (err) {
        // while creating payment intent, error occurred so we revert stock
        await videoItemService.handleStocksRevert(
          userId,
          sellerId,
          quantity,
          itemId,
          newBuySellItemId
        );
        console.log("failed to create payment intent", err);
        winston.error("failed to create payment intent", err.toString());
        res.send({
          status: err.toString(),
          newBuySellItemId: newBuySellItemId,
        });
      }
    } else {
      res.send({
        status: error.toString(),
        newBuySellItemId: newBuySellItemId,
      });
    }
  },

  chargeGoogleToken: async (req, res) => {
    const { googleToken, quantity, itemId, userId, sellerId } = req.body;

    const googleTokenObj = JSON.parse(googleToken);
    const itemObject = await Item.find({ _id: itemId });

    // shipping
    // let totalPrice = Math.round(
    //   itemObject[0].price * quantity * 100 + 500 * quantity
    // );

    let totalPrice = Math.round(itemObject[0].price * quantity * 100);

    if (totalPrice == 0) {
      res.status(400).send(err);
    }

    // check and handle item stock -> handles revert if got error
    const [newBuySellItemId, error] = await videoItemService.handleItemStock(
      userId,
      sellerId,
      quantity,
      itemId
    );

    if (error == null) {
      try {
        // success charge
        const charge = await stripe.charges.create({
          amount: totalPrice,
          currency: "usd",
          description: itemObject[0].name,
          source: googleTokenObj.id,
        });

        res.send({
          status: "success",
          newBuySellItemId: newBuySellItemId,
        });
      } catch (err) {
        // stripe charge error, revert item stock
        await videoItemService.handleStocksRevert(
          userId,
          sellerId,
          quantity,
          itemId,
          newBuySellItemId
        );
        console.log("stripe charging failed for google pay");
        winston.error("stripe charging failed for google pay", err.toString());
        res.send({
          status: err.toString(),
          newBuySellItemId: newBuySellItemId,
        });
      }
    } else {
      res.send({
        status: error.toString(),
        newBuySellItemId: newBuySellItemId,
      });
    }
  },
};
