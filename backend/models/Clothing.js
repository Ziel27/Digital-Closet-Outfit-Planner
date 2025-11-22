import mongoose from 'mongoose';

const clothingSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories', 'other']
  },
  color: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  season: {
    type: [String],
    enum: ['spring', 'summer', 'fall', 'winter'],
    default: []
  },
  occasion: {
    type: [String],
    enum: ['casual', 'formal', 'sporty', 'party', 'work', 'other'],
    default: []
  },
  isFavorite: {
    type: Boolean,
    default: false
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

clothingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Database indexes for better query performance
clothingSchema.index({ userId: 1, category: 1 });
clothingSchema.index({ userId: 1, createdAt: -1 });
clothingSchema.index({ userId: 1, isFavorite: 1 });
clothingSchema.index({ userId: 1, name: 'text', brand: 'text', tags: 'text' }); // Text search index

export default mongoose.model('Clothing', clothingSchema);

