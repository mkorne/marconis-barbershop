/**
 * CloudinaryImageManager Class
 * Handles dynamic fetching and optimization of images from Cloudinary folders
 * Supports large image collections with efficient loading and caching
 */

class CloudinaryImageManager {
  constructor(options = {}) {
    // Cloudinary configuration
    this.cloudName = options.cloudName || 'your-cloud-name'; // Replace with your actual cloud name
    this.baseUrl = `https://res.cloudinary.com/${this.cloudName}`;
    this.adminApiUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}`;
    
    // Default settings
    this.defaultFolder = options.defaultFolder || 'barbershop/hero';
    this.maxResults = options.maxResults || 500; // Max images to fetch
    this.imageCache = new Map(); // Cache for processed images
    this.folderCache = new Map(); // Cache for folder listings
    this.cacheExpiry = options.cacheExpiry || 3600000; // 1 hour in milliseconds
    
    // Image optimization defaults
    this.defaultTransforms = {
      quality: 'auto:good',
      format: 'auto',
      crop: 'fill',
      gravity: 'auto',
      width: 1920,
      height: 1080
    };

    // Responsive breakpoints
    this.responsiveBreakpoints = {
      mobile: { width: 768, height: 432 },
      tablet: { width: 1024, height: 576 },
      desktop: { width: 1920, height: 1080 },
      ultrawide: { width: 2560, height: 1440 }
    };

    // Bind methods
    this.fetchImagesFromFolder = this.fetchImagesFromFolder.bind(this);
    this.generateOptimizedUrl = this.generateOptimizedUrl.bind(this);
    this.generateResponsiveUrls = this.generateResponsiveUrls.bind(this);
    this.preloadImages = this.preloadImages.bind(this);
    this.clearCache = this.clearCache.bind(this);
  }

  /**
   * Fetch images from a Cloudinary folder using the search API
   * Note: This is a client-side approach. For production, consider using a backend proxy
   */
  async fetchImagesFromFolder(folderPath = null) {
    const folder = folderPath || this.defaultFolder;
    const cacheKey = `folder_${folder}`;
    
    // Check cache first
    const cached = this.folderCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      console.log(`📦 Using cached images for folder: ${folder}`);
      return cached.data;
    }

    console.log(`🔍 Fetching images from Cloudinary folder: ${folder}`);
    
    try {
      // Using the search API approach (requires unsigned preset or backend)
      // For client-side implementation, we'll use the browse API approach
      const images = await this.browseFolderImages(folder);
      
      if (!images || images.length === 0) {
        console.warn(`No images found in folder: ${folder}`);
        return this.getFallbackImages();
      }

      // Process and optimize image URLs
      const processedImages = images.map((image, index) => ({
        id: image.public_id || `${folder}_${index}`,
        publicId: image.public_id,
        originalUrl: image.secure_url || image.url,
        optimizedUrl: this.generateOptimizedUrl(image.public_id),
        responsiveUrls: this.generateResponsiveUrls(image.public_id),
        alt: `Hero image ${index + 1} from ${folder}`,
        folder: folder,
        format: image.format,
        width: image.width,
        height: image.height,
        bytes: image.bytes,
        createdAt: image.created_at
      }));

      // Cache the results
      this.folderCache.set(cacheKey, {
        data: processedImages,
        timestamp: Date.now()
      });

      console.log(`✅ Fetched and processed ${processedImages.length} images from ${folder}`);
      return processedImages;

    } catch (error) {
      console.error('Error fetching images from Cloudinary:', error);
      
      // Return fallback images on error
      return this.getFallbackImages();
    }
  }

  /**
   * Browse folder images using direct URL approach
   * This is a simplified approach that works with public access
   */
  async browseFolderImages(folder) {
    // For production, this should be handled by your backend API
    // This is a mock implementation that generates URLs based on common patterns
    
    console.log('⚠️  Using fallback image generation. For production, implement proper Cloudinary API integration.');
    
    // Generate a set of image URLs based on common Cloudinary patterns
    const imageCount = Math.min(300, this.maxResults);
    const images = [];
    
    for (let i = 1; i <= imageCount; i++) {
      const paddedNum = String(i).padStart(3, '0');
      const publicId = `${folder}/image_${paddedNum}`;
      
      images.push({
        public_id: publicId,
        secure_url: `${this.baseUrl}/image/upload/${publicId}.jpg`,
        format: 'jpg',
        width: 1920,
        height: 1080,
        bytes: 150000,
        created_at: new Date().toISOString()
      });
    }
    
    return images;
  }

  /**
   * Generate optimized Cloudinary URL for a public ID
   */
  generateOptimizedUrl(publicId, customTransforms = {}) {
    const transforms = { ...this.defaultTransforms, ...customTransforms };
    const transformString = Object.entries(transforms)
      .map(([key, value]) => {
        // Convert camelCase to snake_case for Cloudinary
        const cloudinaryKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${cloudinaryKey}_${value}`;
      })
      .join(',');

    return `${this.baseUrl}/image/upload/${transformString}/${publicId}`;
  }

  /**
   * Generate responsive URLs for different screen sizes
   */
  generateResponsiveUrls(publicId) {
    const responsiveUrls = {};
    
    Object.entries(this.responsiveBreakpoints).forEach(([breakpoint, dimensions]) => {
      responsiveUrls[breakpoint] = this.generateOptimizedUrl(publicId, {
        width: dimensions.width,
        height: dimensions.height
      });
    });
    
    return responsiveUrls;
  }

  /**
   * Get fallback images when Cloudinary is unavailable
   */
  getFallbackImages() {
    const fallbackImages = [
      {
        id: 'fallback-1',
        publicId: 'fallback/hero-1',
        originalUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3',
        optimizedUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80',
        responsiveUrls: {
          mobile: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=768&h=432&q=80',
          tablet: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&h=576&q=80',
          desktop: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80',
          ultrawide: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&h=1440&q=80'
        },
        alt: "Professional barbershop interior",
        folder: 'fallback',
        format: 'jpg'
      },
      {
        id: 'fallback-2',
        publicId: 'fallback/hero-2',
        originalUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3',
        optimizedUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80',
        responsiveUrls: {
          mobile: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=768&h=432&q=80',
          tablet: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&h=576&q=80',
          desktop: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80',
          ultrawide: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&h=1440&q=80'
        },
        alt: "Classic barber tools and styling",
        folder: 'fallback',
        format: 'jpg'
      },
      {
        id: 'fallback-3',
        publicId: 'fallback/hero-3',
        originalUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3',
        optimizedUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80',
        responsiveUrls: {
          mobile: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=768&h=432&q=80',
          tablet: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&h=576&q=80',
          desktop: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80',
          ultrawide: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&h=1440&q=80'
        },
        alt: "Modern barbershop atmosphere",
        folder: 'fallback',
        format: 'jpg'
      }
    ];

    console.log('🔄 Using fallback images for hero carousel');
    return fallbackImages;
  }

  /**
   * Preload images for smooth transitions with intelligent batching
   */
  async preloadImages(images, batchSize = 10) {
    console.log(`🔄 Preloading ${images.length} images in batches of ${batchSize}...`);
    
    const totalBatches = Math.ceil(images.length / batchSize);
    let loadedCount = 0;
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, images.length);
      const batch = images.slice(start, end);
      
      const batchPromises = batch.map((image, index) => {
        return new Promise((resolve) => {
          const img = new Image();
          
          img.onload = () => {
            loadedCount++;
            console.log(`📸 Preloaded image ${loadedCount}/${images.length}: ${image.id}`);
            resolve({ success: true, image, index: start + index });
          };
          
          img.onerror = () => {
            console.warn(`⚠️  Failed to preload image: ${image.id}`);
            resolve({ success: false, image, index: start + index });
          };
          
          // Choose appropriate image size based on screen
          const screenWidth = window.innerWidth;
          let imageUrl = image.optimizedUrl;
          
          if (screenWidth <= 768 && image.responsiveUrls.mobile) {
            imageUrl = image.responsiveUrls.mobile;
          } else if (screenWidth <= 1024 && image.responsiveUrls.tablet) {
            imageUrl = image.responsiveUrls.tablet;
          } else if (screenWidth <= 1920 && image.responsiveUrls.desktop) {
            imageUrl = image.responsiveUrls.desktop;
          } else if (image.responsiveUrls.ultrawide) {
            imageUrl = image.responsiveUrls.ultrawide;
          }
          
          img.src = imageUrl;
        });
      });
      
      // Wait for current batch to complete before starting next batch
      await Promise.allSettled(batchPromises);
      
      // Small delay between batches to prevent overwhelming the browser
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ Preloading completed: ${loadedCount}/${images.length} images loaded successfully`);
    return loadedCount;
  }

  /**
   * Update Cloudinary configuration
   */
  updateConfig(newConfig) {
    Object.assign(this, newConfig);
    this.baseUrl = `https://res.cloudinary.com/${this.cloudName}`;
    this.adminApiUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}`;
    
    // Clear cache when config changes
    this.clearCache();
    
    console.log('🔧 Cloudinary configuration updated');
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.imageCache.clear();
    this.folderCache.clear();
    console.log('🗑️  Image cache cleared');
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus() {
    return {
      imageCacheSize: this.imageCache.size,
      folderCacheSize: this.folderCache.size,
      totalCacheEntries: this.imageCache.size + this.folderCache.size
    };
  }

  /**
   * Generate URL for a specific transformation
   */
  generateCustomUrl(publicId, transformations) {
    const transformString = Object.entries(transformations)
      .map(([key, value]) => `${key}_${value}`)
      .join(',');
    
    return `${this.baseUrl}/image/upload/${transformString}/${publicId}`;
  }

  /**
   * Batch generate URLs for multiple images
   */
  batchGenerateUrls(publicIds, transformations = {}) {
    return publicIds.map(publicId => ({
      publicId,
      url: this.generateOptimizedUrl(publicId, transformations)
    }));
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CloudinaryImageManager;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.CloudinaryImageManager = CloudinaryImageManager;
}
