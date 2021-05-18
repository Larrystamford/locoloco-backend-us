const router = require("express-promise-router")();
const followsController = require("../controllers/follow");

router.route("/followUser").post(followsController.followUser);
router.route("/unfollowUser").post(followsController.unfollowUser);
router
  .route("/isFollowing/:followerId/:followingId")
  .get(followsController.isFollowing);

module.exports = router;
