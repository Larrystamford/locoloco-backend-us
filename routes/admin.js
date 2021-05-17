const router = require("express-promise-router")();
const AdminController = require("../controllers/admin");
const passport = require("passport");

router
  .route("/list")
  .get(passport.authenticate("jwt", { session: false }), AdminController.list);
router
  .route("/sales")
  .get(passport.authenticate("jwt", { session: false }), AdminController.sales);

module.exports = router;

// EXAMPLE AUTHENTICATE
// const router = require("express-promise-router")();
// const passport = require("passport");
// const { validateBody, schemas } = require("../helpers/routeHelpers");
// const UsersController = require("../controllers/users_social");
// // to be changed
// router
//   .route("/v1/follow/:username")
//   .put(
//     passport.authenticate("jwt", { session: false }),
//     UsersController.follow
//   );

// module.exports = router;
