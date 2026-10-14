import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    role: {
      type: String,
      enum: ['client', 'freelancer', 'admin'],
      default: 'client'
    },
    baseRole: {
      type: String,
      enum: ['client', 'freelancer', 'admin'],
      default: 'client'
    },
    profileImage: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    skills: {
      type: [String],
      default: []
    },
    title: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    company: {
      type: String,
      default: ''
    },
    portfolioUrl: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      default: 5.0
    },
    completedProjects: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'Active'
    },
    settings: {
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
        if (!ret.profileImage && ret.avatar) ret.profileImage = ret.avatar;
        if (!ret.avatar && ret.profileImage) ret.avatar = ret.profileImage;
        if (!ret.baseRole) ret.baseRole = ret.role;
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);


export const User = mongoose.model('User', userSchema);
