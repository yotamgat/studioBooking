import mongoose, { Schema, models, Types } from 'mongoose';

export interface IBooking {
  _id: string;
  studioId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  startTime: Date;
  endTime: Date;
  totalHours: number;
  pricePerHour: number;
  totalPrice: number;
  participants: number;
  activityType: 'חזרה' | 'אימון/שיעון' | 'סדנה/ש.פרטי';
  isCommercial: boolean;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentTransactionId?: string;
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    studioId: {
      type: Schema.Types.ObjectId,
      ref: 'Studio',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Will be required when authentication is implemented
    },
    startTime: {
      type: Date,
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please provide end time'],
    },
    totalHours: {
      type: Number,
      required: true,
      min: 0.25,
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    participants: {
      type: Number,
      required: true,
      min: 1,
    },
    activityType: {
      type: String,
      required: true,
      enum: ['חזרה', 'אימון/שיעון', 'סדנה/ש.פרטי'],
    },
    isCommercial: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentTransactionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
BookingSchema.index({ studioId: 1, startTime: 1, endTime: 1 });
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ status: 1 });

const Booking = models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
