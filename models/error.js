const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const errorSchema = new Schema(
  {
    error: String,
  },
  { timestamps: true }
);

const Error = mongoose.model("Error", errorSchema);
module.exports = Error;
