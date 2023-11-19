const mongoose = require('mongoose');
const { Schema } = mongoose;

const drugSchema = new Schema({
  labelName: String,
  genericName: String,
  cin: {
    type: String,
    unique: true,
  },
  ndc: {
    type: String,
    required: true,
    unique: true,
  },
  upc: {
    type: String,
    required: true,
    unique: true,
  },
  strength: String,
  form: String,
  packageQty: Number,
  packageSize: Number,
  unit: String,
  cardinalCost: Number,
  keyCost: Number,
  smartCost: Number,
  cardinalRetailPriceChanged: String,
  mfr: String,
  productType: String,
  abRating: String,
  storage: String,
  specialty: String,
  cardinalDateLastPurchased: String,
  cardinalCostLastPurchase: Number,
  purchaseHistoryDate: [String],
  purchaseHistoryShipQty: [Number],
  purchaseHistoryTotalCost: [Number],
  dateLastUpdatedCardinal: Date,
  dateLastUpdatedKeySource: Date,
  dateLastUpdatedSmartSource: Date,
  isGeneric: Boolean,
  ourPricePerUnit: Number,
  ourBatchQty: [Number],
  ourBatchPrice: [Number],
});

module.exports = mongoose.model('Drug', drugSchema);
