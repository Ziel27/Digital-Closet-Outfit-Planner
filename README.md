# Digital Closet - Outfit Planner

A full-stack MERN application for organizing your wardrobe and planning outfits with OAuth authentication.

## Features

- **Beautiful Landing Page** - Attractive homepage designed to convert visitors
- **Secure OAuth Authentication** - Google OAuth 2.0 integration
- **Closet Management** - Add, edit, and organize clothing items with image uploads
- **Cloudinary Image Storage** - Secure cloud storage for all your clothing photos
- **Outfit Planning** - Create and save outfit combinations
- **Calendar Integration** - Schedule outfits on specific dates
- **Weather API Integration** - Get weather-based style suggestions
- **Smart Style Suggestions** - Intelligent recommendations based on weather, occasion, and your wardrobe
- **Favorites** - Mark favorite items and outfits
- **Search & Filter** - Find items by category, color, tags, and more
- **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- **SEO Optimized** - Meta tags, structured data, and sitemap for better search visibility

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- shadcn/ui components
- React Icons
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Passport.js (Google OAuth)
- JWT Authentication
- Helmet (Security)
- Express Rate Limiting

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google OAuth credentials
- OpenWeatherMap API key (for weather features)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Digital-Closet-Outfit-Planner
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digital-closet
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-session-secret-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
WEATHER_API_KEY=your-openweathermap-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

### 5. OpenWeatherMap API Setup

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API keys section
4. Copy your API key to `WEATHER_API_KEY` in your `.env` file
5. Free tier includes 60 calls/minute and 1,000,000 calls/month

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
Digital-Closet-Outfit-Planner/
├── backend/
│   ├── config/
│   │   └── passport.js          # OAuth configuration
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Clothing.js          # Clothing item model
│   │   └── Outfit.js            # Outfit model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User routes
│   │   ├── clothing.js          # Clothing routes
│   │   └── outfits.js           # Outfit routes
│   ├── server.js                # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Closet.jsx
│   │   │   ├── Outfits.jsx
│   │   │   └── AuthCallback.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)

### Clothing
- `GET /api/clothing` - Get all clothing items (Protected)
- `GET /api/clothing/:id` - Get single clothing item (Protected)
- `POST /api/clothing` - Create clothing item (Protected)
- `PUT /api/clothing/:id` - Update clothing item (Protected)
- `DELETE /api/clothing/:id` - Delete clothing item (Protected)

### Outfits
- `GET /api/outfits` - Get all outfits (Protected)
- `GET /api/outfits/:id` - Get single outfit (Protected)
- `POST /api/outfits` - Create outfit (Protected)
- `PUT /api/outfits/:id` - Update outfit (Protected)
- `DELETE /api/outfits/:id` - Delete outfit (Protected)

### Calendar
- `GET /api/calendar` - Get calendar events (with optional date range) (Protected)
- `GET /api/calendar/date/:date` - Get event for specific date (Protected)
- `GET /api/calendar/:id` - Get single calendar event (Protected)
- `POST /api/calendar` - Schedule outfit on calendar (Protected)
- `PUT /api/calendar/:id` - Update calendar event (Protected)
- `DELETE /api/calendar/:id` - Delete calendar event (Protected)
- `POST /api/calendar/suggestions` - Get weather-based style suggestions (Protected)

### System
- `GET /api/health` - Health check endpoint with database status, memory usage, and uptime (Public)
- `GET /api/test` - Test endpoint for debugging and testing (Public)
- `POST /api/test` - Test POST endpoint for testing POST requests (Public)
- `GET /api/csrf-token` - Get CSRF token for frontend (Public)

## Security Features

- ✅ JWT-based authentication
- ✅ OAuth 2.0 with Google
- ✅ Helmet.js for security headers
- ✅ Rate limiting on API routes
- ✅ Input validation with express-validator
- ✅ Secure session management
- ✅ CORS configuration
- ✅ Environment variable protection

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

The build output will be in the `dist` directory.

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

