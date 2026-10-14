import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required']
    },
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
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
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
        if (ret.service) {
          ret.serviceId = typeof ret.service === 'object' && ret.service._id ? ret.service._id.toString() : ret.service.toString();
        }
        if (ret.client) {
          ret.reviewerId = typeof ret.client === 'object' && ret.client._id ? ret.client._id.toString() : ret.client.toString();
          if (typeof ret.client === 'object' && ret.client.name) ret.reviewerName = ret.client.name;
        }
        if (ret.freelancer) {
          ret.revieweeId = typeof ret.freelancer === 'object' && ret.freelancer._id ? ret.freelancer._id.toString() : ret.freelancer.toString();
        }
        if (ret.deal) {
          ret.dealId = typeof ret.deal === 'object' && ret.deal._id ? ret.deal._id.toString() : ret.deal.toString();
        }
        delete ret.__v;
        return ret;
      }
    }
  }
);

reviewSchema.index({ service: 1 });
reviewSchema.index({ client: 1 });
reviewSchema.index({ freelancer: 1 });

export const Review = mongoose.model('Review', reviewSchema);
