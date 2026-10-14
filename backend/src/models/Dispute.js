import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
  {
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      required: [true, 'Deal is required']
    },
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Raised by user is required']
    },
    againstUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      required: [true, 'Dispute reason is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    evidence: [
      {
        url: { type: String },
        fileName: { type: String },
        mimeType: { type: String },
        size: { type: Number },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' }
      }
    ],
    status: {
      type: String,
      enum: [
        'OPEN',
        'UNDER_REVIEW',
        'RESOLVED',
        'REJECTED',
        'CLOSED',
        // Legacy lowercase
        'open',
        'in_review',
        'resolved',
        'rejected',
        'closed',
        'dismissed',
        'pending'
      ],
      default: 'OPEN'
    },
    adminDecision: {
      type: String,
      enum: ['REFUND_CLIENT', 'RELEASE_FREELANCER', 'NONE'],
      default: 'NONE'
    },
    resolution: {
      type: String,
      default: ''
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date
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
        if (ret.raisedBy) {
          ret.openedBy = typeof ret.raisedBy === 'object' && ret.raisedBy._id ? ret.raisedBy._id.toString() : ret.raisedBy.toString();
          if (typeof ret.raisedBy === 'object' && ret.raisedBy.name) ret.openedByName = ret.raisedBy.name;
        }
        delete ret.__v;
        return ret;
      }
    }
  }
);

disputeSchema.index({ deal: 1 });
disputeSchema.index({ milestone: 1 });
disputeSchema.index({ raisedBy: 1 });
disputeSchema.index({ status: 1 });

export const Dispute = mongoose.model('Dispute', disputeSchema);
