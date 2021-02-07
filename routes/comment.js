const router = require("express-promise-router")();
const CommentController = require("../controllers/comment");
const UserController = require("../controllers/users");

router
  .route("/listVideoComments/:videoId")
  .get(CommentController.listVideoComments);

router.route("/createComment/:videoId").post(CommentController.createComment);
router
  .route("/createSubComment/:commentId")
  .post(CommentController.createSubComment);
router
  .route("/pushUserCommentFavourites/:userId")
  .put(UserController.pushUserCommentFavourites);
router
  .route("/pullUserCommentFavourites/:userId")
  .put(UserController.pullUserCommentFavourites);
router
  .route("/pushUserSubCommentFavourites/:userId")
  .put(UserController.pushUserSubCommentFavourites);
router
  .route("/pullUserSubCommentFavourites/:userId")
  .put(UserController.pullUserSubCommentFavourites);

module.exports = router;
