const voshMetrics = require("../models/voshMetrics");

module.exports = {
  incrementMetrics: async (req, res, next) => {
    try {
      const { id, unqiueIdentifier } = req.body;

      await voshMetrics.updateOne(
        { id: id, unqiueIdentifier: unqiueIdentifier },
        {
          $setOnInsert: { id: id, unqiueIdentifier: unqiueIdentifier },

          $inc: { clickCount: 1 },
        },
        { upsert: true }
      );

      res.status(200).send("success");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
};
