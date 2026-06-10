/**
 * Configuration File for Marconi's Barber Shop
 * Easy configuration management for Cloudinary and other services
 * 
 * IMPORTANT: Replace the placeholder values with your actual credentials
 */

const AppConfig = {
  // API Configuration
  api: {
    // Dynamically determine backend URL based on environment
    baseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000' 
      : 'https://barbering.marconi.com'
  },
  
  // Cloudinary Configuration
  cloudinary: {
    // Replace with your actual Cloudinary cloud name
    cloudName: 'dhgeor7ju', // Your actual Cloudinary cloud name
    
    // Hero section configuration
    hero: {
      // Folder path in Cloudinary containing hero images
      folderPath: 'barbershop/hero',
      
      // Maximum number of images to load (set to 0 for unlimited)
      maxImages: 300,
      
      // Image rotation interval in seconds
      intervalDuration: 15,
      
      // Transition duration in milliseconds
      transitionDuration: 1500,
      
      // Batch size for progressive image preloading
      preloadBatchSize: 10,
      
      // Cache expiry time in milliseconds (1 hour default)
      cacheExpiry: 3600000
    },
    
    // Services section configuration
    services: {
      // Base folder for service images
      baseFolderPath: 'barbershop/services',
      
      // Service-specific folders (optional - will use baseFolderPath if not specified)
      folders: {
        'classic-haircut': 'barbershop/services/haircuts/classic-haircut',
        'fade': 'barbershop/services/haircuts/fades',
        'afro-shape-up': 'barbershop/services/haircuts/afro-styles',
        'beard-trim': 'barbershop/services/beard-trimming',
        'mustache-grooming': 'barbershop/services/mustache-trimming',
        'hair-dye-coloring': 'barbershop/services/hair-coloring',
        'mohawk-faux-hawk': 'barbershop/services/styling/mohawks',
        'kids-cut': 'barbershop/services/children-cuts'
      },
      
      // Images to cycle per service (0 for all available)
      maxImagesPerService: 5,
      
      // Rotation interval for service images in seconds
      rotationInterval: 12,
      
      // Cache expiry for service images
      cacheExpiry: 1800000 // 30 minutes
    },
    
    // Default image optimization settings
    optimization: {
      quality: 'auto:good',
      format: 'auto',
      crop: 'fill',
      gravity: 'auto'
    },
    
    // Responsive breakpoints
    breakpoints: {
      mobile: { width: 768, height: 432 },
      tablet: { width: 1024, height: 576 },
      desktop: { width: 1920, height: 1080 },
      ultrawide: { width: 2560, height: 1440 }
    }
  },
  
  // Performance Configuration
  performance: {
    // Enable/disable image preloading
    enablePreloading: true,
    
    // Preload batch size (number of images to preload at once)
    preloadBatchSize: 10,
    
    // Delay between preload batches in milliseconds
    preloadBatchDelay: 100,
    
    // Enable/disable animations for better performance on slower devices
    enableAnimations: true,
    
    // Reduce motion for accessibility
    respectReducedMotion: true
  },
  
  // Debug and Development
  debug: {
    // Enable console logging
    enableLogging: true,
    
    // Log level: 'error', 'warn', 'info', 'debug'
    logLevel: 'info',
    
    // Show performance metrics
    showPerformanceMetrics: true,
    
    // Show image loading progress
    showLoadingProgress: true
  },
  
  // Fallback Configuration
  fallback: {
    // Fallback images when Cloudinary is unavailable
    heroImages: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80'
    ],
    
    // Default service image
    serviceImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80'
  },
  
  // Feature Flags
  features: {
    // Enable dynamic hero carousel
    enableHeroCarousel: true,
    
    // Enable service image carousels
    enableServiceCarousels: true,
    
    // Enable responsive images
    enableResponsiveImages: true,
    
    // Enable image optimization
    enableImageOptimization: true,
    
    // Enable caching
    enableCaching: true
  }
};

// Configuration validation
const ConfigValidator = {
  validate: function() {
    const errors = [];
    
    // Check required Cloudinary settings
    if (!AppConfig.cloudinary.cloudName || AppConfig.cloudinary.cloudName === 'your-cloud-name') {
      errors.push('Cloudinary cloud name must be configured in config.js');
    }
    
    // Check hero folder path
    if (!AppConfig.cloudinary.hero.folderPath) {
      errors.push('Hero folder path is required');
    }
    
    // Check interval duration
    if (AppConfig.cloudinary.hero.intervalDuration < 5) {
      errors.push('Hero interval duration should be at least 5 seconds');
    }
    
    // Log errors if debug is enabled
    if (AppConfig.debug.enableLogging && errors.length > 0) {
      console.error('Configuration validation errors:', errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
};

// Easy configuration update methods
const ConfigManager = {
  // Update Cloudinary cloud name
  updateCloudName: function(cloudName) {
    AppConfig.cloudinary.cloudName = cloudName;
    console.log('Cloud name updated:', cloudName);
  },
  
  // Update hero folder path
  updateHeroFolder: function(folderPath) {
    AppConfig.cloudinary.hero.folderPath = folderPath;
    console.log('Hero folder updated:', folderPath);
  },
  
  // Update hero interval
  updateHeroInterval: function(seconds) {
    AppConfig.cloudinary.hero.intervalDuration = seconds;
    console.log('Hero interval updated:', seconds, 'seconds');
  },
  
  // Add service folder mapping
  addServiceFolder: function(serviceId, folderPath) {
    AppConfig.cloudinary.services.folders[serviceId] = folderPath;
    console.log('Service folder added:', serviceId, '->', folderPath);
  },
  
  // Enable/disable features
  toggleFeature: function(featureName, enabled) {
    if (AppConfig.features.hasOwnProperty(featureName)) {
      AppConfig.features[featureName] = enabled;
      console.log('Feature', featureName, enabled ? 'enabled' : 'disabled');
    }
  },
  
  // Get current configuration
  getConfig: function() {
    return { ...AppConfig };
  },
  
  // Export configuration for debugging
  exportConfig: function() {
    return JSON.stringify(AppConfig, null, 2);
  }
};

// Quick setup presets
const ConfigPresets = {
  // Development preset with debug enabled
  development: {
    debug: { enableLogging: true, logLevel: 'debug', showPerformanceMetrics: true },
    performance: { enablePreloading: true, preloadBatchSize: 5 },
    cloudinary: { hero: { intervalDuration: 10, maxImages: 50 } }
  },
  
  // Production preset optimized for performance
  production: {
    debug: { enableLogging: false, logLevel: 'error', showPerformanceMetrics: false },
    performance: { enablePreloading: true, preloadBatchSize: 10 },
    cloudinary: { hero: { intervalDuration: 15, maxImages: 300 } }
  },
  
  // Low-bandwidth preset for slower connections
  lowBandwidth: {
    performance: { enablePreloading: false, preloadBatchSize: 3 },
    cloudinary: { 
      hero: { intervalDuration: 20, maxImages: 100 },
      optimization: { quality: 'auto:low' }
    }
  },
  
  // Apply preset
  apply: function(presetName) {
    const preset = this[presetName];
    if (preset) {
      // Deep merge preset with current config
      Object.keys(preset).forEach(key => {
        if (typeof preset[key] === 'object' && !Array.isArray(preset[key])) {
          AppConfig[key] = { ...AppConfig[key], ...preset[key] };
        } else {
          AppConfig[key] = preset[key];
        }
      });
      console.log('Applied preset:', presetName);
    } else {
      console.warn('Unknown preset:', presetName);
    }
  }
};

// Auto-detect environment and apply appropriate preset
function autoConfigureEnvironment() {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    ConfigPresets.apply('development');
    console.log('🔧 Development environment detected - debug mode enabled');
  } else {
    ConfigPresets.apply('production');
    console.log('🚀 Production environment detected - optimized settings applied');
  }
}

// Initialize configuration
if (typeof window !== 'undefined') {
  // Browser environment
  window.AppConfig = AppConfig;
  window.ConfigManager = ConfigManager;
  window.ConfigPresets = ConfigPresets;
  window.ConfigValidator = ConfigValidator;
  
  // Auto-configure based on environment
  autoConfigureEnvironment();
  
  // Validate configuration
  const validation = ConfigValidator.validate();
  if (!validation.isValid && AppConfig.debug.enableLogging) {
    console.warn('⚠️  Configuration issues found. Please check config.js');
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AppConfig,
    ConfigManager,
    ConfigPresets,
    ConfigValidator
  };
}

/* 
  QUICK SETUP GUIDE:
  
  1. Replace 'your-cloud-name' with your actual Cloudinary cloud name
  2. Update folder paths to match your Cloudinary structure
  3. Adjust intervals and limits based on your needs
  4. For production, apply the production preset:
     ConfigPresets.apply('production');
  
  EXAMPLE USAGE:
  
  // Update cloud name
  ConfigManager.updateCloudName('marconis-barbershop');
  
  // Update hero settings
  ConfigManager.updateHeroFolder('barbershop/hero-photos');
  ConfigManager.updateHeroInterval(20);
  
  // Add service folder
  ConfigManager.addServiceFolder('premium-cuts', 'barbershop/services/premium');
  
  // Enable/disable features
  ConfigManager.toggleFeature('enableServiceCarousels', true);
  
  // Apply preset
  ConfigPresets.apply('production');
*/
