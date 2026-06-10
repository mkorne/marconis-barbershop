# Marconi's Barbershop - Frontend

This is the frontend application for Marconi's Barber Shop Booking System. It's built with vanilla HTML, CSS, and JavaScript with modern development tooling.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
cd frontend
npm install
```

### Development Scripts

#### Start Development Server
```bash
npm start
# or
npm run dev
```
This starts the live-server on http://localhost:3000 with automatic reload when files change.

#### Serve Production Build
```bash
npm run serve
```
Serves the application using http-server.

#### Code Quality
```bash
npm run lint    # Check JavaScript for issues
npm run format  # Format code with Prettier
```

## 📁 Project Structure

```
frontend/
├── package.json          # Dependencies and scripts
├── public/              # Static files (served directly)
│   ├── index.html      # Main application entry point
│   └── assets/         # Images, fonts, etc.
└── src/                # Source code
    └── js/            # JavaScript files
        └── admin.js   # Admin functionality
```

## 🛠️ Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Styling (via Tailwind CDN)
- **Vanilla JavaScript** - Application logic
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io** - Real-time communication
- **Font Awesome** - Icons

## 🔧 Development Tools

- **live-server** - Development server with live reload
- **http-server** - Production-ready static server
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting

## 🌐 API Integration

The frontend connects to the backend API running on port 5000:
- Backend API: http://localhost:5000
- WebSocket connection for real-time features

## 📱 Features

- **Responsive Design** - Mobile-first approach
- **Real-time Booking** - Live updates via WebSocket
- **Interactive Chat** - Customer support chat
- **Admin Dashboard** - Management interface
- **Service Management** - Dynamic service listings
- **Appointment Scheduling** - Time slot booking

## 🎨 Styling

The application uses Tailwind CSS loaded via CDN for rapid styling. Custom styles are defined inline in the HTML files.

## 🔄 Development Workflow

1. Start the backend server first (see backend README)
2. Start the frontend development server: `npm start`
3. Make changes to files in `src/` or `public/`
4. Browser auto-refreshes with changes
5. Use browser dev tools for debugging

## 🚀 Deployment

For production deployment:
1. Build the application: `npm run build`
2. Serve the `public/` directory with any static file server
3. Ensure backend API is accessible at the correct URL

## 📝 Notes

- This is a vanilla JavaScript application (no React/Vue/Angular)
- Dependencies are loaded via CDN for simplicity
- The development server provides live reload functionality
- All source files should be placed in appropriate directories for organization
