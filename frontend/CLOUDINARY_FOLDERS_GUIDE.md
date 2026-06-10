# Cloudinary Folder Structure Guide

## Overview
Your barbershop website now has **1-minute interval** image carousels with **specific folder mapping** for each service. Each service card will pull images from its own dedicated Cloudinary folder.

## 🕐 New Timing
- **Hero Carousel**: Changes every **60 seconds** (1 minute)
- **Services Carousels**: Each service changes every **60 seconds** (1 minute)
- **Independent Timers**: Each service has its own rotation cycle

## 📁 Required Cloudinary Folder Structure

Upload your images to these specific folders in your Cloudinary account:

### Hero Section
```
barbershop/hero/
├── hero-image-1.jpg
├── hero-image-2.jpg
└── hero-image-3.jpg
```

### Haircuts Category (✂️)
```
barbershop/services/haircuts/
├── classic-haircut/
│   ├── classic-1.jpg
│   ├── classic-2.jpg
│   └── classic-3.jpg
├── fade/
│   ├── fade-1.jpg
│   ├── fade-2.jpg
│   └── fade-3.jpg
├── afro-shape-up/
│   ├── afro-1.jpg
│   └── afro-2.jpg
├── high-top-fade/
│   ├── hightop-1.jpg
│   └── hightop-2.jpg
├── taper-cut/
│   ├── taper-1.jpg
│   └── taper-2.jpg
└── quick-cut/
    ├── quick-1.jpg
    └── quick-2.jpg
```

### Beard & Shaving Category (🧔)
```
barbershop/services/beard-and-shaving/
├── beard-trim/
│   ├── beard-trim-1.jpg
│   ├── beard-trim-2.jpg
│   └── beard-trim-3.jpg
├── haircut-beard-combo/
│   ├── combo-1.jpg
│   └── combo-2.jpg
├── hot-shave/
│   ├── shave-1.jpg
│   ├── shave-2.jpg
│   └── shave-3.jpg
├── beard-shaping-styling/
│   ├── styling-1.jpg
│   └── styling-2.jpg
└── mustache-grooming/
    ├── mustache-1.jpg
    └── mustache-2.jpg
```

### Hair & Scalp Care Category (🧴)
```
barbershop/services/hair-and-scalp/
├── hair-wash-conditioning/
│   ├── wash-1.jpg
│   └── wash-2.jpg
├── scalp-treatment/
│   ├── scalp-1.jpg
│   └── scalp-2.jpg
├── hair-dye-coloring/
│   ├── coloring-1.jpg
│   ├── coloring-2.jpg
│   └── coloring-3.jpg
├── grey-coverage/
│   ├── grey-1.jpg
│   └── grey-2.jpg
├── texturizer-waves/
│   ├── waves-1.jpg
│   └── waves-2.jpg
└── hair-relaxing/
    ├── relaxing-1.jpg
    └── relaxing-2.jpg
```

### Styling & Designs Category (🎨)
```
barbershop/services/styling-and-designs/
├── hair-designs-patterns/
│   ├── designs-1.jpg
│   ├── designs-2.jpg
│   └── designs-3.jpg
├── mohawk-faux-hawk/
│   ├── mohawk-1.jpg
│   └── mohawk-2.jpg
├── cornrows-simple/
│   ├── cornrows-1.jpg
│   └── cornrows-2.jpg
├── dreadlock-retwist/
│   ├── dreadlock-1.jpg
│   └── dreadlock-2.jpg
└── twists-bantu-knots/
    ├── twists-1.jpg
    └── twists-2.jpg
```

### Kids & Specials Category (👦)
```
barbershop/services/kids-and-specials/
├── kids-cut/
│   ├── kids-1.jpg
│   ├── kids-2.jpg
│   └── kids-3.jpg
├── first-haircut-certificate/
│   ├── first-1.jpg
│   └── first-2.jpg
└── student-discount-cut/
    ├── student-1.jpg
    └── student-2.jpg
```

### Extra Grooming Category (🧖)
```
barbershop/services/extra-grooming/
├── facial-massage/
│   ├── facial-1.jpg
│   └── facial-2.jpg
├── head-scalp-massage/
│   ├── head-massage-1.jpg
│   └── head-massage-2.jpg
├── eyebrow-shaping/
│   ├── eyebrow-1.jpg
│   └── eyebrow-2.jpg
└── ear-nose-trim/
    ├── ear-nose-1.jpg
    └── ear-nose-2.jpg
```

## 🚀 How to Upload Images

### Option 1: Use the Upload Script
```bash
cd backend
node scripts/uploadHeroImages.js directory /path/to/your/images
```

### Option 2: Manual Upload via Cloudinary Dashboard
1. Go to your Cloudinary dashboard
2. Create the folder structure above
3. Upload 2-5 images per service folder
4. Ensure images are properly named and optimized

### Option 3: API Upload (for bulk operations)
```bash
curl -X POST \
  https://api.cloudinary.com/v1_1/{cloud_name}/image/upload \
  -F "upload_preset={upload_preset}" \
  -F "folder=barbershop/services/haircuts/classic-haircut" \
  -F "file=@/path/to/image.jpg"
```

## 📊 Image Specifications

### Recommended Image Properties:
- **Format**: JPG, PNG, WebP
- **Size**: 800x600px (4:3 aspect ratio)
- **File Size**: 200KB - 1MB (will be auto-optimized)
- **Quality**: High quality (Cloudinary will optimize)

### Automatic Optimizations Applied:
- **Auto Quality**: Cloudinary optimizes quality based on content
- **Auto Format**: Serves WebP/AVIF when supported
- **Responsive Sizes**: 
  - Mobile: 400x300px
  - Tablet: 600x450px  
  - Desktop: 800x600px

## 🔍 Testing the Setup

### Console Monitoring:
Open browser developer tools and watch for these logs:
```
🎨 Initializing Hero Carousel (1-minute intervals)...
🎨 Initializing Services Carousel (1-minute intervals)...
📸 Loaded 3 images for classic-haircut from barbershop/services/haircuts/classic-haircut
▶️  Starting carousel for classic-haircut with 60s interval (1 minute)
🖼️  classic-haircut: Switched to image 2/3
```

### Visual Verification:
1. **Hero Section**: Should show different background images every minute
2. **Service Cards**: Each service should rotate through its own images every minute
3. **Dynamic Badges**: "Dynamic" badges on service cards show active carousels
4. **Fallback System**: If no Cloudinary images exist, optimized Unsplash images are used

## ⚙️ Configuration Options

### Change Timing (if needed):
```javascript
// In browser console:
window.heroCarousel.intervalDuration = 30000; // 30 seconds
window.servicesCarousel.intervalDuration = 120000; // 2 minutes
```

### Manual Control:
```javascript
// Stop all carousels
window.servicesCarousel.stopCarousels();

// Refresh images from Cloudinary
window.servicesCarousel.refresh();

// Get status
console.log(window.servicesCarousel.getStatus());
```

## 🎯 Expected Results

Once you upload images to the correct Cloudinary folders:

### ✅ **Hero Section**
- Background changes every 60 seconds
- Smooth fade transitions
- Responsive images for different devices
- Automatic fallback to Unsplash images

### ✅ **Service Cards (30+ services)**
- Each service has its own image rotation
- Independent 60-second intervals
- Service-specific images from dedicated folders
- Smooth opacity transitions

### ✅ **Performance Benefits**
- **60-80% smaller images** through optimization
- **Device-specific serving** (mobile gets smaller images)
- **Modern formats** (WebP/AVIF when supported)
- **Global CDN delivery** for fast loading

## 📞 Next Steps

1. **Add Cloudinary Credentials** to your `backend/.env` file
2. **Upload Images** to the folder structure above
3. **Test the Website** at http://localhost:3000
4. **Monitor Console** for image loading progress
5. **Verify Rotations** - each service should change every minute

Your barbershop website now has professional-grade dynamic image management with service-specific folders and 1-minute rotation intervals!
