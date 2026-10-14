import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    type: {
      type: String,
      enum: [
        'deal_created',
        'deal_accepted',
        'deal_completed',
        'deal_cancelled',
        'deal_updated',
        'payment_held',
        'payment_released',
        'delivery_submitted',
        'dispute_opened',
        'dispute_resolved',
        'review_received',
        'profile_updated',
        'service_created',
        'service_updated',
        'milestone_created',
        'milestone_funded',
        'milestone_released',
        'milestone_submitted',
        'milestone_revision',
        'withdrawal_processed',
        'general'
      ],
      default: 'general'
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    message: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: ''
    },
    read: {
      type: Boolean,
      default: false
    },
    relatedDeal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      default: null
    },
    relatedService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        if (ret.user) {
          ret.userId = typeof ret.user === 'object' && ret.user._id ? ret.user._id.toString() : ret.user.toString();
        }
        delete ret.__v;
        return ret;
      }
    }
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
