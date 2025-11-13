const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Create Cloudinary storage for multer
 * @param {string} folder - Folder name in Cloudinary
 * @param {Array} allowedFormats - Allowed file formats
 */
const createCloudinaryStorage = (folder = 'ecommerce', allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `ecommerce/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [{ 
        width: 1000, 
        height: 1000, 
        crop: 'limit',
        quality: 'auto:good'
      }]
    }
  });
};

/**
 * Create multer upload middleware
 * @param {string} folder - Cloudinary folder
 * @param {number} maxSize - Max file size in MB
 * @param {number} maxFiles - Max number of files
 */
const createUploadMiddleware = (folder = 'products', maxSize = 5, maxFiles = 5) => {
  const storage = createCloudinaryStorage(folder);
  
  return multer({ 
    storage: storage,
    limits: {
      fileSize: maxSize * 1024 * 1024, // Convert MB to bytes
      files: maxFiles
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  });
};

module.exports = {
  cloudinary,
  createCloudinaryStorage,
  createUploadMiddleware
};

