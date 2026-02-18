import mongoose, { Schema, models, Types } from 'mongoose';

export interface IAvailability {
  _id: string;
  studioId: Types.ObjectId | string;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday) for recurring
  date?: Date; // For specific date overrides
  isBlocked: boolean; // true = blocked/unavailable, false = available
  startTime: string; // Format: "HH:mm" (e.g., "09:00")
  endTime: string; // Format: "HH:mm" (e.g., "22:00")
  reason?: string; // e.g., "Dance class", "Maintenance", "Private event"
  recurring: boolean; // true for weekly recurring, false for one-time
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySchema = new Schema<IAvailability>(
  {
    studioId: {
      type: Schema.Types.ObjectId,
      ref: 'Studio',
      required: true,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },
    date: {
      type: Date,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    reason: {
      type: String,
      trim: true,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AvailabilitySchema.index({ studioId: 1, dayOfWeek: 1 });
AvailabilitySchema.index({ studioId: 1, date: 1 });

// Validation: must have either dayOfWeek (for recurring) or date (for one-time)
AvailabilitySchema.pre('save', function (next) {
  if (this.recurring && this.dayOfWeek === undefined) {
    next(new Error('Recurring availability must have dayOfWeek'));
  }
  if (!this.recurring && !this.date) {
    next(new Error('Non-recurring availability must have a specific date'));
  }
  next();
});

const Availability = models.Availability || mongoose.model<IAvailability>('Availability', AvailabilitySchema);

export default Availability;
