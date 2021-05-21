let winston = require("winston"),
  WinstonCloudWatch = require("winston-cloudwatch");

const nodemailer = require("nodemailer");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

winston.add(
  new WinstonCloudWatch({
    logGroupName: "testing",
    logStreamName: "first",
    awsAccessKeyId: process.env.AWS_ACCESS_ID,
    awsSecretKey: process.env.AWS_SECRET_KEY,
    awsRegion: process.env.AWS_REGION,
  })
);

async function sendEmailSignUp(receiverEmail, subject, message) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vosh.club@gmail.com",
      pass: process.env.LOCO_EMAIL_PASSWORD,
    },
  });

  const htmlFile = await readFile("./service/sign_up_email.html", "utf8");

  var mailOptions = {
    from: "vosh.club@gmail.com",
    to: receiverEmail,
    subject: subject,
    text: "Dear User,\n\nA big welcome to vosh.club.\n\nWe look forward to providing you with a platform to grow and engage your shopping audience, while serving you the customised shopping content that you love so much.\n\nFeel free to message us if you have any feedbacks or if you just want some company.\n\nWith Love, \nVosh.Club",
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
      user: "vosh.club@gmail.com",
      pass: process.env.LOCO_EMAIL_PASSWORD,
    },
  });

  const htmlFile = await readFile("./service/purchased_email.html", "utf8");

  var mailOptions = {
    from: "vosh.club@gmail.com",
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

async function sendEmailCustomerSupport(receiverEmail, subject, message) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vosh.club@gmail.com",
      pass: process.env.LOCO_EMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: "vosh.club@gmail.com",
    to: receiverEmail,
    subject: subject,
    text: "Dear customer,\n\nThank you for contacting customer support. Please tell us the issue that you are facing by replying to this email and our supporting staff will get back to you as soon as possible. \n\nWe thank you for your patience and understanding.\n\nWith Love, \nVosh.Club",
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

async function sendEmailFeedback(receiverEmail, subject, message) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vosh.club@gmail.com",
      pass: process.env.LOCO_EMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: "vosh.club@gmail.com",
    to: receiverEmail,
    subject: subject,
    text: "Dear customer,\n\nThank you for reaching out to us. Please reply your feedback to this email and we will get back to you as soon as possible. \n\nThank you for shopping with us!\n\nWith Love, \nVosh.Club",
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

async function sendAdvertEmail(receiverEmail, subject, message) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vosh.club@gmail.com",
      pass: process.env.LOCO_EMAIL_PASSWORD,
    },
  });

  const htmlFile = await readFile("./service/advert_email.html", "utf8");

  var mailOptions = {
    from: "vosh.club@gmail.com",
    to: receiverEmail,
    subject: subject,
    html: htmlFile,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      // winston.error(error);
    } else {
      console.log("success");
      // winston.error("success");
    }
  });

  return "sent";
}

module.exports = {
  sendEmailSignUp,
  sendEmailPurchase,
  sendEmailCustomerSupport,
  sendEmailFeedback,
  sendAdvertEmail,
};
