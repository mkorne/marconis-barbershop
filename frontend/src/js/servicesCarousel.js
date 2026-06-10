/**
 * Services Carousel Component
 * Manages dynamic images for the services section
 * Changes service images every 60 seconds with smooth transitions
 */

class ServicesCarousel {
  constructor(options = {}) {
    // Comprehensive service mappings for all services in the barbershop
    // Each service points to its own specific Cloudinary folder
    this.services = [
      // Haircuts Category
      { id: 'classic-haircut', folder: 'barbershop/services/haircuts/classic-haircut' },
      { id: 'fade', folder: 'barbershop/services/haircuts/fade' },
      { id: 'afro-shape-up', folder: 'barbershop/services/haircuts/afro-shape-up' },
      { id: 'high-top-fade', folder: 'barbershop/services/haircuts/high-top-fade' },
      { id: 'taper-cut', folder: 'barbershop/services/haircuts/taper-cut' },
      { id: 'quick-cut', folder: 'barbershop/services/haircuts/quick-cut' },
      
      // Beard & Shaving Category
      { id: 'beard-trim', folder: 'barbershop/services/beard-and-shaving/beard-trim' },
      { id: 'haircut-beard-combo', folder: 'barbershop/services/beard-and-shaving/haircut-beard-combo' },
      { id: 'hot-shave', folder: 'barbershop/services/beard-and-shaving/hot-shave' },
      { id: 'beard-shaping-styling', folder: 'barbershop/services/beard-and-shaving/beard-shaping-styling' },
      { id: 'mustache-grooming', folder: 'barbershop/services/beard-and-shaving/mustache-grooming' },
      
      // Hair & Scalp Care Category
      { id: 'hair-wash-conditioning', folder: 'barbershop/services/hair-and-scalp/hair-wash-conditioning' },
      { id: 'scalp-treatment', folder: 'barbershop/services/hair-and-scalp/scalp-treatment' },
      { id: 'hair-dye-coloring', folder: 'barbershop/services/hair-and-scalp/hair-dye-coloring' },
      { id: 'grey-coverage', folder: 'barbershop/services/hair-and-scalp/grey-coverage' },
      { id: 'texturizer-waves', folder: 'barbershop/services/hair-and-scalp/texturizer-waves' },
      { id: 'hair-relaxing', folder: 'barbershop/services/hair-and-scalp/hair-relaxing' },
      
      // Styling & Designs Category
      { id: 'hair-designs-patterns', folder: 'barbershop/services/styling-and-designs/hair-designs-patterns' },
      { id: 'mohawk-faux-hawk', folder: 'barbershop/services/styling-and-designs/mohawk-faux-hawk' },
      { id: 'cornrows-simple', folder: 'barbershop/services/styling-and-designs/cornrows-simple' },
      { id: 'dreadlock-retwist', folder: 'barbershop/services/styling-and-designs/dreadlock-retwist' },
      { id: 'twists-bantu-knots', folder: 'barbershop/services/styling-and-designs/twists-bantu-knots' },
      
      // Kids & Specials Category
      { id: 'kids-cut', folder: 'barbershop/services/kids-and-specials/kids-cut' },
      { id: 'first-haircut-certificate', folder: 'barbershop/services/kids-and-specials/first-haircut-certificate' },
      { id: 'student-discount-cut', folder: 'barbershop/services/kids-and-specials/student-discount-cut' },
      
      // Extra Grooming Category
      { id: 'facial-massage', folder: 'barbershop/services/extra-grooming/facial-massage' },
      { id: 'head-scalp-massage', folder: 'barbershop/services/extra-grooming/head-scalp-massage' },
      { id: 'eyebrow-shaping', folder: 'barbershop/services/extra-grooming/eyebrow-shaping' },
      { id: 'ear-nose-trim', folder: 'barbershop/services/extra-grooming/ear-nose-trim' }
    ];
    
    this.serviceImages = {};
    this.currentImageIndices = {};
    this.intervalDuration = options.intervalDuration || 60000; // 60 seconds
    this.apiEndpoint = options.apiEndpoint || `${window.AppConfig?.api?.baseUrl || 'http://localhost:5000'}/api/images/gallery`;
    this.intervalIds = {};
    this.isLoading = false;
    this.retryCount = 0;
    this.maxRetries = 3;

    // Bind methods
    this.init = this.init.bind(this);
    this.fetchServiceImages = this.fetchServiceImages.bind(this);
    this.startCarousels = this.startCarousels.bind(this);
    this.stopCarousels = this.stopCarousels.bind(this);
    this.rotateServiceImage = this.rotateServiceImage.bind(this);

    // Initialize immediately
    this.init();
  }

  /**
   * Initialize the services carousel
   */
  async init() {
    console.log('🎨 Initializing Services Carousel (1-minute intervals)...');

    try {
      // Fetch images for each service
      await this.fetchAllServiceImages();
      
      if (Object.keys(this.serviceImages).length === 0) {
        console.warn('No service images found');
        return;
      }

      // Set initial images
      this.setInitialImages();
      
      // Start carousels for services that have multiple images
      this.startCarousels();

      console.log(`✅ Services Carousel initialized for ${Object.keys(this.serviceImages).length} services (changing every 60 seconds)`);
      
    } catch (error) {
      console.error('Failed to initialize services carousel:', error);
      
      // Retry initialization after a delay
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying initialization (${this.retryCount}/${this.maxRetries})...`);
        setTimeout(() => this.init(), 5000);
      }
    }
  }

  /**
   * Fetch images for all services
   */
  async fetchAllServiceImages() {
    console.log('📡 Fetching service images from specific folders...');
    
    const fetchPromises = this.services.map(async (service) => {
      try {
        const images = await this.fetchServiceImages(service.folder);
        if (images.length > 0) {
          this.serviceImages[service.id] = images;
          this.currentImageIndices[service.id] = 0;
          console.log(`📸 Loaded ${images.length} images for ${service.id} from ${service.folder}`);
        } else {
          console.log(`⚠️  No images found for ${service.id} in ${service.folder}, using fallback`);
        }
      } catch (error) {
        console.warn(`Failed to load images for ${service.id}:`, error);
      }
      
      // Always ensure we have fallback images
      if (!this.serviceImages[service.id] || this.serviceImages[service.id].length === 0) {
        this.serviceImages[service.id] = this.getFallbackImages(service.id);
        this.currentImageIndices[service.id] = 0;
      }
    });

    await Promise.all(fetchPromises);
  }

  /**
   * Fetch images from API for a specific service folder
   */
  async fetchServiceImages(folder) {
    if (this.isLoading) return [];
    
    try {
      const response = await fetch(`${this.apiEndpoint}?folder=${folder}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.data || !data.data.images) {
        throw new Error('Invalid API response format');
      }

      return data.data.images.map(image => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        responsive: image.responsive
      }));
      
    } catch (error) {
      console.error(`Error fetching images for folder ${folder}:`, error);
      return [];
    }
  }

  /**
   * Get fallback images when API fails or no images found
   */
  getFallbackImages(serviceId) {
    const fallbackImages = {
      // Haircuts
      'classic-haircut': [
        {
          id: 'fallback-classic-haircut-1',
          url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&h=300&q=80',
          alt: 'Classic Haircut Service'
        },
        {
          id: 'fallback-classic-haircut-2', 
          url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&h=300&q=80',
          alt: 'Professional Classic Haircut'
        }
      ],
      'fade': [
        {
          id: 'fallback-fade-1',
          url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&h=300&q=80',
          alt: 'Fade Haircut Service'
        }
      ],
      'beard-trim': [
        {
          id: 'fallback-beard-1',
          url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&h=300&q=80',
          alt: 'Beard Trimming Service'
        },
        {
          id: 'fallback-beard-2',
          url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&h=300&q=80',
          alt: 'Professional Beard Grooming'
        }
      ],
      'hot-shave': [
        {
          id: 'fallback-shave-1',
          url: 'https://images.unsplash.com/photo-1555129016-9d4d99a5ca01?auto=format&fit=crop&w=400&h=300&q=80',
          alt: 'Hot Towel Shave Service'
        },
        {
          id: 'fallback-shave-2',
          url: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=400&h=300&q=80',
          alt: 'Traditional Shaving'
        }
      ]
    };

    // Return specific fallbacks or default to classic haircut images
    return fallbackImages[serviceId] || fallbackImages['classic-haircut'];
  }

  /**
   * Set initial images for all services
   */
  setInitialImages() {
    this.services.forEach(service => {
      const images = this.serviceImages[service.id];
      if (images && images.length > 0) {
        this.updateServiceImage(service.id, 0);
      }
    });
  }

  /**
   * Update service image
   */
  updateServiceImage(serviceId, imageIndex) {
    const images = this.serviceImages[serviceId];
    if (!images || images.length === 0) return;

    const image = images[imageIndex];
    const serviceCard = document.querySelector(`[data-service-id="${serviceId}"]`);
    
    if (!serviceCard) {
      console.warn(`Service card not found for ${serviceId}`);
      return;
    }

    const imgElement = serviceCard.querySelector('.service-image');
    if (!imgElement) return;

    // Use responsive image if available
    let imageUrl = image.url;
    if (image.responsive) {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 768 && image.responsive.mobile) {
        imageUrl = image.responsive.mobile;
      } else if (screenWidth <= 1024 && image.responsive.tablet) {
        imageUrl = image.responsive.tablet;
      }
    }

    // Add fade transition
    imgElement.style.opacity = '0.5';
    
    setTimeout(() => {
      imgElement.src = imageUrl;
      imgElement.alt = image.alt;
      imgElement.style.opacity = '1';
    }, 200);

    // Update current index
    this.currentImageIndices[serviceId] = imageIndex;

    // Dispatch custom event
    serviceCard.dispatchEvent(new CustomEvent('serviceImageChanged', {
      detail: { serviceId, image, imageIndex }
    }));
  }

  /**
   * Rotate to next image for a specific service
   */
  rotateServiceImage(serviceId) {
    const images = this.serviceImages[serviceId];
    if (!images || images.length <= 1) return;

    const currentIndex = this.currentImageIndices[serviceId];
    const nextIndex = (currentIndex + 1) % images.length;
    
    this.updateServiceImage(serviceId, nextIndex);
    
    console.log(`🖼️  ${serviceId}: Switched to image ${nextIndex + 1}/${images.length}`);
  }

  /**
   * Start carousels for services with multiple images
   */
  startCarousels() {
    this.services.forEach(service => {
      const images = this.serviceImages[service.id];
      if (images && images.length > 1) {
        console.log(`▶️  Starting carousel for ${service.id} with ${this.intervalDuration/1000}s interval (1 minute)`);
        
        this.intervalIds[service.id] = setInterval(() => {
          this.rotateServiceImage(service.id);
        }, this.intervalDuration);
      }
    });
  }

  /**
   * Stop all carousels
   */
  stopCarousels() {
    Object.keys(this.intervalIds).forEach(serviceId => {
      if (this.intervalIds[serviceId]) {
        console.log(`⏸️  Stopping carousel for ${serviceId}`);
        clearInterval(this.intervalIds[serviceId]);
        delete this.intervalIds[serviceId];
      }
    });
  }

  /**
   * Refresh images for all services
   */
  async refresh() {
    console.log('🔄 Refreshing service images...');
    this.stopCarousels();
    this.serviceImages = {};
    this.currentImageIndices = {};
    await this.init();
  }

  /**
   * Destroy the carousel and clean up
   */
  destroy() {
    this.stopCarousels();
    console.log('🗑️  Services carousel destroyed');
  }

  /**
   * Get current carousel status
   */
  getStatus() {
    return {
      services: this.services.length,
      activeCarousels: Object.keys(this.intervalIds).length,
      totalImages: Object.values(this.serviceImages).reduce((sum, images) => sum + images.length, 0),
      intervalDuration: this.intervalDuration,
      isLoading: this.isLoading
    };
  }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.servicesCarousel = new ServicesCarousel();
  });
} else {
  window.servicesCarousel = new ServicesCarousel();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ServicesCarousel;
}
