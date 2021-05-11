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

router.route("/changePassword").post(UsersController.changePassword);

router.route("/userNameTaken/:userName").get(UsersController.userNameTaken);
router.route("/userNameIsPro/:userName").get(UsersController.userNameIsPro);

router
  .route("/secret")
  .get(
    passport.authenticate("jwt", { session: false }),
    UsersController.secret
  );

router
  .route("/googleOAuth")
  .post(
    passport.authenticate("googleStrategy", { session: false }),
    UsersController.googleOAuth
  );

router.route("/oauth/googleIdToken").post(UsersController.googleIdToken);
router.route("/oauth/localRedirect").post(UsersController.localRedirect);

// .get(passport.authenticate("jwt", { session: false }), UsersController.list);

// REST Routes
router.route("/get/:userId").get(UsersController.getVideosItemsByUserId);
router
  .route("/getByUserName/:userName")
  .get(UsersController.getVideosItemsByUserName);

router
  .route("/getVideosItemsByUserNamePro/:userName")
  .get(UsersController.getVideosItemsByUserNamePro);

router.route("/update/:userId").put(UsersController.update);

// ACTION ROUTES

router
  .route("/pushPreviousProductLinks/:userId")
  .put(UsersController.pushPreviousProductLinks);

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
router.route("/getUserInfo/:userId").get(UsersController.getUserInfo);

// UPDATE SHIPPING ADDRESS FOR BOTH USERS
router.route("/updateShippingStatus").put(UsersController.updateShippingStatus);

router.route("/addCoins/:userId").put(UsersController.addCoins);

module.exports = router;
