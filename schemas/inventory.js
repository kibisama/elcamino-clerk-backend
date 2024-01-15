const mongoose = require('mongoose');
const { Schema } = mongoose;

const inventorySchema = new Schema({
  gtin: String,
  lot: String,
  sn: String,
  exp: String,
  dateIn: Date,
  dateOut: Date,
});

module.exports = mongoose.model('Inventory', inventorySchema);
