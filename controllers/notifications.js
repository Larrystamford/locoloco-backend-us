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
    const subscriptionRequest = req.body;
    const newSubscriptionRequest = new PushNotificationSubscription(
      subscriptionRequest
    );
    await newSubscriptionRequest.save();

    res.status(201).json("success");
  },

  sendPushNotification: async (req, res, next) => {
    const subscriptionId = req.params.id;
    const pushSubscription = subscriptions[subscriptionId];

    await webpush
      .sendNotification(
        pushSubscription,
        JSON.stringify({
          title: "New Product Available ",
          text: "HEY! Take a look at this brand new t-shirt!",
          image:
            "https://media2locoloco.s3-ap-southeast-1.amazonaws.com/icon-192x192.png",
          tag: "new-product",
          url: "https://www.shoplocoloco.com/",
        })
      )
      .catch((err) => {
        console.log(err);
      });

    console.log("sents");
    res.status(202).json({});
  },

  massSendPushNotification: async (req, res, next) => {
    const { title, text, image, tag, url } = req.body;
    const listOfPushNotificationSubscriptions = await PushNotificationSubscription.find();

    const notificationPromises = [];
    for (const eachSubscriptionObject of listOfPushNotificationSubscriptions) {
      let pushSubscription = {};
      pushSubscription.keys = eachSubscriptionObject.keys;
      pushSubscription.endpoint = eachSubscriptionObject.endpoint;
      pushSubscription.expirationTime = eachSubscriptionObject.expirationTime;

      notificationPromises.push(
        webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: title,
            text: text,
            image: image,
            tag: tag,
            url: url,
          })
        )
      );
    }

    Promise.all(notificationPromises)
      .then((values) => {
        // console.log(values);
        console.log("done");
      })
      .catch((err) => {
        console.log(err);
      });

    res.status(200).json({
      message: "success",
    });
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
