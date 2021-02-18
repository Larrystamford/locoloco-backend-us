const router = require("express-promise-router")();
const passport = require("passport");
const passportConfig = require("../passport");

const { validateBody, schemas } = require("../helpers/routeHelpers");
const UsersController = require("../controllers/users");

// LOGIN RELATED
router
  .route("/signup")
  .post(validateBody(schemas.authSchema), UsersController.signUp);

router
  .route("/signin")
  .post(
    validateBody(schemas.authSchema),
    passport.authenticate("local", { session: false }),
    UsersController.signIn
  );

router
  .route("/secret")
  .get(
    passport.authenticate("jwt", { session: false }),
    UsersController.secret
  );

router
  .route("/oauth/google")
  .post(
    passport.authenticate("googleToken", { session: false }),
    UsersController.googleOAuth
  );

router.route("/oauth/googleIdToken").post(
  UsersController.googleIdToken
);

// .get(passport.authenticate("jwt", { session: false }), UsersController.list);

// REST Routes
router.route("/get/:userId").get(UsersController.getVideosItemsByUserId);
router
  .route("/getByUserName/:userName")
  .get(UsersController.getVideosItemsByUserName);

router.route("/update/:userId").put(UsersController.update);

// ACTION ROUTES

// FOLLOW UNFOLLOW ETC
router.route("/pushFollowings/:userId").put(UsersController.pushFollowings);
router.route("/pullFollowings/:userId").put(UsersController.pullFollowings);
router.route("/pushFollowers/:userId").put(UsersController.pushFollowers);
router.route("/pullFollowers/:userId").put(UsersController.pullFollowers);

// LIKE UNLIKE ETC
router
  .route("/pushUserFavourites/:userId")
  .put(UsersController.pushUserFavourites);
router
  .route("/pullUserFavourites/:userId")
  .put(UsersController.pullUserFavourites);

// SEEN VIDEOS UPDATE
router.route("/pushVideoSeen/:userId").put(UsersController.pushVideoSeen);

// CHECK USER ADDRESS
router
  .route("/getUserInfo/:userId")
  .get(UsersController.getUserInfo);

// UPDATE SHIPPING ADDRESS FOR BOTH USERS
router.route("/updateShippingStatus").put(UsersController.updateShippingStatus);

// login local
//   .route("/signup")
//   .post(validateBody(schemas.authSchema), UsersController.signUp);

// router
//   .route("/signin")
//   .post(
//     validateBody(schemas.authSchema),
//     passport.authenticate("local", { session: false }),
//     UsersController.signIn
//   );

// router
//   .route("/v1/userinfo/")
//   .get(
//     passport.authenticate("jwt", { session: false }),
//     UsersController.userinfo
//   );

// router
//   .route("/v1/update/")
//   .put(
//     passport.authenticate("jwt", { session: false }),
//     UsersController.update
//   );

// router.route("/v1/updateUserAsAdmin/:id").put(
//   passport.authenticate("jwt", { session: false }),
//   // verify.isAdmin,
//   UsersController.updateUserAsAdmin
// );

// router
//   .route("/v1/updateUserArrays/")
//   .put(
//     passport.authenticate("jwt", { session: false }),
//     UsersController.updateUserArrays
//   );

module.exports = router;
