import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client is required']
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer is required']
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    requirements: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: [
        'pending',
        'active',
        'completed',
        'cancelled',
        'disputed',
        'CREATED',
        'FUNDED',
        'IN_PROGRESS',
        'SUBMITTED',
        'APPROVED',
        'RELEASED',
        'CANCELLED',
        'DISPUTED'
      ],
      default: 'pending'
    },
    deadline: {
      type: Date
    },
    submission: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        if (ret.client) {
          ret.clientId = typeof ret.client === 'object' && ret.client._id ? ret.client._id.toString() : ret.client.toString();
          if (typeof ret.client === 'object' && ret.client.name) ret.clientName = ret.client.name;
        }
        if (ret.freelancer) {
          ret.freelancerId = typeof ret.freelancer === 'object' && ret.freelancer._id ? ret.freelancer._id.toString() : ret.freelancer.toString();
          if (typeof ret.freelancer === 'object' && ret.freelancer.name) ret.freelancerName = ret.freelancer.name;
        }
        if (ret.service) {
          ret.serviceId = typeof ret.service === 'object' && ret.service._id ? ret.service._id.toString() : ret.service.toString();
        }
        delete ret.__v;
        return ret;
      }
    }
  }
);

dealSchema.virtual('milestones', {
  ref: 'Milestone',
  localField: '_id',
  foreignField: 'deal'
});

dealSchema.index({ client: 1 });
dealSchema.index({ freelancer: 1 });
dealSchema.index({ status: 1 });

export const Deal = mongoose.model('Deal', dealSchema);
