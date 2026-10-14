import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      required: [true, 'Deal reference is required']
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    amount: {
      type: Number,
      required: [true, 'Milestone amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    dueDate: {
      type: Date
    },
    order: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'FUNDED',
        'IN_PROGRESS',
        'SUBMITTED',
        'APPROVED',
        'RELEASED',
        'DISPUTED',
        'REFUNDED',
        'CANCELLED',
        // Also support lowercase for compatibility
        'pending',
        'funded',
        'in_progress',
        'submitted',
        'approved',
        'released',
        'disputed',
        'refunded',
        'cancelled'
      ],
      default: 'PENDING'
    },
    submittedAt: {
      type: Date
    },
    approvedAt: {
      type: Date
    },
    releasedAt: {
      type: Date
    },
    submission: {
      message: { type: String, default: '' },
      files: [
        {
          fileUrl: { type: String },
          fileName: { type: String },
          size: { type: Number },
          mimeType: { type: String }
        }
      ],
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      submittedAt: { type: Date },
      status: {
        type: String,
        enum: ['SUBMITTED', 'ACCEPTED', 'REVISION_REQUESTED', 'DISPUTED'],
        default: 'SUBMITTED'
      },
      revisionNotes: { type: String, default: '' }
    },
    dispute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute',
      default: null
    },
    stripePaymentIntentId: {
      type: String,
      default: ''
    },
    stripeCheckoutSessionId: {
      type: String,
      default: ''
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
        delete ret.__v;
        return ret;
      }
    }
  }
);

milestoneSchema.index({ deal: 1, order: 1 });
milestoneSchema.index({ status: 1 });

export const Milestone = mongoose.model('Milestone', milestoneSchema);
