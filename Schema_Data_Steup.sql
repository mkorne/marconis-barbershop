-- ========================================
-- PART 2: SCHEMA AND DATA SETUP
-- Run this after connecting to marconis_barbershop
-- ========================================

-- Create Schema and Set Privileges
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO barber_app;
GRANT ALL ON SCHEMA public TO public;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO barber_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO barber_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO barber_app;

-- Create Enums (in correct order)
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'MOBILE_MONEY', 'CARD');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "MessageType" AS ENUM ('CUSTOMER_SUPPORT', 'BOOKING_INQUIRY', 'COMPLAINT', 'GENERAL');
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'REPLIED');
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF');

-- Users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- Barbers table
CREATE TABLE "barbers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "speciality" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "workingDays" TEXT[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "barbers_pkey" PRIMARY KEY ("id")
);

-- Services table
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- Bookings table
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "barberId" TEXT,
    "serviceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- Payments table
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for payment-booking relationship
CREATE UNIQUE INDEX "payments_bookingId_key" ON "payments"("bookingId");

-- Messages table
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'CUSTOMER_SUPPORT',
    "status" "MessageStatus" NOT NULL DEFAULT 'UNREAD',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "reply" TEXT,
    
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Business Settings table
CREATE TABLE "business_settings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Marconi''s Barber Shop',
    "phone" TEXT NOT NULL DEFAULT '0599363145',
    "email" TEXT NOT NULL DEFAULT 'info@marconis.com',
    "address" TEXT NOT NULL DEFAULT '123 Barber St, Accra',
    "workingDays" TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '17:00',
    "slotDuration" INTEGER NOT NULL DEFAULT 60,
    "advanceBookingDays" INTEGER NOT NULL DEFAULT 30,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "currencySymbol" TEXT NOT NULL DEFAULT '₵',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);

-- Admin Users table
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for admin username
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- Create Foreign Key Constraints
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_barberId_fkey" 
    FOREIGN KEY ("barberId") REFERENCES "barbers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceId_fkey" 
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" 
    FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create Indexes for Performance
CREATE INDEX "idx_bookings_customer" ON "bookings"("customerId");
CREATE INDEX "idx_bookings_barber" ON "bookings"("barberId");
CREATE INDEX "idx_bookings_service" ON "bookings"("serviceId");
CREATE INDEX "idx_bookings_date" ON "bookings"("date");
CREATE INDEX "idx_bookings_status" ON "bookings"("status");
CREATE INDEX "idx_payments_customer" ON "payments"("customerId");
CREATE INDEX "idx_payments_status" ON "payments"("status");
CREATE INDEX "idx_messages_customer" ON "messages"("customerId");
CREATE INDEX "idx_messages_status" ON "messages"("status");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_services_active" ON "services"("isActive");
CREATE INDEX "idx_barbers_active" ON "barbers"("isActive");

-- Function to generate CUID-like IDs
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
DECLARE
    timestamp_part TEXT;
    random_part TEXT;
BEGIN
    timestamp_part := EXTRACT(EPOCH FROM NOW())::TEXT;
    random_part := SUBSTR(MD5(RANDOM()::TEXT), 1, 8);
    RETURN 'c' || timestamp_part || random_part;
END;
$$ LANGUAGE plpgsql;

-- Insert Business Settings
INSERT INTO "business_settings" (
    "id", "name", "phone", "email", "address", "workingDays", 
    "startTime", "endTime", "slotDuration", "advanceBookingDays", 
    "currency", "currencySymbol", "createdAt", "updatedAt"
) VALUES (
    'main-settings',
    'Marconi''s Barber Shop',
    '0599363145',
    'info@marconis.com',
    '123 Barber St, Accra, Ghana',
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    '09:00',
    '17:00',
    60,
    30,
    'GHS',
    '₵',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Admin User (password: admin123)
INSERT INTO "admin_users" (
    "id", "username", "password", "name", "role", 
    "isActive", "createdAt", "updatedAt"
) VALUES (
    generate_cuid(),
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqyqdG.B22NhsX6VnOj8Z9m',
    'Super Admin',
    'SUPER_ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Sample Barbers
INSERT INTO "barbers" (
    "id", "name", "speciality", "isActive", "workingDays", 
    "startTime", "endTime", "createdAt", "updatedAt"
) VALUES 
(
    generate_cuid(),
    'Marconi',
    'Classic cuts and beard styling',
    true,
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    '09:00',
    '17:00',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    generate_cuid(),
    'Junior',
    'Modern styles and fades',
    true,
    ARRAY['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    '10:00',
    '18:00',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Services
INSERT INTO "services" (
    "id", "name", "description", "price", "duration", 
    "isActive", "createdAt", "updatedAt"
) VALUES 
(
    generate_cuid(),
    'Classic Haircut',
    'Traditional haircut with styling',
    2500,
    45,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    generate_cuid(),
    'Beard Trim',
    'Professional beard trimming and shaping',
    1500,
    30,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    generate_cuid(),
    'Hot Towel Shave',
    'Traditional straight razor shave with hot towels',
    4000,
    60,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    generate_cuid(),
    'Hair Wash & Style',
    'Professional hair wash and styling',
    2000,
    30,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Grant all privileges to app user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO barber_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO barber_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO barber_app;

-- Update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON "barbers"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON "services"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON "bookings"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON "payments"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON "business_settings"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON "admin_users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Final verification query
SELECT 
    'Database setup completed successfully!' as message,
    COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Show created tables
SELECT table_name as "Created Tables" 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;