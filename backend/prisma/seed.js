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

    // Create some sample services
    const services = [
      {
        name: 'Classic Haircut',
        description: 'Traditional haircut with styling',
        price: 2500, // ₵25.00 in cents
        duration: 45
      },
      {
        name: 'Beard Trim',
        description: 'Professional beard trimming and shaping',
        price: 1500, // ₵15.00 in cents
        duration: 30
      },
      {
        name: 'Hot Towel Shave',
        description: 'Traditional straight razor shave with hot towels',
        price: 4000, // ₵40.00 in cents
        duration: 60
      },
      {
        name: 'Hair Wash & Style',
        description: 'Professional hair wash and styling',
        price: 2000, // ₵20.00 in cents
        duration: 30
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
