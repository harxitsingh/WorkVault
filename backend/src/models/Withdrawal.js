import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Minimum withdrawal amount is 1']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'REQUESTED'
    },
    payoutMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'stripe_connect', 'simulated'],
      default: 'simulated'
    },
    accountDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    notes: {
      type: String,
      default: ''
    },
    processedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

withdrawalSchema.index({ user: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1 });

export const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
