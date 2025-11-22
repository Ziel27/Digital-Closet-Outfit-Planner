import mongoose from 'mongoose';

const outfitSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clothing',
    required: true
  }],
  image: {
    type: String
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
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  wornDate: {
    type: Date
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

outfitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Database indexes for better query performance
outfitSchema.index({ userId: 1, createdAt: -1 });
outfitSchema.index({ userId: 1, isFavorite: 1 });
outfitSchema.index({ userId: 1, occasion: 1 });
outfitSchema.index({ userId: 1, season: 1 });
outfitSchema.index({ userId: 1, name: 'text', description: 'text', tags: 'text' }); // Text search index

export default mongoose.model('Outfit', outfitSchema);

