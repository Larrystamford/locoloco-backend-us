const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const buySellItemSchema = new Schema(
  {
    buyerDeliveryStatus: String,
    sellerDeliveryStatus: String,
    name: String,
    size: String,
    color: String,
    price: Number,
    quantity: Number,
    image: String,
    videoId: String,
    totalPrice: Number,
    buyerAddress: String,
    buyerPostalCode: String,
    buyerName: String,
    createdTime: String,
    updatedTime: String,
  },
  { timestamps: true }
);

const BuySellItem = mongoose.model("BuySellItem", buySellItemSchema);
module.exports = BuySellItem;
