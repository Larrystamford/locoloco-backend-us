var crypto = require("crypto");
const webpush = require("web-push");
const User = require("../models/user");
const PushNotificationSubscription = require("../models/pushNotificationSubscription");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

webpush.setVapidDetails(
  "mailto:larrylee3107@gmail.com",
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

function createHash(input) {
  const md5sum = crypto.createHash("md5");
  md5sum.update(Buffer.from(input));
  return md5sum.digest("hex");
}

module.exports = {
  // push notifications

  handlePushNotificationSubscription: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const subscriptionRequest = req.body;

      if (!subscriptionRequest || !subscriptionRequest.endpoint) {
        throw "bad subscription request";
      }

      const userSubsciptionsExist = await User.findById(userId).populate(
        "pushNotificationSubscriptions"
      );
      const userSubsciptions =
        userSubsciptionsExist.pushNotificationSubscriptions;

      let userHasSubscription = false;
      for (const eachSubscriptionObject of userSubsciptions) {
        if (eachSubscriptionObject.endpoint == subscriptionRequest.endpoint) {
          userHasSubscription = true;
          break;
        }
      }

      if (!userHasSubscription) {
        const newSubscriptionRequest = new PushNotificationSubscription(
          subscriptionRequest
        );
        await newSubscriptionRequest.save();

        await User.updateOne(
          { _id: userId },
          {
            $addToSet: {
              pushNotificationSubscriptions: newSubscriptionRequest,
            },
          },
          { upsert: false }
        );
      }

      res.status(201).json("success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  sendPushNotification: async (req, res, next) => {
    const { userId } = req.params;
    const { title, text, image, tag, url } = req.body;
    try {
      const subscriptionExist = await User.findById(userId).populate(
        "pushNotificationSubscriptions"
      );

      let userSubsciptions = [];
      if (subscriptionExist) {
        userSubsciptions = subscriptionExist.pushNotificationSubscriptions;
      }

      for (const eachSubscriptionObject of userSubsciptions) {
        let pushSubscription = {};
        pushSubscription.keys = eachSubscriptionObject.keys;
        pushSubscription.endpoint = eachSubscriptionObject.endpoint;
        pushSubscription.expirationTime = eachSubscriptionObject.expirationTime;

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title: title,
              text: text,
              image: image,
              tag: tag,
              url: url,
            })
          );
          console.log("success notif");
        } catch (err) {
          console.log(err);
        }
      }

      res.status(200).json({
        message: "success",
      });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  massSendPushNotification: async (req, res, next) => {
    const { title, text, image, tag, url } = req.body;

    try {
      const listOfPushNotificationSubscriptions = await PushNotificationSubscription.find();

      for (const eachSubscriptionObject of listOfPushNotificationSubscriptions) {
        let pushSubscription = {};
        pushSubscription.keys = eachSubscriptionObject.keys;
        pushSubscription.endpoint = eachSubscriptionObject.endpoint;
        pushSubscription.expirationTime = eachSubscriptionObject.expirationTime;

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title: title,
              text: text,
              image: image,
              tag: tag,
              url: url,
            })
          );
          console.log("success notif");
        } catch (err) {
          console.log(err);
        }
      }

      res.status(200).json({
        message: "success",
      });
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // in app notification
  newNotificationsCount: async (req, res, next) => {
    const {
      query: { userId, lastNotificationId },
    } = req;

    try {
      let newNotificationCount = 0;
      if (userId) {
        const user = await User.findById(userId);
        const notifications = user.notifications;
        if (!lastNotificationId) {
          newNotificationCount = notifications.length;
        } else {
          for (let i = notifications.length - 1; i >= 0; i--) {
            if (notifications[i] != lastNotificationId) {
              newNotificationCount += 1;
            } else {
              break;
            }
          }
        }
      }

      res.status(200).send({
        count: newNotificationCount,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  },

  getNotifications: async (req, res, next) => {
    // for now get all notifications but later can change to pagination
    const {
      query: { userId, newNotificationCount },
    } = req;

    try {
      const user = await User.find({ _id: userId }).populate("notifications");
      console.log(user);
      const userNotifications = user[0].notifications.reverse();

      res.status(200).send(userNotifications);
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
