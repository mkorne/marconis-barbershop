# 💈 Marconi's Barber Shop - Booking System

A complete full-stack barber shop booking and management system built with modern web technologies. This system provides online appointment booking, real-time chat support, admin management, and comprehensive business operations.

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-2.0-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

## 🚀 Live Demo

- **Frontend**: Coming Soon
- **Admin Panel**: Coming Soon

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **SMS**: Twilio
- **Security**: Helmet, CORS, Rate limiting

### Frontend
- **Languages**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Font Awesome
- **Dev Server**: live-server
- **Code Quality**: ESLint, Prettier

## 🚀 Features

### Customer Features
- Online appointment booking
- Service catalog with pricing
- Real-time chat with staff
- AI-powered haircut assistant
- Mobile Money payment integration
- Booking confirmations via SMS

### Admin Features
- Dashboard with analytics
- Booking management
- Payment tracking
- Customer message management
- Staff scheduling
- Revenue reports

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/mkorne/marconis-barbershop.git
   cd marconis-barbershop
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   cd ..
   ```

3. **Database setup**
   ```bash
   # Start PostgreSQL service
   sudo systemctl start postgresql
   
   # Create database
   createdb marconis_barbershop
   ```

4. **Environment configuration**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   
   # Edit with your configuration
   nano backend/.env
   ```

5. **Database migration**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   npm run seed
   ```

6. **Start development servers**
   ```bash
   # Option 1: Start both servers with one command
   ./start-dev.sh
   
   # Option 2: Start individually
   # Terminal 1 - Backend (port 5000)
   cd backend && PORT=5000 npm run dev
   
   # Terminal 2 - Frontend (port 3000)
   cd frontend && npm start
   ```

## 📁 Project Structure
```
marconis-barbershop/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   ├── services/     # Business logic
│   │   └── config/       # Configuration files
│   └── tests/            # Backend tests
├── frontend/             # Client-side application
│   ├── public/           # Static assets
│   └── src/              # Source files
├── database/             # Database setup
│   ├── migrations/       # Schema migrations
│   └── seeds/            # Sample data
├── deploy/               # Deployment configurations
└── docs/                 # Documentation
```

## 🔧 Environment Variables

Create `.env` files in both backend and frontend directories:

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/marconis_db
JWT_SECRET=your-jwt-secret
PAYSTACK_SECRET_KEY=your-paystack-secret
PAYSTACK_PUBLIC_KEY=your-paystack-public
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

## 📈 Deployment

1. **Database**: PostgreSQL on DigitalOcean Managed Databases
2. **Backend**: Node.js app on DigitalOcean Droplet
3. **Frontend**: Static files served by Nginx
4. **Domain**: Custom domain with Let's Encrypt SSL
5. **Monitoring**: PM2 for process management

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## 📖 Usage

### Development Workflow

1. **Start development environment**
   ```bash
   ./start-dev.sh
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/#admin

3. **Default admin credentials**
   - Username: `admin`
   - Password: `marconi123`

### Available Scripts

#### Frontend
```bash
cd frontend
npm start      # Start development server
npm run serve  # Serve production build
npm run lint   # Check JavaScript
npm run format # Format code
```

#### Backend
```bash
cd backend
npm run dev    # Start development server
npm start      # Start production server
npm test       # Run tests
npm run seed   # Seed database
```

## 👨‍💻 Author

**Marconi's Barber Shop Development Team**

- GitHub: [@mkorne](https://github.com/mkorne)
- Email: info@marconis.com
- Phone: 0599363145

## 📞 Support

For support, email info@marconis.com or create an issue in this repository.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

---

⭐ **Star this repository if you found it helpful!** ⭐

Built with ❤️ for Marconi's Barber Shop
