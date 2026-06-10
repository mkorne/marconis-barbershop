const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

/**
 * Get all images from a specific folder in Cloudinary
 * @param {string} folderName - The folder name in Cloudinary
 * @param {number} maxResults - Maximum number of images to return
 * @param {string} prefix - Optional filename prefix to filter by
 * @returns {Promise<Array>} Array of image objects with URLs and metadata
 */
const getImagesFromFolder = async (folderName = 'barbershop/hero', maxResults = 20, prefix = '') => {
  try {
    // Build search expression with optional prefix filter
    const expressions = [`folder:${folderName}`];
    if (prefix && prefix.trim()) {
      expressions.push(`filename:${prefix.trim()}*`);
    }
    const expression = expressions.join(' AND ');

    console.log(`🔍 Cloudinary search: ${expression}`);

    const result = await cloudinary.search
      .expression(expression)
      .sort_by([['created_at', 'desc']])
      .max_results(maxResults)
      .execute();

    // Transform the results to include optimized URLs
    const images = result.resources.map(image => ({
      id: image.public_id,
      url: cloudinary.url(image.public_id, {
        quality: 'auto',
        fetch_format: 'auto',
        width: 1920,
        height: 1080,
        crop: 'fill',
        gravity: 'center'
      }),
      thumbnailUrl: cloudinary.url(image.public_id, {
        quality: 'auto',
        fetch_format: 'auto',
        width: 400,
        height: 300,
        crop: 'fill',
        gravity: 'center'
      }),
      alt: image.filename || `Marconi's Barbershop ${image.public_id}`,
      width: image.width,
      height: image.height,
      createdAt: image.created_at,
      tags: image.tags || []
    }));

    return images;
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    throw new Error('Failed to fetch images from Cloudinary');
  }
};

/**
 * Upload an image to Cloudinary
 * @param {string} imagePath - Local path or URL of the image
 * @param {string} folder - Cloudinary folder to upload to
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Upload result with public_id and URL
 */
const uploadImage = async (imagePath, folder = 'barbershop/hero', options = {}) => {
  try {
    const uploadOptions = {
      folder,
      quality: 'auto',
      fetch_format: 'auto',
      overwrite: true,
      invalidate: true,
      ...options
    };

    const result = await cloudinary.uploader.upload(imagePath, uploadOptions);
    
    return {
      id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - The public ID of the image
 * @param {Object} transformations - Cloudinary transformation options
 * @returns {string} Optimized image URL
 */
const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations
  };

  return cloudinary.url(publicId, defaultTransformations);
};

/**
 * Generate responsive image URLs for different screen sizes
 * @param {string} publicId - The public ID of the image
 * @returns {Object} Object with URLs for different screen sizes
 */
const getResponsiveImageUrls = (publicId) => {
  return {
    mobile: cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      width: 768,
      height: 432,
      crop: 'fill',
      gravity: 'center'
    }),
    tablet: cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      width: 1024,
      height: 576,
      crop: 'fill',
      gravity: 'center'
    }),
    desktop: cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      width: 1920,
      height: 1080,
      crop: 'fill',
      gravity: 'center'
    }),
    ultrawide: cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      width: 2560,
      height: 1440,
      crop: 'fill',
      gravity: 'center'
    })
  };
};

module.exports = {
  getImagesFromFolder,
  uploadImage,
  deleteImage,
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  cloudinary
};
