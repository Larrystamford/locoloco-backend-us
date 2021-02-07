// let winston = require("winston"),
// WinstonCloudWatch = require("winston-cloudwatch");

const nodemailer = require("nodemailer");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

// winston.add(
//   new WinstonCloudWatch({
//     logGroupName: "testing",
//     logStreamName: "first",
//     awsAccessKeyId: process.env.AWS_ACCESS_ID,
//     awsSecretKey: process.env.AWS_SECRET_KEY,
//     awsRegion: process.env.AWS_REGION,
//   })
// );

async function sendEmailSignUp(receiverEmail, subject, message) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shoplocoloco.sg@gmail.com",
      pass: process.env.LOCO_EMAIL_PASSWORD,
    },
  });

  const htmlFile = await readFile("./service/signUp.html", "utf8");

  var mailOptions = {
    from: "shoplocoloco.sg@gmail.com",
    to: receiverEmail,
    subject: subject,
    html: htmlFile,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      winston.error(error);
    } else {
      winston.error("success");
    }
  });

  return "sent";
}

async function sendEmailPurchase(receiverEmail, subject, message) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shoplocoloco.sg@gmail.com",
      pass: process.env.LOCO_EMAIL_PASSWORD,
    },
  });

  const htmlFile = await readFile("./service/signUp.html", "utf8");

  var mailOptions = {
    from: "shoplocoloco.sg@gmail.com",
    to: receiverEmail,
    subject: subject,
    html: htmlFile,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      winston.error(error);
    } else {
      winston.error("success");
    }
  });

  return "sent";
}

module.exports = {
  sendEmailSignUp,
  sendEmailPurchase,
};
