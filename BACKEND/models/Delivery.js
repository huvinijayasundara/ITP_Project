const mongoose = require('mongoose');

const DeliveryStatus = ['assigned', 'out-for-delivery', 'delivered', 'cancelled'];

const StatusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: DeliveryStatus, required: true },
    note: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DeliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: DeliveryStatus, default: 'assigned', index: true },
    eta: { type: Date },
    deliveredAt: { type: Date },
    notes: { type: String },
    statusHistory: { type: [StatusHistorySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', DeliverySchema);
