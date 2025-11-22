import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Testimonial from '../models/Testimonial.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const seedTestimonials = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-closet');
    console.log('Connected to MongoDB');

    // Get a real user or create a test user for testimonials
    let user = await User.findOne();
    
    if (!user) {
      console.log('No users found. Please create users first.');
      process.exit(0);
    }

    // Check if testimonials already exist
    const existingTestimonials = await Testimonial.countDocuments();
    if (existingTestimonials > 0) {
      console.log('Testimonials already exist. Skipping seed.');
      process.exit(0);
    }

    // Sample testimonials
    const sampleTestimonials = [
      {
        userId: user._id,
        name: 'Sarah M.',
        role: 'Fashion Blogger',
        rating: 5,
        comment: 'This app has completely changed how I plan my outfits. The weather suggestions are spot-on and save me so much time every morning!',
        isApproved: true
      },
      {
        userId: user._id,
        name: 'Michael T.',
        role: 'Professional',
        rating: 5,
        comment: 'I love being able to see all my clothes in one place. The calendar feature is a game-changer for planning my weekly outfits!',
        isApproved: true
      },
      {
        userId: user._id,
        name: 'Emma L.',
        role: 'Student',
        rating: 5,
        comment: 'Finally, an app that helps me make the most of my wardrobe. Highly recommend to anyone who wants to simplify their morning routine!',
        isApproved: true
      }
    ];

    // Insert testimonials
    await Testimonial.insertMany(sampleTestimonials);
    console.log('Testimonials seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding testimonials:', error);
    process.exit(1);
  }
};

seedTestimonials();

