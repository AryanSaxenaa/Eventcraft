const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
require('dotenv').config();

const vendors = [
  {
    name: 'Delight Catering Co.',
    category: 'Catering',
    contact: 'delight@vendor.com',
    description: 'Professional catering services for all types of events. We specialize in corporate events, weddings, and private parties.',
    phone: '+1-555-123-4567',
    website: 'https://delightcatering.com',
    address: '123 Main Street, Downtown, NY 10001',
    services: ['Wedding Catering', 'Corporate Events', 'Private Parties', 'Food Trucks'],
    rating: 4.8,
    isActive: true
  },
  {
    name: 'SoundBlast Audio',
    category: 'Audio/Visual',
    contact: 'soundblast@vendor.com',
    description: 'Professional audio and visual equipment rental and setup services. Perfect for concerts, conferences, and events.',
    phone: '+1-555-987-6543',
    website: 'https://soundblastaudio.com',
    address: '456 Tech Avenue, Innovation District, CA 90210',
    services: ['Audio Equipment', 'Lighting Systems', 'Stage Setup', 'Live Streaming'],
    rating: 4.5,
    isActive: true
  },
  {
    name: 'Capture Moments Photography',
    category: 'Photography',
    contact: 'capture@vendor.com',
    description: 'Professional photography services for events, weddings, and corporate functions. High-quality images and videos.',
    phone: '+1-555-456-7890',
    website: 'https://capturemoments.com',
    address: '789 Creative Lane, Arts District, TX 75001',
    services: ['Event Photography', 'Wedding Photography', 'Corporate Photography', 'Video Production'],
    rating: 4.9,
    isActive: true
  },
  {
    name: 'Grand Venue Events',
    category: 'Venue',
    contact: 'grandvenue@vendor.com',
    description: 'Elegant event spaces for weddings, corporate events, and special occasions. Multiple locations available.',
    phone: '+1-555-321-6547',
    website: 'https://grandvenueevents.com',
    address: '321 Elegance Boulevard, Luxury District, FL 33101',
    services: ['Wedding Venues', 'Corporate Spaces', 'Outdoor Events', 'Catering Coordination'],
    rating: 4.7,
    isActive: true
  },
  {
    name: 'Elite Transportation',
    category: 'Transportation',
    contact: 'elite@vendor.com',
    description: 'Premium transportation services for events and special occasions. Luxury vehicles and professional drivers.',
    phone: '+1-555-789-0123',
    website: 'https://elitetransportation.com',
    address: '654 Fleet Street, Business District, IL 60601',
    services: ['Luxury Cars', 'Shuttle Services', 'Airport Transfers', 'Wedding Transportation'],
    rating: 4.6,
    isActive: true
  },
  {
    name: 'Stellar Entertainment',
    category: 'Entertainment',
    contact: 'stellar@vendor.com',
    description: 'Professional entertainment services including live bands, DJs, and performers for all types of events.',
    phone: '+1-555-147-2589',
    website: 'https://stellarentertainment.com',
    address: '147 Music Row, Entertainment District, TN 37201',
    services: ['Live Bands', 'DJ Services', 'Performers', 'Sound Systems'],
    rating: 4.4,
    isActive: true
  },
  {
    name: 'Bloom & Blossom Decor',
    category: 'Decoration',
    contact: 'bloom@vendor.com',
    description: 'Beautiful floral arrangements and event decorations. Creating stunning atmospheres for special occasions.',
    phone: '+1-555-963-8520',
    website: 'https://bloomblossom.com',
    address: '963 Garden Street, Nature District, OR 97201',
    services: ['Floral Arrangements', 'Event Decorations', 'Wedding Flowers', 'Centerpieces'],
    rating: 4.8,
    isActive: true
  },
  {
    name: 'SecureGuard Security',
    category: 'Security',
    contact: 'secureguard@vendor.com',
    description: 'Professional security services for events of all sizes. Licensed and trained security personnel.',
    phone: '+1-555-369-2580',
    website: 'https://secureguard.com',
    address: '369 Safety Lane, Security District, WA 98101',
    services: ['Event Security', 'Crowd Control', 'VIP Protection', 'Access Control'],
    rating: 4.3,
    isActive: true
  },
  {
    name: 'TechConnect Solutions',
    category: 'Technology',
    contact: 'techconnect@vendor.com',
    description: 'Technology solutions for events including registration systems, live streaming, and interactive displays.',
    phone: '+1-555-852-9630',
    website: 'https://techconnectsolutions.com',
    address: '852 Innovation Drive, Tech District, MA 02101',
    services: ['Event Registration', 'Live Streaming', 'Interactive Displays', 'Virtual Events'],
    rating: 4.7,
    isActive: true
  },
  {
    name: 'Green Earth Catering',
    category: 'Catering',
    contact: 'greenearth@vendor.com',
    description: 'Sustainable and organic catering services. Farm-to-table ingredients and eco-friendly practices.',
    phone: '+1-555-741-8520',
    website: 'https://greenearthcatering.com',
    address: '741 Organic Way, Green District, CO 80201',
    services: ['Organic Catering', 'Vegetarian Options', 'Gluten-Free', 'Sustainable Practices'],
    rating: 4.6,
    isActive: true
  }
];

const seedVendors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventcraft');
    console.log('Connected to MongoDB');

    // Clear existing vendors
    await Vendor.deleteMany({});
    console.log('Cleared existing vendors');

    // Insert new vendors
    const createdVendors = await Vendor.insertMany(vendors);
    console.log(`Successfully seeded ${createdVendors.length} vendors`);

    // Display created vendors
    createdVendors.forEach(vendor => {
      console.log(`- ${vendor.name} (${vendor.category})`);
    });

    console.log('Vendor seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding vendors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedVendors();
}

module.exports = seedVendors; 