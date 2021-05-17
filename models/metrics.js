const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const metricsSchema = new Schema(
  {
    // either user or video id etc
    id: String,
    // a unique string description
    unqiueIdentifier: String,
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Metrics = mongoose.model("Metrics", metricsSchema);

module.exports = Metrics;


// unqiueIdentifier
// total page visits, total profile shares, 