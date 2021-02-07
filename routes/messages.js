const router = require("express-promise-router")();
const messagesController = require("../controllers/messages");


router
    .route("/create")
    .post(
        messagesController.create
    );

router
    .route("/list")
    .get(
        messagesController.list
    );

router
    .route("/get/:query")
    .get(
        messagesController.get
    );

module.exports = router;