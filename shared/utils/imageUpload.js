const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload image from buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder
 * @param {Object} options - Additional Cloudinary options
 */
const uploadFromBuffer = (buffer, folder = 'products', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ecommerce/${folder}`,
        resource_type: 'auto',
        transformation: [
          { 
            width: 1000, 
            height: 1000, 
            crop: 'limit', 
            quality: 'auto:good' 
          }
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Upload multiple images
 * @param {Array} files - Array of file objects with buffer
 * @param {string} folder - Cloudinary folder
 */
const uploadMultipleImages = async (files, folder = 'products') => {
  try {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map(file => 
      uploadFromBuffer(file.buffer, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    
    return results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    }));
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error('Image upload failed: ' + error.message);
  }
};

/**
 * Delete single image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      return { success: true, message: 'Image deleted successfully' };
    } else {
      return { success: false, message: 'Image not found or already deleted' };
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    throw new Error('Image deletion failed: ' + error.message);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public IDs
 */
const deleteMultipleImages = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      return { success: true, message: 'No images to delete' };
    }

    const result = await cloudinary.api.delete_resources(publicIds);
    
    return {
      success: true,
      message: 'Images deleted successfully',
      deleted: result.deleted,
      partial: result.partial
    };
  } catch (error) {
    console.error('Multiple deletion error:', error);
    throw new Error('Multiple image deletion failed: ' + error.message);
  }
};

/**
 * Get image details from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
const getImageDetails = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      createdAt: result.created_at
    };
  } catch (error) {
    console.error('Get image details error:', error);
    throw new Error('Failed to get image details: ' + error.message);
  }
};

module.exports = {
  uploadFromBuffer,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getImageDetails
};

