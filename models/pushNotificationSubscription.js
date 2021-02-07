const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema

const pushNotificationSubscriptionSchema = new Schema(
  {
    endpoint: String,
    expirationTime: String,
    keys: {
      p256dh: String,
      auth: String,
    },
  },
  { timestamps: true }
);

const PushNotificationSubscription = mongoose.model(
  "PushNotificationSubscription",
  pushNotificationSubscriptionSchema
);

module.exports = PushNotificationSubscription;
