// models/PendingBooking.ts
import mongoose, { Schema, models } from 'mongoose';

const PendingBookingSchema = new Schema({
  studioId: { type: Schema.Types.ObjectId, ref: 'Studio', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  totalHours: { type: Number, required: true },
  pricePerHour: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  participants: { type: Number, required: true },
  activityType: { type: String, required: true },
  isCommercial: { type: Boolean, required: true },
  notes: { type: String },
}, {
  timestamps: true,
  // Auto-delete after 15 minutes if payment never completes
  expireAfterSeconds: 900,
});

PendingBookingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

const PendingBooking = models.PendingBooking || mongoose.model('PendingBooking', PendingBookingSchema);
export default PendingBooking;