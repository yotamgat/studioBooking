import mongoose, { Schema, models, Types } from 'mongoose';

export interface IRecurringBlock {
  _id: string;
  studioId: Types.ObjectId | string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  endDate?: Date; // Optional end date for the recurring block
  reason?: string;
  createdBy: Types.ObjectId | string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringBlockSchema = new Schema<IRecurringBlock>(
  {
    studioId: {
      type: Schema.Types.ObjectId,
      ref: 'Studio',
      required: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    endDate: {
      type: Date,
    },
    reason: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

RecurringBlockSchema.index({ studioId: 1, dayOfWeek: 1, isActive: 1 });

const RecurringBlock = models.RecurringBlock || mongoose.model<IRecurringBlock>('RecurringBlock', RecurringBlockSchema);

export default RecurringBlock;
