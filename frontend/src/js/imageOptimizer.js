/**
 * Image Optimizer Utility
 * Provides optimized fallback images and Cloudinary URL generation
 */

class ImageOptimizer {
  constructor() {
    this.cloudinaryBaseUrl = 'https://res.cloudinary.com/demo'; // Replace with your cloud name
    this.fallbackImages = this.getFallbackImageMap();
  }

  /**
   * Get optimized fallback images using Unsplash with auto-optimization
   */
  getFallbackImageMap() {
    return {
      // Haircuts
      'classic-haircut': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&h=300&q=80',
      'fade': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&h=300&q=80',
      'afro-shape-up': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&h=300&q=80',
      'high-top-fade': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&h=300&q=80',
      'taper-cut': 'https://images.unsplash.com/photo-1555129016-9d4d99a5ca01?auto=format&fit=crop&w=400&h=300&q=80',
      'quick-cut': 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=400&h=300&q=80',
      
      // Beard & Shaving
      'beard-trim': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&h=300&q=80',
      'haircut-beard-combo': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&h=300&q=80',
      'hot-shave': 'https://images.unsplash.com/photo-1555129016-9d4d99a5ca01?auto=format&fit=crop&w=400&h=300&q=80',
      'beard-shaping-styling': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&h=300&q=80',
      'mustache-grooming': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&h=300&q=80',
      
      // Hair & Scalp Care
      'hair-wash-conditioning': 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=400&h=300&q=80',
      'scalp-treatment': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&h=300&q=80',
      'hair-dye-coloring': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&h=300&q=80',
      'grey-coverage': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&h=300&q=80',
      'texturizer-waves': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&h=300&q=80',
      'hair-relaxing': 'https://images.unsplash.com/photo-1555129016-9d4d99a5ca01?auto=format&fit=crop&w=400&h=300&q=80',
      
      // Styling & Designs
      'hair-designs-patterns': 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=400&h=300&q=80',
      'mohawk-faux-hawk': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&h=300&q=80',
      'cornrows-simple': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&h=300&q=80',
      'dreadlock-retwist': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&h=300&q=80',
      'twists-bantu-knots': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&h=300&q=80',
      
      // Kids & Specials
      'kids-cut': 'https://images.unsplash.com/photo-1555129016-9d4d99a5ca01?auto=format&fit=crop&w=400&h=300&q=80',
      'first-haircut-certificate': 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=400&h=300&q=80',
      'student-discount-cut': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&h=300&q=80',
      
      // Extra Grooming
      'facial-massage': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&h=300&q=80',
      'head-scalp-massage': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&h=300&q=80',
      'eyebrow-shaping': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&h=300&q=80',
      'ear-nose-hair-trim': 'https://images.unsplash.com/photo-1555129016-9d4d99a5ca01?auto=format&fit=crop&w=400&h=300&q=80'
    };
  }

  /**
   * Get optimized image URL for a service
   */
  getOptimizedImageUrl(serviceId, width = 400, height = 300, quality = 80) {
    const fallbackUrl = this.fallbackImages[serviceId];
    
    if (fallbackUrl && fallbackUrl.includes('unsplash.com')) {
      // Update Unsplash URL with specific dimensions and quality
      const url = new URL(fallbackUrl);
      url.searchParams.set('w', width);
      url.searchParams.set('h', height);
      url.searchParams.set('q', quality);
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('auto', 'format');
      return url.toString();
    }
    
    return fallbackUrl || this.getDefaultImage();
  }

  /**
   * Get default image when service image is not found
   */
  getDefaultImage() {
    return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&h=300&q=80';
  }

  /**
   * Replace all service images with optimized versions
   */
  optimizeAllServiceImages() {
    console.log('🖼️ Optimizing service card images...');
    
    const serviceCards = document.querySelectorAll('[data-service-id]');
    
    serviceCards.forEach(card => {
      const serviceId = card.getAttribute('data-service-id');
      const imgElement = card.querySelector('.service-image');
      
      if (imgElement && serviceId) {
        const optimizedUrl = this.getOptimizedImageUrl(serviceId);
        imgElement.src = optimizedUrl;
        imgElement.alt = `${serviceId.replace(/-/g, ' ')} service`;
        
        // Add loading optimization
        imgElement.loading = 'lazy';
        imgElement.decoding = 'async';
      }
    });
    
    console.log(`✅ Optimized ${serviceCards.length} service images`);
  }

  /**
   * Create responsive image srcset for better performance
   */
  createResponsiveSrcSet(serviceId) {
    const baseUrl = this.fallbackImages[serviceId];
    
    if (!baseUrl || !baseUrl.includes('unsplash.com')) {
      return null;
    }

    const sizes = [
      { width: 300, height: 225, descriptor: '300w' },
      { width: 400, height: 300, descriptor: '400w' },
      { width: 600, height: 450, descriptor: '600w' },
      { width: 800, height: 600, descriptor: '800w' }
    ];

    const srcSet = sizes.map(size => {
      const url = new URL(baseUrl);
      url.searchParams.set('w', size.width);
      url.searchParams.set('h', size.height);
      url.searchParams.set('q', '80');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('auto', 'format');
      return `${url.toString()} ${size.descriptor}`;
    }).join(', ');

    return srcSet;
  }

  /**
   * Apply responsive images to all service cards
   */
  applyResponsiveImages() {
    console.log('📱 Applying responsive images...');
    
    const serviceCards = document.querySelectorAll('[data-service-id]');
    
    serviceCards.forEach(card => {
      const serviceId = card.getAttribute('data-service-id');
      const imgElement = card.querySelector('.service-image');
      
      if (imgElement && serviceId) {
        const srcSet = this.createResponsiveSrcSet(serviceId);
        if (srcSet) {
          imgElement.srcset = srcSet;
          imgElement.sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
        }
      }
    });
    
    console.log(`✅ Applied responsive images to ${serviceCards.length} service cards`);
  }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.imageOptimizer = new ImageOptimizer();
    window.imageOptimizer.optimizeAllServiceImages();
    window.imageOptimizer.applyResponsiveImages();
  });
} else {
  window.imageOptimizer = new ImageOptimizer();
  window.imageOptimizer.optimizeAllServiceImages();
  window.imageOptimizer.applyResponsiveImages();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageOptimizer;
}
