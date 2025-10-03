# Database Configuration Guide
## Connecting Your Node.js App to PostgreSQL Database

### 📋 Quick Summary
After running the database setup script, you now have:
- **Database Name:** `marconis_barbershop`
- **Database User:** `barber_app`
- **Password:** `BarbeR2024#SecurE`
- **Connection String:** `postgresql://barber_app:BarbeR2024#SecurE@localhost:5432/marconis_barbershop?schema=public`

### 1. Update Your Environment File

Copy the database connection to your `.env` file:

```bash
# Navigate to backend directory
cd backend

# Copy the production env template to your main .env file
cp .env.production .env
```

Or manually update your `backend/.env` file with this line:
```env
DATABASE_URL="postgresql://barber_app:BarbeR2024#SecurE@localhost:5432/marconis_barbershop?schema=public"
```

### 2. Test Database Connection

Test the connection using Prisma:

```bash
# Navigate to backend directory
cd backend

# Install dependencies if not already done
npm install

# Generate Prisma client
npx prisma generate

# Test connection and view database
npx prisma studio
```

This should open Prisma Studio at `http://localhost:5555` where you can view your database tables and data.

### 3. Run Database Migrations (if needed)

Since we created the database with raw SQL, you might want to sync Prisma:

```bash
# Check migration status
npx prisma migrate status

# If needed, create a new migration from current database state
npx prisma db pull
npx prisma generate
```

### 4. Verify Seed Data

Check that your seed data was created:

```bash
# Run seed script to ensure data exists
npm run seed
```

This should output:
```
✅ Created admin user: admin
✅ Created barbers: Marconi, Junior
✅ Created service: Classic Haircut
✅ Created service: Beard Trim
✅ Created service: Hot Towel Shave
✅ Created service: Hair Wash & Style
✅ Created business settings: Marconi's Barber Shop
```

### 5. Start Your Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 6. Test API Endpoints

Your app should now be running with the database connected. Test some endpoints:

```bash
# Check if server is running
curl http://localhost:3000/health

# Get services (should return 4 services)
curl http://localhost:3000/api/services

# Get barbers (should return 2 barbers)
curl http://localhost:3000/api/barbers

# Get business settings
curl http://localhost:3000/api/business-settings
```

### 7. Admin Dashboard Access

You can now log into the admin dashboard with:
- **URL:** `http://localhost:3000/admin` (or wherever your frontend is hosted)
- **Username:** `admin`
- **Password:** `admin123`

## Database Schema Overview

Your database now contains these tables:

### Core Tables
- **users** - Customer accounts and admin users
- **barbers** - Barber profiles and schedules
- **services** - Available services with pricing
- **bookings** - Customer appointments
- **payments** - Payment records and status
- **messages** - Customer support messages
- **business_settings** - Shop configuration
- **admin_users** - Administrative users

### Sample Data Included
- **2 Barbers:** Marconi, Junior
- **4 Services:** Classic Haircut (₵25), Beard Trim (₵15), Hot Towel Shave (₵40), Hair Wash & Style (₵20)
- **1 Admin User:** username: admin, password: admin123
- **Business Settings:** Shop details and working hours

## Connection Troubleshooting

### Connection Refused Error
If you get `ECONNREFUSED` error:
1. Check if PostgreSQL is running: `sudo systemctl status postgresql`
2. Start PostgreSQL: `sudo systemctl start postgresql`
3. Check if it's listening on port 5432: `sudo netstat -nlp | grep 5432`

### Authentication Failed
If you get authentication errors:
1. Verify the password: `BarbeR2024#SecurE`
2. Test connection manually: 
   ```bash
   psql -U barber_app -d marconis_barbershop -h localhost
   ```

### Permission Denied
If you get permission errors:
1. Make sure the user has the right privileges
2. Re-run the setup script to fix permissions

### Database Not Found
If the database doesn't exist:
1. Re-run the complete setup script in pgAdmin 4
2. Make sure no errors occurred during creation

## Security Recommendations

### For Development
The current setup is good for local development.

### For Production
⚠️ **Important changes needed:**

1. **Change Default Passwords:**
   ```sql
   -- Connect as postgres user
   ALTER USER barber_app WITH PASSWORD 'your-new-secure-password';
   
   -- Update admin password in your app
   UPDATE admin_users SET password = 'new-bcrypt-hash' WHERE username = 'admin';
   ```

2. **Update Environment Variables:**
   ```env
   DATABASE_URL="postgresql://barber_app:your-new-password@localhost:5432/marconis_barbershop?schema=public"
   JWT_SECRET=a-very-long-random-string-for-production
   ```

3. **Network Security:**
   - Configure PostgreSQL to only accept connections from your app server
   - Use SSL connections: add `?sslmode=require` to connection string
   - Set up firewall rules

4. **Database Security:**
   - Enable row-level security if needed
   - Regular backups
   - Monitor database logs

## Backup and Restore

### Create Backup
```bash
pg_dump -U barber_app -h localhost marconis_barbershop > backup.sql
```

### Restore Backup
```bash
psql -U barber_app -h localhost -d marconis_barbershop < backup.sql
```

## Performance Tips

### Indexing
The setup script includes performance indexes on frequently queried fields:
- Booking dates and customer IDs
- Payment status
- Message status
- User roles

### Connection Pooling
For production, consider using connection pooling:
```env
DATABASE_URL="postgresql://barber_app:password@localhost:5432/marconis_barbershop?schema=public&connection_limit=20&pool_timeout=20"
```

---

🎉 **Congratulations!** Your PostgreSQL database for Marconi's Barbershop is now set up and ready to use!
