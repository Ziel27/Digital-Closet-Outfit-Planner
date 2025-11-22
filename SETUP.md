# Setup Instructions

## Security Note

⚠️ **IMPORTANT**: This application requires certain environment variables to be set. The application will **not start** without the required variables:

- `JWT_SECRET` - Required for authentication tokens
- `SESSION_SECRET` - Required for session encryption
- `MONGODB_URI` - Required for database connection

See `backend/.env.example` for all required variables. Generate strong secrets using:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Quick Start Guide

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

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

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. MongoDB Setup

**Option A: Local MongoDB**

- Install MongoDB locally
- Start MongoDB service
- Update `MONGODB_URI` in `.env` if needed

**Option B: MongoDB Atlas (Cloud)**

- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update `MONGODB_URI` in `.env`

### 4. Google OAuth Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

### 5. OpenWeatherMap API Setup

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API keys section
4. Copy your API key to `WEATHER_API_KEY` in `.env`
5. Free tier: 60 calls/minute, 1,000,000 calls/month

### 6. Cloudinary Setup (for Image Storage)

1. Visit [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Go to Dashboard → Settings
4. Copy your Cloud Name, API Key, and API Secret
5. Add them to your `.env` file:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
6. Free tier includes: 25GB storage, 25GB bandwidth/month

### 5. Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify MongoDB port (default: 27017)

### OAuth Not Working

- Verify Google OAuth credentials
- Check redirect URI matches exactly
- Ensure Google+ API is enabled

### CORS Errors

- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check backend CORS configuration in `server.js`

### Port Already in Use

- Change `PORT` in backend `.env`
- Update `FRONTEND_URL` if backend port changes
- Update Vite proxy in `frontend/vite.config.js` if needed

### Weather API Not Working

- Verify `WEATHER_API_KEY` is set in `.env`
- Check API key is valid at OpenWeatherMap
- Ensure you haven't exceeded rate limits (60 calls/minute)
- Location must be a valid city name (e.g., "New York", "London")
