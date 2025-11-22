import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  avatar: {
    type: String
  },
  provider: {
    type: String,
    enum: ['google', 'local'],
    default: 'google'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  preferences: {
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    notificationTime: {
      type: String,
      default: '09:00' // Default 9 AM
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },
  readNotifications: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', userSchema);

