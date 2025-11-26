// Load environment variables FIRST - before any other imports
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import path from "path";

// Get the directory where server.js is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the same directory as server.js
const result = dotenv.config({ path: join(__dirname, ".env") });

// Import logger and validateEnv AFTER dotenv loads
import logger from "./utils/logger.js";
import { validateEnv } from "./utils/validateEnv.js";

if (result.error) {
  logger.error("Error loading .env file:", result.error.message);
} else {
  logger.info("✓ .env file loaded successfully");
}

// Validate required environment variables
validateEnv();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import passport from "passport";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import clothingRoutes from "./routes/clothing.js";
import outfitRoutes from "./routes/outfits.js";
import calendarRoutes from "./routes/calendar.js";
import uploadRoutes from "./routes/upload.js";
import statsRoutes from "./routes/stats.js";
import testimonialsRoutes from "./routes/testimonials.js";
import exportRoutes from "./routes/export.js";
import analyticsRoutes from "./routes/analytics.js";
import notificationsRoutes from "./routes/notifications.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { requestId } from "./middleware/requestId.js";
import { generateCsrfToken, verifyCsrfToken } from "./middleware/csrf.js";

// Wrap in async function to use top-level await
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Trust proxy - Required when behind Nginx reverse proxy
  // This allows Express to correctly handle X-Forwarded-* headers
  // and set secure cookies properly
  app.set('trust proxy', 1);

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com"],
          connectSrc: ["'self'", "https://api.openweathermap.org"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // Additional security headers
      xContentTypeOptions: true, // Prevent MIME type sniffing
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
      },
      // Disable Cross-Origin-Opener-Policy for HTTP (only works with HTTPS)
      // This prevents the browser warning when using HTTP
      // Enable when you move to HTTPS: crossOriginOpenerPolicy: { policy: "same-origin" }
      crossOriginOpenerPolicy: { policy: "same-origin" },
    })
  );

  // HTTPS redirect in production (skip for API routes - nginx handles HTTPS)
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      // Skip redirect for API routes (nginx handles HTTPS termination)
      if (req.path.startsWith("/api") || req.path === "/") {
        return next();
      }
      // Only redirect non-API routes if not already HTTPS
      if (req.header("x-forwarded-proto") !== "https") {
        res.redirect(`https://${req.header("host")}${req.url}`);
      } else {
        next();
      }
    });
  }

  // CORS configuration
  const allowedOrigins = [
    "http://digital-closet-ap1.s3-website-ap-southeast-1.amazonaws.com",
    "https://digital-closet-ap1.s3-website-ap-southeast-1.amazonaws.com",
    "https://digitalcloset.giandazielpon.online", // Vercel frontend
    "https://digitalclosetserver.giandazielpon.online", // Backend domain
    "http://localhost:3000", // For local development
    process.env.FRONTEND_URL, // From environment variable if set
  ].filter(Boolean);

  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
        if (!origin) return callback(null, true);

        // Normalize origin (remove trailing slash if present)
        const normalizedOrigin = origin.endsWith("/")
          ? origin.slice(0, -1)
          : origin;

        if (
          allowedOrigins.includes(normalizedOrigin) ||
          allowedOrigins.includes(origin)
        ) {
          if (process.env.NODE_ENV === "development") {
            logger.debug(`CORS allowed origin: ${origin}`);
          }
          callback(null, true);
        } else {
          logger.warn(`CORS blocked origin: ${origin}`);
          logger.warn(`Normalized: ${normalizedOrigin}`);
          logger.warn(`Allowed origins: ${JSON.stringify(allowedOrigins)}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
      exposedHeaders: ["X-CSRF-Token"],
    })
  );

  // Request ID tracking (before logging)
  app.use(requestId);

  // Request logging middleware (before routes)
  app.use(requestLogger);

  // Rate limiting - more lenient in development
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 300 : 1000, // Increased limit: ~20 requests/min in production
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: false,
    // Skip rate limiting for health checks and public endpoints
    skip: (req) => {
      const publicPaths = [
        '/api/health',
        '/api/test',
        '/api/stats/public',
        '/api/testimonials/public',
        '/api/csrf-token',
      ];
      return publicPaths.some(path => req.path === path);
    },
  });
  app.use("/api/", limiter);

  // Cookie parser
  app.use(cookieParser());

  // Body parsing middleware (reduced limits for security)
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Session configuration (must be before CSRF)
  // SESSION_SECRET is validated by validateEnv() - will exit if missing
  // Use MongoDB store for production (avoids MemoryStore warning and memory leaks)
  const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl: 24 * 60 * 60, // 24 hours in seconds (matches cookie maxAge)
    touchAfter: 24 * 3600, // Lazy session update - only update once per day
    autoRemove: "native", // Use MongoDB TTL index for automatic cleanup
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true, // Set to true to ensure sessions are created for CSRF tokens
      store: sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        // Use "none" for cross-origin in production (frontend and backend on different domains)
        // "strict" in development for same-origin security
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      },
    })
  );

  // CSRF token generation (after session middleware)
  app.use(generateCsrfToken);

  // CSRF token verification (after token generation)
  app.use(verifyCsrfToken);

  // Import passport config AFTER dotenv has loaded (using dynamic import)
  await import("./config/passport.js");

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // MongoDB connection
  // MONGODB_URI is validated by validateEnv() - will exit if missing
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    // Don't exit - allow server to start even if MongoDB fails
    // This allows health checks to work
  }

  // Root route
  app.get("/", (req, res) => {
    res.json({
      message: "Digital Closet API",
      version: "1.0.0",
      status: "running",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "/api/health",
        test: "/api/test",
        auth: "/api/auth",
        users: "/api/users",
        clothing: "/api/clothing",
        outfits: "/api/outfits",
        calendar: "/api/calendar",
        stats: "/api/stats",
        testimonials: "/api/testimonials",
      },
      documentation: "API documentation available at /api/health",
    });
  });

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/clothing", clothingRoutes);
  app.use("/api/outfits", outfitRoutes);
  app.use("/api/calendar", calendarRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/testimonials", testimonialsRoutes);
  app.use("/api/export", exportRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/notifications", notificationsRoutes);

  // CSRF token endpoint (public, no CSRF check needed)
  app.get("/api/csrf-token", (req, res) => {
    // Ensure session is created and explicitly save it
    if (req.session) {
      // Touch the session to mark it as modified
      req.session.touched = true;
      
      // Explicitly save the session to ensure cookie is set
      req.session.save((err) => {
        if (err) {
          logger.error('Error saving session:', err);
          return res.json({ csrfToken: null });
        }
        // Token should already be generated by generateCsrfToken middleware
        res.json({ csrfToken: req.csrfToken || null });
      });
    } else {
      // No session available - this shouldn't happen with saveUninitialized: true
      logger.warn('No session available for CSRF token request');
      res.json({ csrfToken: null });
    }
  });

  // Enhanced Health check endpoint
  app.get("/api/health", async (req, res) => {
    const startTime = Date.now();
    const healthCheck = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      services: {
        database: {
          status: "unknown",
          responseTime: null,
        },
      },
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
        unit: "MB",
      },
      responseTime: null,
    };

    // Check MongoDB connection
    try {
      const dbStartTime = Date.now();
      if (mongoose.connection.readyState === 1) {
        // Connection is open
        await mongoose.connection.db.admin().ping();
        healthCheck.services.database.status = "connected";
        healthCheck.services.database.responseTime = Date.now() - dbStartTime;
      } else {
        healthCheck.services.database.status = "disconnected";
      }
    } catch (error) {
      healthCheck.services.database.status = "error";
      healthCheck.services.database.error = error.message;
    }

    // Calculate total response time
    healthCheck.responseTime = Date.now() - startTime;

    // Determine overall status
    const isHealthy =
      healthCheck.services.database.status === "connected" ||
      healthCheck.services.database.status === "unknown"; // Allow unknown in case MongoDB check fails

    res.status(isHealthy ? 200 : 503).json(healthCheck);
  });

  // Test endpoint for various testing purposes
  app.get("/api/test", (req, res) => {
    res.json({
      message: "Test endpoint is working",
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      query: req.query,
      headers: {
        "user-agent": req.get("user-agent"),
        "content-type": req.get("content-type"),
      },
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: {
          used:
            Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
            100,
          total:
            Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
            100,
          unit: "MB",
        },
      },
    });
  });

  // Test POST endpoint (for testing POST requests)
  app.post("/api/test", (req, res) => {
    res.json({
      message: "Test POST endpoint is working",
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      body: req.body,
      received: {
        contentType: req.get("content-type"),
        bodySize: JSON.stringify(req.body).length,
      },
    });
  });

  // Error handling middleware (must be after CORS to include headers)
  app.use((err, req, res, next) => {
    logger.error("Error:", err.stack);

    // Ensure CORS headers are set even on errors
    const origin = req.headers.origin;
    const allowedOrigins = [
      "http://digital-closet-ap1.s3-website-ap-southeast-1.amazonaws.com",
      "https://digital-closet-ap1.s3-website-ap-southeast-1.amazonaws.com",
      "https://digitalcloset.giandazielpon.online",
      "https://digitalclosetserver.giandazielpon.online",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    console.log(`✓ Server started successfully on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Start the server
startServer().catch((err) => {
  logger.error("Failed to start server:", err);
  console.error("Failed to start server:", err);
  process.exit(1);
});
