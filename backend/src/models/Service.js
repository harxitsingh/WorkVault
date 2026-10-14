import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Service description is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    deliveryDays: {
      type: Number,
      required: [true, 'Delivery days is required'],
      min: [1, 'Delivery days must be at least 1']
    },
    deliveryTime: {
      type: String
    },
    image: {
      type: String,
      default: ''
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer is required']
    },
    rating: {
      type: Number,
      default: 5.0
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      default: 'active'
    },
    tags: {
      type: [String],
      default: []
    },
    includes: {
      type: [String],
      default: []
    },
    requirements: {
      type: [String],
      default: []
    },
    faqs: [
      {
        question: { type: String, trim: true },
        answer: { type: String, trim: true }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        if (ret.freelancer) {
          if (typeof ret.freelancer === 'object' && ret.freelancer._id) {
            ret.freelancerId = ret.freelancer._id.toString();
            ret.freelancerName = ret.freelancer.name;
            ret.freelancerAvatar = ret.freelancer.profileImage || ret.freelancer.avatar || '';
          } else {
            ret.freelancerId = ret.freelancer.toString();
          }
        }
        if (ret.reviewsCount !== undefined && ret.reviewCount === undefined) {
          ret.reviewCount = ret.reviewsCount;
        } else if (ret.reviewCount !== undefined && ret.reviewsCount === undefined) {
          ret.reviewsCount = ret.reviewCount;
        }
        if (ret.deliveryDays && !ret.deliveryTime) {
          ret.deliveryTime = `${ret.deliveryDays} days`;
        }

        // Ensure image is an accessible absolute URL
        const backendBase = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
        if (ret.image && ret.image.startsWith('/uploads/')) {
          ret.image = `${backendBase}${ret.image}`;
        } else if (!ret.image) {
          ret.image = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80';
        }
        ret.imageUrl = ret.image;

        delete ret.__v;
        return ret;
      }
    }
  }
);

serviceSchema.index({ category: 1 });
serviceSchema.index({ freelancer: 1 });

export const Service = mongoose.model('Service', serviceSchema);
