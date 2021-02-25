const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const buySellItemSchema = new Schema(
  {
    buyerDeliveryStatus: String, // ordered, shipped, delivered
    sellerDeliveryStatus: String, // ordered, shipped, delivered
    name: String,
    size: String,
    color: String,
    price: Number,
    quantity: Number,
    image: String,
    videoId: String,
    itemId: String,
    deliveryCost: Number,
    totalPrice: Number,
    buyerAddress: String,
    buyerPostalCode: String,
    buyerName: String,
    shippedAt: String, // moment().format("yyyy-MM-DDTHH:mm:ss.SSS");
    deliveredAt: String,
    refundedAt: String,
    shippingDelayed: Boolean,
  },
  { timestamps: true }
);

const BuySellItem = mongoose.model("BuySellItem", buySellItemSchema);
module.exports = BuySellItem;
