const Item = require("../models/item");
const User = require("../models/user");
const BuySellItem = require("../models/buySellItem");

async function handleItemStock(userId, sellerId, quantity, itemId) {
  // update item stock
  let purchasedItem;
  try {
    // update item stock
    await Item.updateOne({ _id: itemId }, { $inc: { stocks: -quantity } });
    purchasedItem = await Item.find({ _id: itemId });
    if (purchasedItem[0].stocks < 0) {
      throw new Error("insufficient stock");
    }
  } catch (err) {
    // revert stock
    await Item.updateOne({ _id: itemId }, { $inc: { stocks: quantity } });

    console.log(err);
    return ["", err];
  }

  // get buyer info
  let buyerPostalCode, buyerAddress, buyerName, buyerEmail;
  const buyer = await User.find({ _id: userId });
  buyerAddress = buyer[0].address;
  buyerEmail = buyer[0].email;
  buyerPostalCode = buyer[0].postalCode;
  buyerName = buyer[0].firstName + " " + buyer[0].lastName;

  let totalPrice = Math.round(purchasedItem[0].price * quantity * 100);
  const newBuySellItem = new BuySellItem({
    name: purchasedItem[0].name,
    size: purchasedItem[0].size,
    color: purchasedItem[0].color,
    price: purchasedItem[0].price,
    quantity: quantity,
    image: purchasedItem[0].image,
    videoId: purchasedItem[0].video,
    totalPrice: totalPrice,
    buyerDeliveryStatus: "Order Confirmed",
    sellerDeliveryStatus: "Not Shipped",
    buyerName: buyerName,
    buyerAddress: buyerAddress,
    buyerPostalCode: buyerPostalCode,
  });

  // update both users purchases and sales items
  let newItem;
  try {
    newItem = await newBuySellItem.save();
  } catch (err) {
    if (newItem && newItem._id) {
      await BuySellItem.findOneAndDelete({ _id: newItem._id });
    }
    return ["", err];
  }

  try {
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          purchases: newItem,
        },
      }
    );
  } catch (err) {
    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          purchases: newItem,
        },
      }
    );
    return [newItem._id, err];
  }

  try {
    await User.updateOne(
      { _id: sellerId },
      {
        $push: {
          sales: newItem,
        },
      }
    );
  } catch (err) {
    await User.updateOne(
      { _id: sellerId },
      {
        $pull: {
          sales: newItem,
        },
      }
    );
    return [newItem._id, err];
  }

  return [newItem._id, null];
}

async function handleStocksRevert(
  userId,
  sellerId,
  quantity,
  itemId,
  newBuySellItemId
) {
  try {
    // revert stock
    await Item.updateOne({ _id: itemId }, { $inc: { stocks: quantity } });

    // delete the created buy sell item
    if (newBuySellItemId) {
      await BuySellItem.findOneAndDelete({ _id: newBuySellItemId });
    }

    // revert customer order
    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          purchases: newBuySellItemId,
        },
      }
    );

    // revert seller order
    await User.updateOne(
      { _id: sellerId },
      {
        $pull: {
          sales: newBuySellItemId,
        },
      }
    );
  } catch (err) {
    return "revert failed" + err.toString();
  }
}

module.exports = {
  handleItemStock,
  handleStocksRevert,
};
