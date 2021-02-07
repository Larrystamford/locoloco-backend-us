const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const itemSchema = new Schema(
  {
    name: { type: String, required: true },
    size: String,
    color: String,
    price: { type: Number, required: true },
    stocks: { type: Number, required: true },
    image: String,
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },

    createdTime: String,
    updatedTime: String,
    shoppingLinks: [], // for quick reference to which link to buy from etc
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
