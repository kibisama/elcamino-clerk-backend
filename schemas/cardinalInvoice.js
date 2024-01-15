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
  invoiceDate: String,
  orderDate: String,
  orderDate: String,
  poNumber: String,
  invoiceType: String,
  item: {
    type: [ObjectId],
    ref: 'Drug',
  },
  origQty: [String],
  orderQty: [String],
  shipQty: [String],
  omitCode: [String],
  cost: [String],
  confirmNumber: [String],
  totalShipped: String,
  totalAmount: String,
  isCSOSReported: Boolean,
});

module.exports = mongoose.model('CardinalInvoice', cardinalInvoiceSchema);
