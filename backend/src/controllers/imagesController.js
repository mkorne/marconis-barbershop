const cloudinaryService = require('../services/cloudinaryService');
const logger = require('../config/logger');

/**
 * Get hero carousel images from Cloudinary
 */
const getHeroImages = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const images = await cloudinaryService.getImagesFromFolder('barbershop/hero', parseInt(limit));
    
    // Add responsive URLs to each image
    const imagesWithResponsive = images.map(image => ({
      ...image,
      responsive: cloudinaryService.getResponsiveImageUrls(image.id)
    }));

    logger.info(`Retrieved ${images.length} hero images from Cloudinary`);

    res.json({
      success: true,
      data: {
        images: imagesWithResponsive,
        count: images.length
      }
    });
  } catch (error) {
    logger.error('Error fetching hero images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero images',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Get gallery images from Cloudinary
 */
const getGalleryImages = async (req, res) => {
  try {
    const { limit = 20, folder = 'barbershop/gallery', prefix } = req.query;
    
    const images = await cloudinaryService.getImagesFromFolder(folder, parseInt(limit), prefix);
    
    // Add responsive URLs to each image
    const imagesWithResponsive = images.map(image => ({
      ...image,
      responsive: cloudinaryService.getResponsiveImageUrls(image.id)
    }));

    logger.info(`Retrieved ${images.length} gallery images from Cloudinary folder: ${folder}${prefix ? ` with prefix: ${prefix}` : ''}`);

    res.json({
      success: true,
      data: {
        images: imagesWithResponsive,
        count: images.length,
        folder,
        prefix: prefix || null
      }
    });
  } catch (error) {
    logger.error('Error fetching gallery images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery images',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Upload new image to Cloudinary
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { folder = 'barbershop/uploads', tags } = req.body;
    
    // Upload image to Cloudinary
    const uploadOptions = {
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    const result = await cloudinaryService.uploadImage(
      req.file.path,
      folder,
      uploadOptions
    );

    logger.info(`Successfully uploaded image ${result.id} to Cloudinary`);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await cloudinaryService.deleteImage(publicId);

    logger.info(`Successfully deleted image ${publicId} from Cloudinary`);

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Get optimized image URL with custom transformations
 */
const getOptimizedImageUrl = async (req, res) => {
  try {
    const { publicId } = req.params;
    const transformations = req.query;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const optimizedUrl = cloudinaryService.getOptimizedImageUrl(publicId, transformations);

    res.json({
      success: true,
      data: {
        publicId,
        optimizedUrl,
        transformations
      }
    });
  } catch (error) {
    logger.error('Error generating optimized image URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate optimized image URL',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

module.exports = {
  getHeroImages,
  getGalleryImages,
  uploadImage,
  deleteImage,
  getOptimizedImageUrl
};
