-- ========================================
-- SCHEMA AND DATA SETUP (WITH EXISTENCE CHECKS)
-- ========================================

-- Drop existing objects if they exist (be careful with this in production!)
DROP TABLE IF EXISTS "admin_users" CASCADE;
DROP TABLE IF EXISTS "business_settings" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "bookings" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "barbers" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS "AdminRole" CASCADE;
DROP TYPE IF EXISTS "MessageStatus" CASCADE;
DROP TYPE IF EXISTS "MessageType" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "BookingStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- Create Enums
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'MOBILE_MONEY', 'CARD');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "MessageType" AS ENUM ('CUSTOMER_SUPPORT', 'BOOKING_INQUIRY', 'COMPLAINT', 'GENERAL');
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'REPLIED');
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF');

-- Continue with the rest of the complete script...
-- [Add all the table definitions, indexes, data insertion from the previous complete script]-- ========================================
-- SCHEMA AND DATA SETUP (WITH EXISTENCE CHECKS)
-- ========================================

-- Drop existing objects if they exist (be careful with this in production!)
DROP TABLE IF EXISTS "admin_users" CASCADE;
DROP TABLE IF EXISTS "business_settings" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "bookings" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "barbers" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS "AdminRole" CASCADE;
DROP TYPE IF EXISTS "MessageStatus" CASCADE;
DROP TYPE IF EXISTS "MessageType" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "BookingStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- Create Enums
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'MOBILE_MONEY', 'CARD');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "MessageType" AS ENUM ('CUSTOMER_SUPPORT', 'BOOKING_INQUIRY', 'COMPLAINT', 'GENERAL');
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'REPLIED');
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF');

-- Continue with the rest of the complete script...
-- [Add all the table definitions, indexes, data insertion from the previous complete script]
