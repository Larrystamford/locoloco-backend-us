const BuySellItem = require("../models/buySellItem");
const User = require("../models/user");
const Admin = require("../models/admin");

const _ = require("lodash/core");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
  list: async (req, res, next) => {
    const admin = await Admin.findOne({
      userId: req.user._id,
    });

    if (!admin) {
      res.status(500).send("not authorized");
    } else {
      User.find()
        .then((user) => res.send(user))
        .catch((err) => res.status(400).json("Error: " + err));
    }
  },

  sales: async (req, res, next) => {
    const admin = await Admin.findOne({
      userId: req.user._id,
    });

    if (!admin) {
      res.status(500).send("not authorized");
    } else {
      const boughtItems = await BuySellItem.find().sort({ createdAt: -1 });

      res.send(boughtItems);
    }
  },
};
