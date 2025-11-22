import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  outfitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  occasion: {
    type: String,
    enum: ['casual', 'formal', 'sporty', 'party', 'work', 'other'],
    default: 'casual'
  },
  location: {
    type: String,
    trim: true
  },
  weather: {
    temperature: Number,
    condition: String,
    description: String
  },
  notes: {
    type: String,
    trim: true
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

calendarEventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

calendarEventSchema.index({ userId: 1, date: 1 });
calendarEventSchema.index({ userId: 1, date: -1 });

export default mongoose.model('CalendarEvent', calendarEventSchema);

