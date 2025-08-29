const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  lrNumber: { type: String, required: true, unique: true },
  agentName: { type: String, required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'delivered', 'cancelled'] },
  senderCompany: { type: String, required: true },
  senderMobile: { type: String, required: true },
  senderGST: { type: String, required: true },
  receiverCompany: { type: String, required: true },
  receiverMobile: { type: String, required: true },
  receiverGST: { type: String, required: true },
  material: { type: String, required: true },
  qty: { type: Number, required: true },
  weight: { type: Number, required: true },
  freight: { type: Number, required: true },
  invoice: { type: String },
  invoiceValue: { type: String },
  goodsCondition: { type: String },
  lrCharge: { type: Number, default: 0 },
  handling: { type: Number, default: 0 },
  pickup: { type: Number, default: 0 },
  doorDelivery: { type: Number, default: 0 },
  others: { type: Number, default: 0 },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
