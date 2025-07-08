import React, { useEffect, useState } from 'react';
import vendorService from '../services/vendorService';

const badgeColors = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-red-100 text-red-800',
];

const AdminVendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    category: '',
    contact: '',
    phone: '',
  });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: '',
    name: '',
    category: '',
    contact: '',
    phone: '',
  });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await vendorService.getAllVendors();
      setVendors(data);
    } catch (err) {
      setError('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAddVendor = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      if (!addForm.name || !addForm.category || !addForm.contact || !addForm.phone) {
        setAddError('All fields are required');
        setAddLoading(false);
        return;
      }
      await vendorService.createVendor(addForm);
      setShowAddModal(false);
      setAddForm({ name: '', category: '', contact: '', phone: '' });
      fetchVendors();
    } catch (err) {
      setAddError('Failed to add vendor');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditVendor = (vendor) => {
    setEditForm({
      _id: vendor._id,
      name: vendor.name,
      category: vendor.category,
      contact: vendor.contact,
      phone: vendor.phone,
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      if (!editForm.name || !editForm.category || !editForm.contact || !editForm.phone) {
        setEditError('All fields are required');
        setEditLoading(false);
        return;
      }
      await vendorService.updateVendor(editForm._id, {
        name: editForm.name,
        category: editForm.category,
        contact: editForm.contact,
        phone: editForm.phone,
      });
      setShowEditModal(false);
      fetchVendors();
    } catch (err) {
      setEditError('Failed to update vendor');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    setDeleteLoading(id);
    try {
      await vendorService.deleteVendor(id);
      fetchVendors();
    } catch (err) {
      alert('Failed to delete vendor');
    } finally {
      setDeleteLoading('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Vendor Management</h1>
        <button
          className="rounded-full bg-blue-600 text-white px-6 py-2 shadow-lg hover:bg-blue-700 transition"
          onClick={() => setShowAddModal(true)}
        >
          + Add Vendor
        </button>
      </div>
      {loading ? (
        <div>Loading vendors...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : vendors.length === 0 ? (
        <div>No vendors found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor, idx) => (
            <div
              key={vendor._id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">{vendor.name}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColors[idx % badgeColors.length]}`}>
                    {vendor.category}
                  </span>
                </div>
                <div className="text-gray-600 text-sm mb-2">
                  <span className="font-medium">Contact:</span> {vendor.contact}
                </div>
                <div className="text-gray-600 text-sm mb-2">
                  <span className="font-medium">Phone:</span> {vendor.phone}
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${vendor.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {vendor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  className="flex-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                  onClick={() => handleEditVendor(vendor)}
                >
                  Edit
                </button>
                <button
                  className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 transition"
                  onClick={() => handleDeleteVendor(vendor._id)}
                  disabled={deleteLoading === vendor._id}
                >
                  {deleteLoading === vendor._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => { setShowAddModal(false); setAddError(''); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Add Vendor</h2>
            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Category</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={addForm.category}
                  onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Contact Email</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  type="email"
                  value={addForm.contact}
                  onChange={e => setAddForm(f => ({ ...f, contact: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={addForm.phone}
                  onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
              {addError && <div className="text-red-600">{addError}</div>}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => { setShowAddModal(false); setAddError(''); }}
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={addLoading}
                >
                  {addLoading ? 'Adding...' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => { setShowEditModal(false); setEditError(''); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Vendor</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Category</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={editForm.category}
                  onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Contact Email</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  type="email"
                  value={editForm.contact}
                  onChange={e => setEditForm(f => ({ ...f, contact: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
              {editError && <div className="text-red-600">{editError}</div>}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => { setShowEditModal(false); setEditError(''); }}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorManagement; 