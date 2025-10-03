-- ========================================
-- PART 1: DATABASE AND USER CREATION
-- Run this separately first
-- ========================================

-- Create Database User (Role)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'barber_app') THEN
        CREATE USER barber_app WITH PASSWORD 'BarbeR2024#SecurE';
    END IF;
END
$$;

-- Grant connection privileges
ALTER USER barber_app CREATEDB;

-- Drop and create database (run outside transaction)
-- Note: You might need to disconnect from other databases first
DROP DATABASE IF EXISTS marconis_barbershop;
CREATE DATABASE marconis_barbershop
    WITH OWNER = barber_app
         ENCODING = 'UTF8'
         TABLESPACE = pg_default
         CONNECTION LIMIT = 100;
