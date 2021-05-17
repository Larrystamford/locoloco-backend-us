const Metrics = require("../models/Metrics");

module.exports = {
  incrementMetrics: async (req, res, next) => {
    try {
      const { id, unqiueIdentifier } = req.body;

      await Metrics.updateOne(
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
