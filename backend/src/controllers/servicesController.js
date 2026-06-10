const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Category mapping for display purposes
const CATEGORY_LABELS = {
  HAIRCUTS: '✂️ Haircuts',
  BEARD_SHAVING: '🧔 Beard & Shaving',
  HAIR_SCALP_CARE: '🧴 Hair & Scalp Care',
  STYLING_DESIGNS: '🎨 Styling & Designs',
  KIDS_SPECIALS: '👦 Kids & Specials',
  EXTRA_GROOMING: '🧖 Extra Grooming'
};

/**
 * Get all services grouped by category
 */
const getAllServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // Group services by category
    const servicesByCategory = {};
    
    // Initialize all categories
    Object.keys(CATEGORY_LABELS).forEach(category => {
      servicesByCategory[category] = {
        label: CATEGORY_LABELS[category],
        services: []
      };
    });

    // Group services
    services.forEach(service => {
      if (servicesByCategory[service.category]) {
        servicesByCategory[service.category].services.push({
          ...service,
          // Convert price from kobo to cedis for display
          displayPrice: (service.price / 100).toFixed(2)
        });
      }
    });

    res.json({
      success: true,
      categories: servicesByCategory,
      totalServices: services.length
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get services for booking (simplified format)
 */
const getServicesForBooking = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        category: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    const formattedServices = services.map(service => ({
      ...service,
      displayPrice: `₵${(service.price / 100).toFixed(2)}`,
      categoryLabel: CATEGORY_LABELS[service.category] || service.category
    }));

    res.json({
      success: true,
      services: formattedServices
    });
  } catch (error) {
    console.error('Error fetching services for booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services for booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a single service by ID
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      service: {
        ...service,
        displayPrice: `₵${(service.price / 100).toFixed(2)}`,
        categoryLabel: CATEGORY_LABELS[service.category] || service.category
      }
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new service (Admin only)
 */
const createService = async (req, res) => {
  try {
    const {
      name,
      description,
      price, // Expected in kobo (cents)
      duration,
      category,
      serviceId
    } = req.body;

    // Validate required fields
    if (!name || !price || !duration || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, duration, and category are required'
      });
    }

    // Validate category
    if (!Object.keys(CATEGORY_LABELS).includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
        validCategories: Object.keys(CATEGORY_LABELS)
      });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseInt(price), // Ensure price is integer (kobo)
        duration: parseInt(duration),
        category,
        serviceId: serviceId || name.toLowerCase().replace(/\s+/g, '-')
      }
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: {
        ...service,
        displayPrice: `₵${(service.price / 100).toFixed(2)}`,
        categoryLabel: CATEGORY_LABELS[service.category]
      }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A service with this serviceId already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update an existing service (Admin only)
 */
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert price to integer if provided
    if (updateData.price) {
      updateData.price = parseInt(updateData.price);
    }

    // Convert duration to integer if provided
    if (updateData.duration) {
      updateData.duration = parseInt(updateData.duration);
    }

    // Validate category if provided
    if (updateData.category && !Object.keys(CATEGORY_LABELS).includes(updateData.category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
        validCategories: Object.keys(CATEGORY_LABELS)
      });
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: {
        ...service,
        displayPrice: `₵${(service.price / 100).toFixed(2)}`,
        categoryLabel: CATEGORY_LABELS[service.category]
      }
    });
  } catch (error) {
    console.error('Error updating service:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A service with this serviceId already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a service (Admin only)
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if service has any bookings
    const bookingCount = await prisma.booking.count({
      where: { serviceId: id }
    });

    if (bookingCount > 0) {
      // Instead of deleting, deactivate the service
      const service = await prisma.service.update({
        where: { id },
        data: { isActive: false }
      });

      return res.json({
        success: true,
        message: `Service deactivated instead of deleted due to existing bookings (${bookingCount} bookings)`,
        service: {
          ...service,
          displayPrice: `₵${(service.price / 100).toFixed(2)}`,
          categoryLabel: CATEGORY_LABELS[service.category]
        }
      });
    }

    // Safe to delete
    await prisma.service.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Toggle service active status (Admin only)
 */
const toggleServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive }
    });

    res.json({
      success: true,
      message: `Service ${updatedService.isActive ? 'activated' : 'deactivated'} successfully`,
      service: {
        ...updatedService,
        displayPrice: `₵${(updatedService.price / 100).toFixed(2)}`,
        categoryLabel: CATEGORY_LABELS[updatedService.category]
      }
    });
  } catch (error) {
    console.error('Error toggling service status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle service status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all services for admin management (includes inactive services)
 */
const getAllServicesForAdmin = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    const servicesWithMeta = services.map(service => ({
      ...service,
      displayPrice: `₵${(service.price / 100).toFixed(2)}`,
      categoryLabel: CATEGORY_LABELS[service.category] || service.category
    }));

    res.json({
      success: true,
      services: servicesWithMeta,
      totalServices: services.length,
      activeServices: services.filter(s => s.isActive).length,
      categories: Object.keys(CATEGORY_LABELS).map(key => ({
        value: key,
        label: CATEGORY_LABELS[key]
      }))
    });
  } catch (error) {
    console.error('Error fetching all services for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services for admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllServices,
  getServicesForBooking,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  getAllServicesForAdmin,
  CATEGORY_LABELS
};
