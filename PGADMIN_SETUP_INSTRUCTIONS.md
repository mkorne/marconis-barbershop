# PgAdmin 4 Setup Instructions for Marconi's Barbershop Database

## Prerequisites
- PostgreSQL installed on your system
- pgAdmin 4 installed and running
- Administrative access to PostgreSQL

## Step-by-Step Setup

### 1. Open pgAdmin 4
- Launch pgAdmin 4 from your applications
- If prompted, enter your master password

### 2. Connect to PostgreSQL Server
- In the Browser panel, expand "Servers"
- If you don't see a PostgreSQL server:
  1. Right-click "Servers" → Create → Server...
  2. **General Tab:**
     - Name: `Local PostgreSQL` (or any name you prefer)
  3. **Connection Tab:**
     - Host name/address: `localhost`
     - Port: `5432`
     - Maintenance database: `postgres`
     - Username: `postgres` (or your admin username)
     - Password: [your PostgreSQL admin password]
     - ✅ Check "Save password?"
  4. Click "Save"

### 3. Open Query Tool
- Right-click on your PostgreSQL server → "Query Tool"
- This opens a new Query Tool tab

### 4. Load the Database Setup Script
- In the Query Tool, click the "Open File" button (folder icon) or press `Ctrl+O`
- Navigate to your project folder and select `marconis_barbershop_database_setup.sql`
- The entire script will load in the Query Tool

### 5. Execute the Setup Script
- Click the "Execute/Refresh" button (play icon) or press `F5`
- Wait for the script to complete (may take 30-60 seconds)

### 6. Verify Success
You should see output similar to:
```
Query returned successfully in XXX msec.
Database setup completed successfully! | 7
```

And a list of created tables:
- admin_users
- barbers
- bookings
- business_settings
- messages
- payments
- services
- users

### 7. Refresh Browser to See New Database
- In the Browser panel, right-click "Databases" → "Refresh"
- You should now see "marconis_barbershop" in the databases list
- Expand it to see:
  - Schemas → public → Tables (showing all 7 tables)

## Verification Steps

### Check Tables Were Created
1. Expand: Databases → marconis_barbershop → Schemas → public → Tables
2. You should see 7 tables created

### Check Seed Data
1. Right-click on any table (e.g., "services") → "View/Edit Data" → "All Rows"
2. Verify sample data exists:
   - **services**: 4 services (Classic Haircut, Beard Trim, etc.)
   - **barbers**: 2 barbers (Marconi, Junior)
   - **admin_users**: 1 admin user
   - **business_settings**: 1 settings record

### Test Admin Login
The setup creates an admin user with:
- **Username:** `admin`
- **Password:** `admin123`

## Database Connection Details

After setup, your database connection details are:
- **Database:** `marconis_barbershop`
- **User:** `barber_app`
- **Password:** `BarbeR2024#SecurE`
- **Host:** `localhost`
- **Port:** `5432`

## Troubleshooting

### If you get "database already exists" error:
1. The script will drop and recreate the database automatically
2. If you have active connections to the database, close them first

### If you get permission errors:
1. Make sure you're running the script as the `postgres` superuser
2. Check that PostgreSQL service is running

### If foreign key errors occur:
1. The script creates tables in the correct order
2. Make sure the entire script ran without interruption

### If the script fails partway through:
1. You can run it again - it's designed to be idempotent
2. Or manually drop the database and run again:
   ```sql
   DROP DATABASE IF EXISTS marconis_barbershop;
   ```

## Next Steps

After successful setup:
1. Update your `.env` file with the connection string
2. Test the connection from your Node.js app
3. Run Prisma migrations if needed
4. Start your application

## Security Notes

⚠️ **Important:** The default passwords in this setup are for development only:
- Admin password: `admin123`
- Database user password: `BarbeR2024#SecurE`

For production:
1. Change all default passwords
2. Use environment variables for sensitive data
3. Restrict database user permissions as needed
4. Enable SSL connections
5. Configure proper firewall rules
