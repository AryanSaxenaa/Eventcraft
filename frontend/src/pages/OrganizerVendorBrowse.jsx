import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MapPinIcon,
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import vendorService from '../services/vendorService';
import { useNotification } from '../components/NotificationContext';

const OrganizerVendorBrowse = () => {
  const { error } = useNotification();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    filterAndSortVendors();
  }, [vendors, searchTerm, selectedCategory, sortBy]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getAllVendors();
      setVendors(data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVendors = () => {
    let filtered = vendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.services?.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort vendors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredVendors(filtered);
  };

  const categories = ['all', ...Array.from(new Set(vendors.map(v => v.category)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Vendors 🏢
          </h1>
          <p className="text-gray-600">
            Discover and connect with professional vendors for your events
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </p>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <motion.div
              key={vendor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gray-500">{vendor.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      {vendor.rating || 0}/5
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    <span>{vendor.contact}</span>
                  </div>
                  {vendor.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <GlobeAltIcon className="w-4 h-4 mr-2" />
                      <a 
                        href={vendor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 truncate"
                      >
                        {vendor.website}
                      </a>
                    </div>
                  )}
                  {vendor.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      <span className="truncate">{vendor.address}</span>
                    </div>
                  )}
                </div>

                {vendor.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {vendor.description}
                  </p>
                )}

                {vendor.services && vendor.services.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {vendor.services.slice(0, 4).map((service, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {vendor.services.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{vendor.services.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    vendor.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vendor.isActive ? 'Available' : 'Unavailable'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // This could open a contact modal or redirect to contact page
                      alert(`Contact ${vendor.name} at ${vendor.contact}`);
                    }}
                  >
                    Contact
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or category filter
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerVendorBrowse; 