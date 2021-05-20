const router = require("express-promise-router")();
const fileUpload = require("express-fileupload");
const uploadCtrl = require("../controllers/upload");

router.use(fileUpload({}));

/* POST http://localhost:5000/v1/upload/aws - upload files to aws s3 bucket */
router.route("/aws").post(uploadCtrl.uploadFileToAwsCtrl);
router
  .route("/awsWithFirstFrame")
  .post(uploadCtrl.uploadVideoAndFirstFrameToAws);

router
  .route("/getImageURLByScrapping/")
  .post(uploadCtrl.getImageURLByScrapping);

module.exports = router;
