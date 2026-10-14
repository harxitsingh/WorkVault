import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal'
    },
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    fee: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: [
        'PAYMENT_FUNDED',
        'PAYMENT_RELEASED',
        'PAYMENT_REFUNDED',
        'PLATFORM_FEE',
        'WITHDRAWAL',
        'ADJUSTMENT',
        // Legacy support
        'deposit',
        'release',
        'refund',
        'payment',
        'escrow'
      ],
      default: 'PAYMENT_FUNDED'
    },
    status: {
      type: String,
      enum: [
        'pending',
        'authorized',
        'held',
        'released',
        'refunded',
        'failed',
        'completed',
        'cancelled',
        'paid',
        'PENDING',
        'PAID',
        'AUTHORIZED',
        'HELD',
        'RELEASED',
        'REFUNDED',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
      ],
      default: 'HELD'
    },
    paymentProvider: {
      type: String,
      enum: ['stripe', 'razorpay', 'sandbox', 'system'],
      default: 'stripe'
    },
    stripeSessionId: {
      type: String,
      default: ''
    },
    stripePaymentIntentId: {
      type: String,
      default: ''
    },
    paymentReference: {
      type: String,
      default: ''
    },
    referenceId: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        if (ret.deal) {
          ret.dealId = typeof ret.deal === 'object' && ret.deal._id ? ret.deal._id.toString() : ret.deal.toString();
        }
        if (ret.milestone) {
          ret.milestoneId = typeof ret.milestone === 'object' && ret.milestone._id ? ret.milestone._id.toString() : ret.milestone.toString();
        }
        if (ret.client) {
          ret.clientId = typeof ret.client === 'object' && ret.client._id ? ret.client._id.toString() : ret.client.toString();
        }
        if (ret.freelancer) {
          ret.freelancerId = typeof ret.freelancer === 'object' && ret.freelancer._id ? ret.freelancer._id.toString() : ret.freelancer.toString();
        }
        if (ret.user) {
          ret.userId = typeof ret.user === 'object' && ret.user._id ? ret.user._id.toString() : ret.user.toString();
        }
        ret.stripeSessionId = ret.stripeSessionId || '';
        ret.stripePaymentIntentId = ret.stripePaymentIntentId || '';
        ret.paymentProvider = ret.paymentProvider || 'stripe';
        delete ret.__v;
        return ret;
      }
    }
  }
);

transactionSchema.index({ deal: 1 });
transactionSchema.index({ milestone: 1 });
transactionSchema.index({ client: 1 });
transactionSchema.index({ freelancer: 1 });
transactionSchema.index({ user: 1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ referenceId: 1 });
transactionSchema.index({ stripeSessionId: 1 });
transactionSchema.index({ stripePaymentIntentId: 1 });
transactionSchema.index({ createdAt: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
export const Payment = Transaction;
