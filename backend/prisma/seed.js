const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create initial admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.adminUser.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: adminPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN'
      }
    });

    console.log('✅ Created admin user:', {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role
    });

    // Create some sample barbers
    const existingBarbersCount = await prisma.barber.count();
    
    if (existingBarbersCount === 0) {
      const barber1 = await prisma.barber.create({
        data: {
          name: 'Marconi',
          speciality: 'Classic cuts and beard styling',
          isActive: true,
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          startTime: '09:00',
          endTime: '17:00'
        }
      });

      const barber2 = await prisma.barber.create({
        data: {
          name: 'Junior',
          speciality: 'Modern styles and fades',
          isActive: true,
          workingDays: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          startTime: '10:00',
          endTime: '18:00'
        }
      });

      console.log('✅ Created barbers:', [barber1.name, barber2.name]);
    } else {
      console.log('ℹ️  Barbers already exist, skipping creation');
    }

    // Create all services from HTML frontend
    const services = [
      // HAIRCUTS Category
      {
        name: 'Classic Haircut',
        description: 'Precision cut tailored to your style with clean edging and finish.',
        price: 5000, // ₵50.00 in kobo
        duration: 45,
        category: 'HAIRCUTS',
        serviceId: 'classic-haircut'
      },
      {
        name: 'Fade',
        description: 'Clean fades with sharp line-up. Choose low, mid, high, or skin fade.',
        price: 5500, // ₵55.00 in kobo
        duration: 50,
        category: 'HAIRCUTS',
        serviceId: 'fade'
      },
      {
        name: 'Afro Shape-up',
        description: 'Defined afro outline with crisp edges and a clean finish.',
        price: 6000, // ₵60.00 in kobo
        duration: 40,
        category: 'HAIRCUTS',
        serviceId: 'afro-shape-up'
      },
      {
        name: 'High Top Fade (Old School)',
        description: 'Vintage high-top style with straight, sharp sides—classic Ghana vibes.',
        price: 6500, // ₵65.00 in kobo
        duration: 55,
        category: 'HAIRCUTS',
        serviceId: 'high-top-fade'
      },
      {
        name: 'Taper Cut',
        description: 'Clean taper around the sides and neckline for a subtle, fresh look.',
        price: 5500, // ₵55.00 in kobo
        duration: 40,
        category: 'HAIRCUTS',
        serviceId: 'taper-cut'
      },
      {
        name: 'Quick Cut (Express)',
        description: 'Fast tidy-up for those on the go. Clean edges, no fuss.',
        price: 4000, // ₵40.00 in kobo
        duration: 25,
        category: 'HAIRCUTS',
        serviceId: 'quick-cut'
      },
      
      // BEARD_SHAVING Category
      {
        name: 'Beard Trim',
        description: 'Crisp beard shaping and even length—finished with nourishing oil.',
        price: 3000, // ₵30.00 in kobo
        duration: 30,
        category: 'BEARD_SHAVING',
        serviceId: 'beard-trim'
      },
      {
        name: 'Haircut + Beard Combo',
        description: 'Full haircut with beard grooming—best value for a complete refresh.',
        price: 7000, // ₵70.00 in kobo
        duration: 75,
        category: 'BEARD_SHAVING',
        serviceId: 'haircut-beard-combo'
      },
      {
        name: 'Hot Towel Shave',
        description: 'Traditional straight razor shave with hot towels and soothing finish.',
        price: 4000, // ₵40.00 in kobo
        duration: 45,
        category: 'BEARD_SHAVING',
        serviceId: 'hot-shave'
      },
      {
        name: 'Beard Shaping & Styling',
        description: 'Define cheek lines and neckline for a sharp, balanced look.',
        price: 3500, // ₵35.00 in kobo
        duration: 35,
        category: 'BEARD_SHAVING',
        serviceId: 'beard-shaping-styling'
      },
      {
        name: 'Mustache Grooming',
        description: 'Trim and style to your preference—natural, pencil, or bold.',
        price: 2000, // ₵20.00 in kobo
        duration: 20,
        category: 'BEARD_SHAVING',
        serviceId: 'mustache-grooming'
      },
      
      // HAIR_SCALP_CARE Category
      {
        name: 'Hair Wash & Conditioning',
        description: 'Deep cleanse and hydration to refresh your hair and scalp.',
        price: 2500, // ₵25.00 in kobo
        duration: 30,
        category: 'HAIR_SCALP_CARE',
        serviceId: 'hair-wash-conditioning'
      },
      {
        name: 'Scalp Treatment (Anti-dandruff / Dryness)',
        description: 'Targeted treatment to reduce flakes, itching, and dryness.',
        price: 3000, // ₵30.00 in kobo
        duration: 40,
        category: 'HAIR_SCALP_CARE',
        serviceId: 'scalp-treatment'
      },
      {
        name: 'Hair Dye / Coloring',
        description: 'Semi-permanent or permanent coloring. Price varies by product and length.',
        price: 5000, // ₵50+ in kobo (starting price)
        duration: 90,
        category: 'HAIR_SCALP_CARE',
        serviceId: 'hair-dye-coloring'
      },
      {
        name: 'Grey Coverage',
        description: 'Natural-looking color to blend greys and restore confidence.',
        price: 4500, // ₵45.00 in kobo
        duration: 60,
        category: 'HAIR_SCALP_CARE',
        serviceId: 'grey-coverage'
      },
      {
        name: 'Texturizer / Waves',
        description: 'Enhance curls or waves with professional-grade products.',
        price: 5500, // ₵55.00 in kobo
        duration: 75,
        category: 'HAIR_SCALP_CARE',
        serviceId: 'texturizer-waves'
      },
      {
        name: 'Hair Relaxing',
        description: 'Chemical straightening for smoother, more manageable hair.',
        price: 6000, // ₵60.00 in kobo
        duration: 90,
        category: 'HAIR_SCALP_CARE',
        serviceId: 'hair-relaxing'
      },
      
      // STYLING_DESIGNS Category
      {
        name: 'Hair Designs / Patterns',
        description: 'Custom designs—price depends on complexity and time.',
        price: 7000, // ₵70+ in kobo (starting price)
        duration: 90,
        category: 'STYLING_DESIGNS',
        serviceId: 'hair-designs-patterns'
      },
      {
        name: 'Mohawk / Faux Hawk',
        description: 'Bold center style with tapered sides—make a statement.',
        price: 6000, // ₵60.00 in kobo
        duration: 60,
        category: 'STYLING_DESIGNS',
        serviceId: 'mohawk-faux-hawk'
      },
      {
        name: 'Cornrows (Simple styles)',
        description: 'Neat, simple cornrows. Price varies by length and pattern.',
        price: 8000, // ₵80+ in kobo (starting price)
        duration: 120,
        category: 'STYLING_DESIGNS',
        serviceId: 'cornrows-simple'
      },
      {
        name: 'Dreadlock Grooming / Retwist',
        description: 'Maintain your locs with precise twisting and edge-up.',
        price: 7500, // ₵75.00 in kobo
        duration: 90,
        category: 'STYLING_DESIGNS',
        serviceId: 'dreadlock-retwist'
      },
      {
        name: 'Twists / Bantu Knots',
        description: 'Protective styles with neat parting and professional finish.',
        price: 6500, // ₵65.00 in kobo
        duration: 75,
        category: 'STYLING_DESIGNS',
        serviceId: 'twists-bantu-knots'
      },
      
      // KIDS_SPECIALS Category
      {
        name: 'Kids Cut (12 & under)',
        description: 'Gentle, fun cuts for children with patience and care.',
        price: 3500, // ₵35.00 in kobo
        duration: 30,
        category: 'KIDS_SPECIALS',
        serviceId: 'kids-cut'
      },
      {
        name: 'First Haircut Certificate',
        description: 'Special first haircut experience with keepsake certificate.',
        price: 4000, // ₵40.00 in kobo
        duration: 35,
        category: 'KIDS_SPECIALS',
        serviceId: 'first-haircut-certificate'
      },
      {
        name: 'Student Discount Cut',
        description: 'Affordable cuts for students (ID required).',
        price: 4000, // ₵40.00 in kobo
        duration: 40,
        category: 'KIDS_SPECIALS',
        serviceId: 'student-discount-cut'
      },
      
      // EXTRA_GROOMING Category
      {
        name: 'Facial Massage',
        description: 'Soothing facial massage to relax and rejuvenate.',
        price: 2500, // ₵25.00 in kobo
        duration: 25,
        category: 'EXTRA_GROOMING',
        serviceId: 'facial-massage'
      },
      {
        name: 'Head / Scalp Massage',
        description: 'Stress-relieving massage to stimulate circulation.',
        price: 2000, // ₵20.00 in kobo
        duration: 20,
        category: 'EXTRA_GROOMING',
        serviceId: 'head-scalp-massage'
      },
      {
        name: 'Eyebrow Shaping',
        description: 'Clean, defined brows to complement your look.',
        price: 1500, // ₵15.00 in kobo
        duration: 15,
        category: 'EXTRA_GROOMING',
        serviceId: 'eyebrow-shaping'
      },
      {
        name: 'Ear / Nose Hair Trim',
        description: 'Tidy trim for a polished, professional appearance.',
        price: 1000, // ₵10.00 in kobo
        duration: 10,
        category: 'EXTRA_GROOMING',
        serviceId: 'ear-nose-hair-trim'
      }
    ];

    // Check if services already exist
    const existingServicesCount = await prisma.service.count();
    
    if (existingServicesCount === 0) {
      for (const serviceData of services) {
        const service = await prisma.service.create({
          data: serviceData
        });
        console.log('✅ Created service:', service.name);
      }
    } else {
      console.log('ℹ️  Services already exist, skipping creation');
    }

    // Create business settings
    const businessSettings = await prisma.businessSettings.upsert({
      where: { id: 'main-settings' },
      update: {},
      create: {
        id: 'main-settings',
        name: "Marconi's Barber Shop",
        phone: '0599363145',
        email: 'info@marconis.com',
        address: '123 Barber St, Accra',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 60,
        advanceBookingDays: 30,
        currency: 'GHS',
        currencySymbol: '₵'
      }
    });

    console.log('✅ Created business settings:', businessSettings.name);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Admin Login Details:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n🔗 You can now access the admin dashboard at: http://localhost:3000/#admin');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
