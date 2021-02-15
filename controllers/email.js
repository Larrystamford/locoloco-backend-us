const User = require("../models/user");
const sendEmailService = require("../service/email");

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
};
