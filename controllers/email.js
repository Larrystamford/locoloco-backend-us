const User = require("../models/user");
const sendEmailService = require("../service/email");
const fs = require("fs");
const csv = require("csv-parser");

module.exports = {
  // POST
  onSignUp: async (req, res, next) => {
    const response = sendEmailService.sendEmailSignUp(
      "larrylee3107@gmail.com",
      "Welcome to the Vosh Family! 🎉",
      "Message sent from vosh.club"
    );
    res.send(response);
  },

  // POST
  onPurchase: async (req, res, next) => {
    const { userId } = req.body;

    // get buyer email
    const buyer = await User.find({ _id: userId });
    const buyerEmail = buyer[0].email;

    const response = sendEmailService.sendEmailPurchase(
      buyerEmail,
      "Your purchase was successful! 🥳",
      "Message sent from vosh.club"
    );

    res.send(response);
  },

  // POST
  customerSupport: async (req, res, next) => {
    const { userId, buySellItemId } = req.body;

    // get buyer email
    const buyer = await User.find({ _id: userId });
    const buyerEmail = buyer[0].email;

    const response = sendEmailService.sendEmailCustomerSupport(
      buyerEmail,
      `Support Number: ${buySellItemId}`,
      "Message sent from vosh.club"
    );

    res.send(response);
  },

  // POST
  customerFeedback: async (req, res, next) => {
    const { userId } = req.body;

    // get buyer email
    const buyer = await User.find({ _id: userId });
    const buyerEmail = buyer[0].email;
    const buyerUsername = buyer[0].userName;

    const response = sendEmailService.sendEmailFeedback(
      buyerEmail,
      `Customer Feedback from  ${buyerUsername}`,
      "Message sent from vosh.club"
    );

    res.send(response);
  },

  // POST
  severeError: async (req, res, next) => {
    const { userId, userName } = req.body;

    const response = sendEmailService.sendEmailFeedback(
      "larrylee3107@gmail.com",
      `TikTok Download Error from  ${userName}, ID: ${userId}`,
      "ERROR"
    );

    res.send(response);
  },

  // POST
  advertisementEmail: async (req, res, next) => {
    const { batchNumber } = req.body;

    const startBatch = batchNumber * 490;
    const endBatch = (batchNumber + 1) * 490;
    const emailBatch = [];

    var counter = 0;

    function sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

    fs.createReadStream("../usa01.csv")
      .pipe(csv())
      .on("data", (row) => {
        if (startBatch <= counter && counter < endBatch) {
          for (key in row) {
            emailBatch.push(row[key]);
          }
        }

        counter += 1;
      })
      .on("end", async () => {
        for (var i = 0; i < emailBatch.length; i++) {
          await sleep(5000);
          var eachEmail = emailBatch[i];
          console.log(eachEmail, i);
          sendEmailService.sendAdvertEmail(
            eachEmail,
            `Your daily shopping recommendations have arrived`,
            "Message sent from vosh.club"
          );
        }

        console.log("Done");
      });

    res.send("success");
  },
};
