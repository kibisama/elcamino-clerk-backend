const mongoose = require('mongoose');
const { Schema } = mongoose;
const {
  Types: { ObjectId },
} = Schema;

const cardinalInvoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  orderDate: {
    type: String,
    required: true,
  },
  invoiceDate: {
    type: String,
    required: true,
  },
  invoiceType: {
    type: String,
    required: true,
  },
  csoNumber: {
    type: String,
  },
  isCSOSReported: Boolean,
  item: {
    type: [ObjectId],
    required: true,
    ref: 'Drug',
  },
  cost: {
    type: [String],
    required: true,
  },
  origQty: {
    type: [String],
    required: true,
  },
  orderQty: {
    type: [String],
    required: true,
  },
  shipQty: {
    type: [String],
    required: true,
  },
  omitCode: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model('CardinalInvoice', cardinalInvoiceSchema);
