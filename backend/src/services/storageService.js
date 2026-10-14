import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const getStorageConfig = () => {
  const hasCloudinary = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    !process.env.CLOUDINARY_CLOUD_NAME.includes('placeholder')
  );

  const hasS3 = Boolean(
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    !process.env.AWS_S3_BUCKET.includes('placeholder')
  );

  let provider = 'local';
  if (process.env.STORAGE_PROVIDER === 'cloudinary' && hasCloudinary) {
    provider = 'cloudinary';
  } else if (process.env.STORAGE_PROVIDER === 's3' && hasS3) {
    provider = 's3';
  } else if (hasCloudinary) {
    provider = 'cloudinary';
  } else if (hasS3) {
    provider = 's3';
  }

  return {
    provider,
    hasCloudinary,
    hasS3,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed'
    ]
  };
};

/**
 * Upload file to active storage provider (Cloudinary, S3, or Local Disk fallback)
 */
export const uploadFileToStorage = async (file, category = 'general') => {
  if (!file) {
    const error = new Error('No file provided for upload');
    error.statusCode = 400;
    throw error;
  }

  const config = getStorageConfig();

  // Validate MIME type
  if (!config.allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error(`Unsupported file type: ${file.mimetype}. Allowed: Images (JPG, PNG, WEBP, GIF), PDF, ZIP.`);
    error.statusCode = 400;
    throw error;
  }

  // Validate file size
  if (file.size > config.maxFileSize) {
    const error = new Error(`File exceeds maximum size of 10MB.`);
    error.statusCode = 400;
    throw error;
  }

  // 1. Cloudinary upload if configured
  if (config.provider === 'cloudinary') {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      const timestamp = Math.round(Date.now() / 1000);

      const crypto = await import('crypto');
      const signature = crypto
        .createHash('sha1')
        .update(`folder=workvault/${category}&timestamp=${timestamp}${apiSecret}`)
        .digest('hex');

      const formData = new FormData();
      const fileBlob = new Blob([file.buffer || fs.readFileSync(file.path)], { type: file.mimetype });
      formData.append('file', fileBlob, file.originalname);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', `workvault/${category}`);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Cloudinary upload failed');
      }

      return {
        url: data.secure_url,
        fileUrl: data.secure_url,
        publicId: data.public_id,
        filename: file.filename || file.originalname,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        provider: 'cloudinary'
      };
    } catch (cErr) {
      console.warn('[Cloudinary upload error, falling back to local storage]:', cErr.message);
    }
  }

  // 2. Local Disk storage fallback
  const filename = file.filename || `${category}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`;
  const localFilePath = file.path || path.join(uploadsDir, filename);

  if (!file.path && file.buffer) {
    fs.writeFileSync(localFilePath, file.buffer);
  }

  const port = process.env.PORT || 5000;
  const baseUrl = process.env.API_URL || `http://localhost:${port}`;
  const fileUrl = `/uploads/${filename}`;
  const fullUrl = `${baseUrl}/uploads/${filename}`;

  return {
    url: fullUrl,
    fileUrl,
    fullUrl,
    filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    provider: 'local'
  };
};
