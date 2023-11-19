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
  invoiceDate: {
    type: Date,
    required: true,
  },
  invoiceType: {
    type: String,
    required: true,
  },
  csoNumber: {
    type: String,
    unique: true,
  },
  item: {
    type: [ObjectId],
    required: true,
    ref: 'Drug',
  },
  cost: {
    type: [Number],
    required: true,
  },
  orderQty: {
    type: [Number],
    required: true,
  },
  shipQty: {
    type: [Number],
    required: true,
  },
});

module.exports = mongoose.model('CardinalInvoice', cardinalInvoiceSchema);
