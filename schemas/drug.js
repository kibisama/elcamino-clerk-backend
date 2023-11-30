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
  packageQty: String,
  packageSize: String,
  unit: String,
  cardinalCost: String,
  keySourceCost: String,
  smartSourceCost: String,
  cardinalRetailPriceChanged: String,
  mfr: String,
  productType: String,
  abRating: String,
  storage: String,
  specialty: String,
  cardinalHistInvoiceDate: [String],
  cardinalHistShipQty: [String],
  cardinalHistUnitCost: [String],
  cardinalHistTotalCost: [String],
  cardinalHistInvoiceNum: [String],
  dateLastUpdatedCardinal: Date,
  dateLastUpdatedKeySource: Date,
  dateLastUpdatedSmartSource: Date,
  isGeneric: Boolean,
  isCardinalPriceMatched: Boolean,
  lastDateCardinalPriceMatched: Date,
  ourPricePerUnit: Number,
  ourBatchQty: [Number],
  ourBatchPrice: [Number],
});

module.exports = mongoose.model('Drug', drugSchema);
