import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    trim: true,
    default: 'User'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

testimonialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

testimonialSchema.index({ isApproved: 1, createdAt: -1 });

export default mongoose.model('Testimonial', testimonialSchema);

