import mongoose from 'mongoose';

const fileAttachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      default: ''
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream'
    },
    size: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      enum: ['service', 'service_images', 'avatar', 'deliverable', 'dispute_evidence', 'general'],
      default: 'general'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
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

fileAttachmentSchema.index({ uploadedBy: 1 });
fileAttachmentSchema.index({ category: 1 });

export const FileAttachment = mongoose.model('FileAttachment', fileAttachmentSchema);
