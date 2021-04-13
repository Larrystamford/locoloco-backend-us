const User = require("../models/user");
const sendEmailService = require("../service/email");
const fs = require('fs');
const csv = require('csv-parser');


module.exports = {
  // POST
  onSignUp: async (req, res, next) => {
    const response = sendEmailService.sendEmailSignUp(
      "larrylee3107@gmail.com",
      "Welcome to the Loco Family! 🎉",
      "Message sent from www.shoplocoloco.com"
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
      "Message sent from www.shoplocoloco.com"
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
      "Message sent from www.shoplocoloco.com"
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
      "Message sent from www.shoplocoloco.com"
    );

    res.send(response);
  },

    // POST
    advertisementEmail: async (req, res, next) => {
      const { batchNumber } = req.body;

      const startBatch = batchNumber * 490
      const endBatch = (batchNumber + 1) * 490
      const emailBatch = []


      var counter = 0
      fs.createReadStream('../usa01.csv')
      .pipe(csv())
      .on('data', (row) => {
        if (startBatch <= counter && counter < endBatch) {
          for (key in row) {
            emailBatch.push(row[key])
          }
        } 

        counter+=1
        // console.log("counter", counter);
        // console.log("endBatch", endBatch);
      })
      .on('end', async () => {
        // CSV file successfully processed

        // for (const eachEmail of emailBatch) {
        //   console.log(eachEmail)
        // }
        
        for (i = 0; i < 1; i++) {
          sendEmailService.sendAdvertEmail(
            "larrylee3107@gmail.com",
            `Shopping just got a lot more fun!`,
            "Message sent from www.shoplocoloco.com"
          );
  
        }
  

        console.log("Done")
      });



  
    
  
      res.send("success");
    },
  
};
