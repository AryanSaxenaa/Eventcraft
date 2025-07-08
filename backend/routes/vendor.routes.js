const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const { checkJwt, checkUser } = require('../middleware/auth');

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new vendor (Admin only)
router.post('/', checkJwt, checkUser, async (req, res) => {
  try {
    // Check if user is admin
    if (req.dbUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { name, category, contact, description, phone, website, address, services } = req.body;

    const vendor = new Vendor({
      name,
      category,
      contact,
      description,
      phone,
      website,
      address,
      services,
      createdBy: req.dbUser.id
    });

    const savedVendor = await vendor.save();
    res.status(201).json(savedVendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vendor (Admin only)
router.put('/:id', checkJwt, checkUser, async (req, res) => {
  try {
    // Check if user is admin
    if (req.dbUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete vendor (Admin only)
router.delete('/:id', checkJwt, checkUser, async (req, res) => {
  try {
    // Check if user is admin
    if (req.dbUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor statistics (Admin only)
router.get('/stats/overview', checkJwt, checkUser, async (req, res) => {
  try {
    // Check if user is admin
    if (req.dbUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalVendors = await Vendor.countDocuments({ isActive: true });
    const activeVendors = await Vendor.countDocuments({ isActive: true });
    const categories = await Vendor.distinct('category');

    res.json({
      totalVendors,
      activeVendors,
      categories: categories.length
    });
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 