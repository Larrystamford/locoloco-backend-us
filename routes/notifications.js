const router = require("express-promise-router")();
const NotificationsController = require("../controllers/notifications");

router
  .route("/handlePushNotificationSubscription/:userId")
  .post(NotificationsController.handlePushNotificationSubscription);

router
  .route("/createInboxNotification/:userId")
  .post(NotificationsController.createInboxNotification);

router
  .route("/sendPushNotification/:userId")
  .post(NotificationsController.sendPushNotification);

router
  .route("/newNotificationsCount")
  .get(NotificationsController.newNotificationsCount);

router.route("/getNotifications").get(NotificationsController.getNotifications);

router
  .route("/massSendPushNotification")
  .post(NotificationsController.massSendPushNotification);

module.exports = router;
