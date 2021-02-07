const router = require("express-promise-router")();
const NotificationsController = require("../controllers/notifications");

router
  .route("/handlePushNotificationSubscription/")
  .post(NotificationsController.handlePushNotificationSubscription);

router
  .route("/sendPushNotification/:id")
  .get(NotificationsController.sendPushNotification);

router
  .route("/newNotificationsCount")
  .get(NotificationsController.newNotificationsCount);

router.route("/getNotifications").get(NotificationsController.getNotifications);

router
  .route("/massSendPushNotification")
  .post(NotificationsController.massSendPushNotification);

module.exports = router;
