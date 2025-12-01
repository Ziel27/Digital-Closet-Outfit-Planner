import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import logger from "../utils/logger.js";

// Small delay to ensure dotenv has loaded (ES modules hoist imports)
// Check if OAuth credentials are configured
const hasClientID = !!process.env.GOOGLE_CLIENT_ID;
const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;

// Only log in development
if (process.env.NODE_ENV === "development") {
  logger.debug("[Passport] Checking OAuth credentials...");
  logger.debug(`[Passport] GOOGLE_CLIENT_ID exists: ${hasClientID}`);
  logger.debug(`[Passport] GOOGLE_CLIENT_SECRET exists: ${hasClientSecret}`);
}

if (!hasClientID || !hasClientSecret) {
  logger.warn(
    "⚠️  Warning: Google OAuth credentials not found in environment variables."
  );
  logger.warn(`   GOOGLE_CLIENT_ID: ${hasClientID ? "✓ Found" : "✗ Missing"}`);
  logger.warn(
    `   GOOGLE_CLIENT_SECRET: ${hasClientSecret ? "✓ Found" : "✗ Missing"}`
  );
  logger.warn("   OAuth authentication will not work until both are set.");
  logger.warn("   Please check your .env file in the backend directory.");
} else {
  logger.info("✓ Google OAuth credentials loaded successfully");

  // Use absolute callback URL for Google OAuth - required by Google
  const callbackURL = "https://www.digitalclosetserver.giandazielpon.online/api/auth/google/callback";

  logger.info(`✓ OAuth callback URL (ABSOLUTE): ${callbackURL}`);

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
        proxy: true, // Important for HTTPS behind Render's proxy
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            provider: "google",
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
