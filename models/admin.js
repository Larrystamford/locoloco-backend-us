const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const adminSchema = new Schema({
  userId: Object,
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
