const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body } = require('express-validator');
const imagesController = require('../controllers/imagesController');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Routes

/**
 * GET /api/images/hero
 * Get hero carousel images from Cloudinary
 * Query params:
 * - limit: number of images to return (default: 10)
 */
router.get('/hero', imagesController.getHeroImages);

/**
 * GET /api/images/gallery
 * Get gallery images from Cloudinary
 * Query params:
 * - limit: number of images to return (default: 20)
 * - folder: Cloudinary folder name (default: 'barbershop/gallery')
 * - prefix: optional filename prefix filter
 */
router.get('/gallery', imagesController.getGalleryImages);

/**
 * GET /api/images/service/:serviceName
 * Get service-specific images from Cloudinary
 * Params:
 * - serviceName: service name (e.g., 'haircuts', 'beard-trimming', 'mohawks')
 * Query params:
 * - limit: number of images to return (default: 20)
 * - prefix: optional filename prefix filter
 */
router.get('/service/:serviceName', async (req, res) => {
  const { serviceName } = req.params;
  const { limit = 20, prefix } = req.query;
  
  // Set the folder based on service name
  req.query.folder = `barbershop/${serviceName}`;
  req.query.limit = limit;
  req.query.prefix = prefix;
  
  // Use the gallery controller which now supports prefix filtering
  return imagesController.getGalleryImages(req, res);
});

/**
 * GET /api/images/search
 * Search images with flexible parameters
 * Query params:
 * - folder: required, Cloudinary folder to search in
 * - prefix: optional filename prefix filter
 * - limit: number of images to return (default: 20)
 */
router.get('/search', imagesController.getGalleryImages);

/**
 * POST /api/images/upload
 * Upload new image to Cloudinary
 * Body:
 * - image: image file (multipart/form-data)
 * - folder: target folder in Cloudinary (optional)
 * - tags: comma-separated tags (optional)
 */
router.post('/upload',
  upload.single('image'),
  [
    body('folder')
      .optional()
      .isString()
      .trim()
      .matches(/^[a-zA-Z0-9/_-]+$/)
      .withMessage('Folder name can only contain letters, numbers, slashes, hyphens, and underscores'),
    body('tags')
      .optional()
      .isString()
      .trim()
  ],
  imagesController.uploadImage
);

/**
 * DELETE /api/images/:publicId
 * Delete image from Cloudinary
 * Params:
 * - publicId: The public ID of the image to delete
 */
router.delete('/:publicId', imagesController.deleteImage);

/**
 * GET /api/images/optimize/:publicId
 * Get optimized image URL with custom transformations
 * Params:
 * - publicId: The public ID of the image
 * Query params: Any Cloudinary transformation parameters
 * - width: Image width
 * - height: Image height
 * - crop: Crop mode (fill, fit, scale, etc.)
 * - quality: Image quality (auto, 100, 80, etc.)
 * - format: Image format (auto, jpg, png, webp, etc.)
 */
router.get('/optimize/:publicId', imagesController.getOptimizedImageUrl);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed.'
    });
  }

  next(error);
});

module.exports = router;
