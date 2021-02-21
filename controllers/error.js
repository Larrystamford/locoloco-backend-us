const Error = require("../models/error");

async function saveErrorMessage(req, res, next) {
  try {
    const newError = new Error(req.body);
    await newError.save();

    res.status(201).send(newError);
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = { saveErrorMessage };
