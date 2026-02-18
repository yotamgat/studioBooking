import mongoose, { Schema, models } from 'mongoose';

export interface IPricing {
  minParticipants: number;
  maxParticipants?: number;
  activityType: 'חזרה' | 'אימון/שיעון' | 'סדנה/ש.פרטי';
  commercial: boolean; // מסחרי / לא מסחרי
  pricePerHour: number;
}

export interface IStudio {
  _id: string;
  name: string;
  description?: string;
  detailedInfo?: string;
  address?: string; // Added address field
  capacity?: number;
  size?: number;
  amenities?: string[];
  images: string[];
  pricing: IPricing[];
  features?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema = new Schema({
  minParticipants: {
    type: Number,
    required: true,
    min: 1,
  },
  maxParticipants: {
    type: Number,
    min: 1,
  },
  activityType: {
    type: String,
    required: true,
    enum: ['חזרה', 'אימון/שיעון', 'סדנה/ש.פרטי'],
  },
  commercial: {
    type: Boolean,
    required: true,
  },
  pricePerHour: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const StudioSchema = new Schema<IStudio>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a studio name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    detailedInfo: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      default: 25,
    },
    size: {
      type: Number,
      min: 0,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
      required: [true, 'Please provide at least one image'],
    },
    pricing: {
      type: [PricingSchema],
      required: true,
      default: [],
    },
    features: {
      type: [String],
      default: [],
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

// Method to calculate price based on participants, hours, activity type, and commercial status
StudioSchema.methods.calculatePrice = function (
  participants: number,
  hours: number,
  activityType: string,
  isCommercial: boolean
): number {
  // Find applicable pricing
  const applicablePricing = this.pricing.find((p: IPricing) => {
    return (
      participants >= p.minParticipants &&
      (!p.maxParticipants || participants <= p.maxParticipants) &&
      p.activityType === activityType &&
      p.commercial === isCommercial
    );
  });

  if (applicablePricing) {
    return hours * applicablePricing.pricePerHour;
  }

  // If no pricing found, return 0 or throw error
  return 0;
};

const Studio = models.Studio || mongoose.model<IStudio>('Studio', StudioSchema);

export default Studio;
