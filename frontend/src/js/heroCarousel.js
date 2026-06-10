/**
 * Hero Carousel Component with Cloudinary Integration
 * Manages dynamic background images for the hero section using Cloudinary
 * Changes images every 15 seconds with smooth transitions
 * Supports up to 300 images with efficient preloading and caching
 */

class HeroCarousel {
  constructor(options = {}) {
    this.heroSection = document.querySelector('#hero-section') || document.querySelector('.hero-section');
    this.images = [];
    this.currentImageIndex = 0;
    this.intervalDuration = options.intervalDuration || 15000; // 15 seconds as requested
    this.transitionDuration = options.transitionDuration || 1500; // 1.5 seconds for smoother transitions
    this.intervalId = null;
    this.isLoading = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.preloadBatchSize = options.preloadBatchSize || 10;
    this.maxImages = options.maxImages || 300;
    
    // Cloudinary configuration
    this.cloudinaryConfig = {
      cloudName: options.cloudName || 'your-cloud-name', // Replace with your Cloudinary cloud name
      folderPath: options.folderPath || 'barbershop/hero', // Easy to change folder path
      maxResults: options.maxResults || 300,
      cacheExpiry: options.cacheExpiry || 3600000 // 1 hour
    };
    
    // Initialize Cloudinary Image Manager
    this.imageManager = new CloudinaryImageManager(this.cloudinaryConfig);
    
    // Performance tracking
    this.stats = {
      imagesLoaded: 0,
      totalImages: 0,
      preloadingTime: 0,
      cycleCount: 0,
      errorCount: 0
    };

    // Bind methods
    this.init = this.init.bind(this);
    this.fetchImages = this.fetchImages.bind(this);
    this.startCarousel = this.startCarousel.bind(this);
    this.stopCarousel = this.stopCarousel.bind(this);
    this.nextImage = this.nextImage.bind(this);
    this.preloadImages = this.preloadImages.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.updateCloudinaryConfig = this.updateCloudinaryConfig.bind(this);

    // Initialize immediately
    this.init();
  }

  /**
   * Initialize the carousel with Cloudinary integration
   */
  async init() {
    if (!this.heroSection) {
      console.warn('Hero section not found. Carousel not initialized.');
      return;
    }

    // Check if CloudinaryImageManager is available
    if (!window.CloudinaryImageManager || !this.imageManager) {
      console.error('CloudinaryImageManager not found. Please ensure cloudinaryImageManager.js is loaded.');
      return;
    }

    console.log('🎨 Initializing Hero Carousel with Cloudinary integration...');
    console.log(`📁 Fetching images from folder: ${this.cloudinaryConfig.folderPath}`);
    console.log(`⏱️  Image rotation interval: ${this.intervalDuration / 1000}s`);

    try {
      // Add loading state with improved loading indicator
      this.heroSection.classList.add('loading-images');
      this.showLoadingState();
      
      // Fetch images from Cloudinary
      await this.fetchImages();
      
      if (this.images.length === 0) {
        console.warn('No images found for hero carousel');
        this.heroSection.classList.remove('loading-images');
        this.hideLoadingState();
        return;
      }

      console.log(`🖼️  Loaded ${this.images.length} images for carousel`);
      this.stats.totalImages = this.images.length;

      // Set initial background image
      this.setBackgroundImage(0);
      
      // Start progressive preloading
      this.preloadImages();
      
      // Remove loading state
      this.heroSection.classList.remove('loading-images');
      this.hideLoadingState();
      
      // Start the carousel if there's more than one image
      if (this.images.length > 1) {
        this.startCarousel();
      }

      // Listen for page visibility changes and resize events
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('resize', this.handleResize);

      console.log(`✅ Hero Carousel initialized successfully`);
      console.log(`📊 Configuration: ${this.images.length} images, ${this.intervalDuration/1000}s intervals`);
      
    } catch (error) {
      console.error('Failed to initialize hero carousel:', error);
      this.stats.errorCount++;
      this.heroSection.classList.remove('loading-images');
      this.hideLoadingState();
      
      // Retry initialization after a delay
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Retrying initialization (${this.retryCount}/${this.maxRetries})...`);
        setTimeout(() => this.init(), 5000);
      } else {
        console.error('❌ Failed to initialize carousel after maximum retries');
        this.showErrorState();
      }
    }
  }

  /**
   * Fetch images from Cloudinary using the ImageManager
   */
  async fetchImages() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    const startTime = performance.now();
    
    try {
      console.log(`📡 Fetching hero images from Cloudinary folder: ${this.cloudinaryConfig.folderPath}`);
      
      // Use CloudinaryImageManager to fetch images
      const images = await this.imageManager.fetchImagesFromFolder(this.cloudinaryConfig.folderPath);
      
      if (!images || images.length === 0) {
        throw new Error('No images found in Cloudinary folder');
      }

      // Limit images to maxImages if specified
      this.images = images.slice(0, this.maxImages);

      const fetchTime = performance.now() - startTime;
      console.log(`📸 Successfully fetched ${this.images.length} images in ${Math.round(fetchTime)}ms`);
      
      // Log first few image details for debugging
      if (this.images.length > 0) {
        console.log('📋 First 3 images:', this.images.slice(0, 3).map(img => ({
          id: img.id,
          folder: img.folder,
          optimized: img.optimizedUrl ? 'Yes' : 'No'
        })));
      }
      
    } catch (error) {
      console.error('Error fetching hero images from Cloudinary:', error);
      this.stats.errorCount++;
      
      // Get fallback images from ImageManager
      this.images = this.imageManager.getFallbackImages();
      console.log(`🔄 Using ${this.images.length} fallback images`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Show loading state with animated spinner
   */
  showLoadingState() {
    // Create or show loading overlay
    let loadingOverlay = this.heroSection.querySelector('.hero-loading-overlay');
    if (!loadingOverlay) {
      loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'hero-loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading hero images...</p>
          <div class="loading-progress">
            <div class="loading-bar"></div>
          </div>
        </div>
      `;
      this.heroSection.appendChild(loadingOverlay);
    }
    loadingOverlay.style.display = 'flex';
  }

  /**
   * Hide loading state
   */
  hideLoadingState() {
    const loadingOverlay = this.heroSection.querySelector('.hero-loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  }

  /**
   * Show error state
   */
  showErrorState() {
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'hero-error-overlay';
    errorOverlay.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-triangle error-icon"></i>
        <p class="error-text">Unable to load hero images</p>
        <button class="retry-button" onclick="window.heroCarousel.retry()">Retry</button>
      </div>
    `;
    this.heroSection.appendChild(errorOverlay);
  }

  /**
   * Set background image for hero section with enhanced responsive support
   */
  setBackgroundImage(index) {
    if (!this.images[index]) {
      console.warn(`Image at index ${index} not found`);
      return;
    }

    const image = this.images[index];
    
    // Choose the best image URL based on screen size
    let imageUrl = this.getResponsiveImageUrl(image);
    
    // Create a new background image element for smooth transition
    const newBgElement = document.createElement('div');
    newBgElement.className = 'hero-bg-image';
    newBgElement.style.backgroundImage = `url("${imageUrl}")`;
    newBgElement.style.opacity = '0';
    newBgElement.setAttribute('data-image-id', image.id);
    newBgElement.setAttribute('data-image-index', index);
    
    // Add accessibility attributes
    newBgElement.setAttribute('role', 'img');
    newBgElement.setAttribute('aria-label', image.alt || `Hero image ${index + 1}`);
    
    // Insert the new background
    this.heroSection.appendChild(newBgElement);
    
    // Trigger the fade-in transition with improved timing
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newBgElement.style.opacity = '1';
      });
    });
    
    // Remove old background images after transition
    setTimeout(() => {
      const oldBgImages = this.heroSection.querySelectorAll('.hero-bg-image:not(:last-child)');
      oldBgImages.forEach(img => img.remove());
    }, this.transitionDuration);

    // Update current index and stats
    this.currentImageIndex = index;
    
    // Log transition for debugging
    console.log(`🖼️  Switched to image ${index + 1}/${this.images.length}: ${image.id}`);
    
    // Dispatch enhanced custom event
    this.heroSection.dispatchEvent(new CustomEvent('heroImageChanged', {
      detail: { 
        image, 
        index, 
        totalImages: this.images.length,
        cycleCount: this.stats.cycleCount,
        imageUrl
      }
    }));
  }

  /**
   * Get the most appropriate image URL based on current screen size
   */
  getResponsiveImageUrl(image) {
    const screenWidth = window.innerWidth;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Use responsive URLs if available
    if (image.responsiveUrls) {
      if (screenWidth <= 768) {
        return image.responsiveUrls.mobile;
      } else if (screenWidth <= 1024) {
        return image.responsiveUrls.tablet;
      } else if (screenWidth <= 1920) {
        return image.responsiveUrls.desktop;
      } else {
        return image.responsiveUrls.ultrawide || image.responsiveUrls.desktop;
      }
    }
    
    // Fallback to optimized URL or original URL
    return image.optimizedUrl || image.originalUrl || image.url;
  }

  /**
   * Move to next image with cycle tracking
   */
  nextImage() {
    if (this.images.length === 0) {
      console.warn('No images available for carousel');
      return;
    }
    
    const nextIndex = (this.currentImageIndex + 1) % this.images.length;
    
    // Track when we complete a full cycle
    if (nextIndex === 0 && this.currentImageIndex === this.images.length - 1) {
      this.stats.cycleCount++;
      console.log(`🔄 Completed cycle ${this.stats.cycleCount} - Starting over with ${this.images.length} images`);
    }
    
    this.setBackgroundImage(nextIndex);
  }

  /**
   * Progressive preloading of images with intelligent batching
   */
  async preloadImages() {
    if (!this.images || this.images.length === 0) {
      console.warn('No images to preload');
      return;
    }

    console.log(`🔄 Starting progressive preloading of ${this.images.length} images...`);
    const startTime = performance.now();
    
    try {
      // Use the CloudinaryImageManager's intelligent preloading
      const loadedCount = await this.imageManager.preloadImages(this.images, this.preloadBatchSize);
      
      this.stats.imagesLoaded = loadedCount;
      this.stats.preloadingTime = performance.now() - startTime;
      
      console.log(`✅ Preloading completed: ${loadedCount}/${this.images.length} images in ${Math.round(this.stats.preloadingTime)}ms`);
      
      // Dispatch preload completion event
      this.heroSection.dispatchEvent(new CustomEvent('heroPreloadComplete', {
        detail: {
          totalImages: this.images.length,
          loadedImages: loadedCount,
          preloadTime: this.stats.preloadingTime,
          success: loadedCount > 0
        }
      }));
      
    } catch (error) {
      console.error('Error during image preloading:', error);
      this.stats.errorCount++;
    }
  }

  /**
   * Start the carousel auto-rotation with enhanced logging
   */
  startCarousel() {
    if (this.intervalId) {
      this.stopCarousel();
    }
    
    if (this.images.length <= 1) {
      console.log('⏸️  Carousel not started - insufficient images');
      return;
    }
    
    console.log(`▶️  Starting carousel: ${this.images.length} images, ${this.intervalDuration/1000}s intervals`);
    
    this.intervalId = setInterval(() => {
      if (!document.hidden) { // Only advance if page is visible
        this.nextImage();
      }
    }, this.intervalDuration);
    
    // Dispatch carousel start event
    this.heroSection.dispatchEvent(new CustomEvent('heroCarouselStart', {
      detail: {
        totalImages: this.images.length,
        intervalDuration: this.intervalDuration
      }
    }));
  }

  /**
   * Stop the carousel auto-rotation
   */
  stopCarousel() {
    if (this.intervalId) {
      console.log('⏸️  Stopping carousel');
      clearInterval(this.intervalId);
      this.intervalId = null;
      
      // Dispatch carousel stop event
      this.heroSection.dispatchEvent(new CustomEvent('heroCarouselStop'));
    }
  }

  /**
   * Handle page visibility changes (pause when tab is not active)
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.stopCarousel();
      console.log('👁️  Page hidden, carousel paused');
    } else {
      if (this.images.length > 1) {
        // Small delay before resuming to ensure page is fully visible
        setTimeout(() => {
          this.startCarousel();
          console.log('👁️  Page visible, carousel resumed');
        }, 100);
      }
    }
  }

  /**
   * Handle window resize events
   */
  handleResize() {
    // Debounce resize events
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      if (this.images.length > 0) {
        // Update current background image for new screen size
        this.setBackgroundImage(this.currentImageIndex);
        console.log('📱 Responsive image updated for new screen size');
      }
    }, 250);
  }

  /**
   * Update Cloudinary configuration
   */
  updateCloudinaryConfig(newConfig) {
    console.log('🔧 Updating Cloudinary configuration...');
    
    // Update local config
    Object.assign(this.cloudinaryConfig, newConfig);
    
    // Update ImageManager config
    this.imageManager.updateConfig(newConfig);
    
    console.log(`📁 New folder path: ${this.cloudinaryConfig.folderPath}`);
  }

  /**
   * Refresh images from Cloudinary with new configuration
   */
  async refresh(newConfig = null) {
    console.log('🔄 Refreshing carousel images...');
    
    // Update config if provided
    if (newConfig) {
      this.updateCloudinaryConfig(newConfig);
    }
    
    this.stopCarousel();
    this.retryCount = 0; // Reset retry count
    
    // Clear current images
    this.images = [];
    this.currentImageIndex = 0;
    
    // Remove existing background images
    const existingBgImages = this.heroSection.querySelectorAll('.hero-bg-image');
    existingBgImages.forEach(img => img.remove());
    
    // Restart initialization
    await this.init();
  }

  /**
   * Retry initialization (called from error state)
   */
  retry() {
    console.log('🔄 Retrying carousel initialization...');
    
    // Remove error overlay
    const errorOverlay = this.heroSection.querySelector('.hero-error-overlay');
    if (errorOverlay) {
      errorOverlay.remove();
    }
    
    // Reset and reinitialize
    this.retryCount = 0;
    this.stats.errorCount = 0;
    this.init();
  }

  /**
   * Destroy the carousel and clean up
   */
  destroy() {
    console.log('🗑️  Destroying hero carousel...');
    
    this.stopCarousel();
    
    // Remove all event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('resize', this.handleResize);
    
    // Clear timeouts
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    // Remove background images and overlays
    const bgImages = this.heroSection?.querySelectorAll('.hero-bg-image');
    bgImages?.forEach(img => img.remove());
    
    const loadingOverlay = this.heroSection?.querySelector('.hero-loading-overlay');
    if (loadingOverlay) loadingOverlay.remove();
    
    const errorOverlay = this.heroSection?.querySelector('.hero-error-overlay');
    if (errorOverlay) errorOverlay.remove();
    
    // Clear image manager cache
    if (this.imageManager) {
      this.imageManager.clearCache();
    }
    
    // Reset stats
    this.stats = {
      imagesLoaded: 0,
      totalImages: 0,
      preloadingTime: 0,
      cycleCount: 0,
      errorCount: 0
    };
    
    console.log('✅ Hero carousel destroyed and cleaned up');
  }

  /**
   * Get comprehensive carousel status
   */
  getStatus() {
    return {
      isActive: !!this.intervalId,
      currentImageIndex: this.currentImageIndex,
      totalImages: this.images.length,
      intervalDuration: this.intervalDuration,
      isLoading: this.isLoading,
      cloudinaryConfig: { ...this.cloudinaryConfig },
      stats: { ...this.stats },
      cacheStatus: this.imageManager ? this.imageManager.getCacheStatus() : null,
      retryCount: this.retryCount,
      currentImage: this.images[this.currentImageIndex] || null
    };
  }

  /**
   * Navigate to specific image by index
   */
  goToImage(index) {
    if (index >= 0 && index < this.images.length) {
      this.setBackgroundImage(index);
      console.log(`🎯 Navigated to image ${index + 1}/${this.images.length}`);
    } else {
      console.warn(`Invalid image index: ${index}`);
    }
  }

  /**
   * Go to previous image
   */
  previousImage() {
    if (this.images.length === 0) return;
    
    const prevIndex = this.currentImageIndex === 0 
      ? this.images.length - 1 
      : this.currentImageIndex - 1;
      
    this.setBackgroundImage(prevIndex);
  }

  /**
   * Pause carousel temporarily
   */
  pause() {
    this.stopCarousel();
    console.log('⏸️  Carousel paused manually');
  }

  /**
   * Resume carousel
   */
  resume() {
    if (this.images.length > 1) {
      this.startCarousel();
      console.log('▶️  Carousel resumed manually');
    }
  }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.heroCarousel = new HeroCarousel({
      // You can customize these options
      cloudName: 'your-cloud-name', // Replace with your Cloudinary cloud name
      folderPath: 'barbershop/hero', // Change this to your desired folder path
      intervalDuration: 15000, // 15 seconds
      maxImages: 300 // Maximum images to load
    });
  });
} else {
  window.heroCarousel = new HeroCarousel({
    cloudName: 'your-cloud-name', // Replace with your Cloudinary cloud name
    folderPath: 'barbershop/hero', // Change this to your desired folder path
    intervalDuration: 15000, // 15 seconds
    maxImages: 300 // Maximum images to load
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeroCarousel;
}
