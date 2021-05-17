const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const voshMetricsSchema = new Schema(
  {
    // either user or video id etc
    id: String,
    // a unique string description
    // unqiueIdentifier
    // total page visits, total profile shares,
    unqiueIdentifier: String,
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const voshMetrics = mongoose.model("voshMetrics", voshMetricsSchema);

module.exports = voshMetrics;