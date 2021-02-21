const router = require("express-promise-router")();
const errorController = require("../controllers/error");

router.route("/saveErrorMessage").post(errorController.saveErrorMessage);

module.exports = router;
