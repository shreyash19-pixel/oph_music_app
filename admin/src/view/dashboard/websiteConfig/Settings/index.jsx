import React, { useState, useEffect } from 'react';
import WebConfigSidebar from '../../../../components/WebConfigSidebar';
import axiosApi from '../../../../conf/axios';
import toast from 'react-hot-toast';

const WebsiteSettings = () => {
  // State for costing data
  const [costingItems, setCostingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Collapsible sections
  const [collapsedCosting, setCollapsedCosting] = useState(false);
  
  // Form data
  const [newItem, setNewItem] = useState({
    name: '',
    cost: '',
    qr_image_path: ''
  });
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  // Load costing data from API
  useEffect(() => {
    const fetchCostingData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosApi.get('/get_costing');
        
        // Ensure response and response.data exist
        if (response && response.data) {
          if (response.data.success && Array.isArray(response.data.data)) {
            console.log('Costing data received:', response.data.data);
            setCostingItems(response.data.data);
          } else {
            setError('Failed to load costing data: Invalid response format');
            setCostingItems([]);
          }
        } else {
          setError('Failed to load costing data: No response received');
          setCostingItems([]);
        }
      } catch (err) {
        console.error('Error fetching costing data:', err);
        // Ensure we're setting a string, not the error object
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load costing data';
        setError(errorMessage);
        setCostingItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCostingData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingItem(prev => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  // Handle edit file selection
  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFilePreview(URL.createObjectURL(file));
      setEditingItem(prev => ({ ...prev, qr_image_path: file })); // Store the actual file object
    }
  };

  // Add new costing item
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.name.trim() || !newItem.cost || !selectedFile) {
      setError('All fields are required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('cost', newItem.cost);
      formData.append('qr_image', selectedFile);

      const response = await axiosApi.post('/insert_costing', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response && response.data && response.data.success) {
        // Refresh the costing data
        const fetchResponse = await axiosApi.get('/get_costing');
        if (fetchResponse && fetchResponse.data && fetchResponse.data.success && Array.isArray(fetchResponse.data.data)) {
          setCostingItems(fetchResponse.data.data);
        }
        
        setNewItem({ name: '', cost: '', qr_image_path: '' });
        setShowAddForm(false);
        setSelectedFile(null);
        setFilePreview('');
        setError(null);
        toast.success('Costing package added successfully!');
      } else {
        const errorMsg = response?.data?.message || 'Failed to add costing item';
        setError(errorMsg);
        toast.error('Failed to add costing package');
      }
    } catch (err) {
      console.error('Error adding costing item:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to add costing item';
      setError(errorMessage);
      toast.error('Failed to add costing package');
    }
  };

  // Edit costing item
  const handleEditItem = async (e) => {
    e.preventDefault();
    
    if (!editingItem.cost) {
      setError('Cost is required');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('cost', editingItem.cost);
      
      // Only append QR image if a new file is selected
      if (editingItem.qr_image_path && editingItem.qr_image_path !== editingItem.originalQrImage) {
        formData.append('qr_image', editingItem.qr_image_path);
      }

      const response = await axiosApi.put(`/update_costing/${editingItem.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response && response.data && response.data.success) {
        // Refresh the entire costing list from server
        const refreshResponse = await axiosApi.get('/get_costing');
        if (refreshResponse && refreshResponse.data && refreshResponse.data.success && Array.isArray(refreshResponse.data.data)) {
          setCostingItems(refreshResponse.data.data);
        }
        
        setEditingItem(null);
        setShowEditForm(false);
        setFilePreview('');
        setError(null);
        toast.success('Costing item updated successfully');
      } else {
        const errorMsg = response?.data?.message || 'Failed to update costing item';
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error updating costing item:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update costing item';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete costing item
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await axiosApi.delete(`/api/costing/${id}`);
      
      // Mock successful response
      setCostingItems(prev => prev.filter(item => item.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting costing item:', err);
      setError('Failed to delete costing item');
    }
  };

  // Start editing an item
  const startEditing = (item) => {
    setEditingItem({ 
      ...item, 
      originalQrImage: item.qr_image_path // Store original QR image for comparison
    });
    setShowEditForm(true);
    setFilePreview(item.qr_image_path);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
    setShowEditForm(false);
    setFilePreview('');
  };

  // Cancel adding
  const cancelAdding = () => {
    setNewItem({ name: '', cost: '', qr_image_path: '' });
    setShowAddForm(false);
    setSelectedFile(null);
    setFilePreview('');
  };

  if (loading) {
    return (
      <div className="h-screen flex overflow-hidden relative bg-gray-50">
        <WebConfigSidebar>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d3c44] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading costing data...</p>
            </div>
          </div>
        </WebConfigSidebar>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden relative bg-gray-50">
      <WebConfigSidebar>
        <div className="flex-1 overflow-auto flex justify-center">
          <div className="w-[1600px]">
            {/* Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-[#0d3c44] to-[#145058] text-white rounded-none shadow-lg mb-6">
              <h2 className="text-3xl font-extrabold tracking-wide leading-tight drop-shadow-sm">
                Settings
              </h2>
              <p className="mt-2 text-gray-200">
                Manage website settings
              </p>
            </div>

            <div className="px-8 space-y-8">
              {/* Costing Section */}
              <div>
                {/* Section Header with Collapse */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCollapsedCosting(!collapsedCosting)}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 transform transition-transform ${collapsedCosting ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Website Costing  ({costingItems.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      if (collapsedCosting) {
                        setCollapsedCosting(false);
                      }
                      setShowAddForm(!showAddForm);
                    }}
                    className="px-6 py-3 bg-[#0d3c44] hover:bg-[#145058] text-white font-medium rounded-lg transition-colors duration-200 shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {showAddForm ? 'Cancel' : 'Add Package'}
                  </button>
                </div>

                {/* Collapsible Content */}
                {!collapsedCosting && (
                  <>
                    {/* Add Package Form */}
                    {showAddForm && (
                      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
                        <h4 className="text-lg font-medium text-gray-800 mb-4">Add New Costing Package</h4>
                        <form onSubmit={handleAddItem} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Package Name *
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={newItem.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3c44] focus:border-transparent transition-colors"
                                placeholder="e.g., Basic Package, Premium Package"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cost (INR) *
                              </label>
                              <input
                                type="number"
                                name="cost"
                                value={newItem.cost}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3c44] focus:border-transparent transition-colors"
                                placeholder="999.00"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              QR Code Image *
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3c44] focus:border-transparent transition-colors"
                              required
                            />
                            {filePreview && (
                              <div className="mt-2">
                                <img src={filePreview} alt="QR Preview" className="w-20 h-20 object-cover rounded border" />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="submit"
                              className="px-6 py-2 bg-[#0d3c44] hover:bg-[#145058] text-white font-medium rounded-lg transition-colors duration-200"
                            >
                              Add Package
                            </button>
                            <button
                              type="button"
                              onClick={cancelAdding}
                              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Edit Package Form */}
                    {showEditForm && editingItem && (
                      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
                        <h4 className="text-lg font-medium text-gray-800 mb-4">Edit Costing Package</h4>
                        <form onSubmit={handleEditItem} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Package Name
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={editingItem.name}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                              />
                              <p className="text-xs text-gray-500 mt-1">Package name cannot be changed</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cost (INR) *
                              </label>
                              <input
                                type="number"
                                name="cost"
                                value={editingItem.cost}
                                onChange={handleEditInputChange}
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3c44] focus:border-transparent transition-colors"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              QR Code Image (Optional)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditFileChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3c44] focus:border-transparent transition-colors"
                            />
                            {filePreview && (
                              <div className="mt-2">
                                <img src={filePreview} alt="QR Preview" className="w-20 h-20 object-cover rounded border" />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="submit"
                              className="px-6 py-2 bg-[#0d3c44] hover:bg-[#145058] text-white font-medium rounded-lg transition-colors duration-200"
                            >
                              Update Package
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Costing Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
                      <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Package Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cost (INR)
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                QR Code
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Updated
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {costingItems.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                  <div className="flex flex-col items-center">
                                    <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <p className="text-lg font-medium">No costing packages found</p>
                                    <p className="text-sm">Get started by adding your first pricing package</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              costingItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-green-600">
                                      ₹{item.cost ? Number(item.cost).toFixed(2) : '0.00'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <img 
                                        src={item.qr_image_path} 
                                        alt="QR Code" 
                                        className="w-12 h-12 object-cover rounded border"
                                        onError={(e) => {
                                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxMkgxNlYxNkgxMlYxMlpNMjAgMTJIMjRWMjBIMjBWMjJaTTEyIDIwSDE2VjI0SDEyVjIwWk0yMCAyMEgyNFYyNEgyMFYyMFpNMzIgMTJIMzZWMjBIMzJWMjJaTTMyIDIwSDM2VjI0SDMyVjIwWk0yOCAxNkgyNFYyMEgyOFYxNlpNMjggMjBIMzJWMjRIMjhWMjBaTTI0IDI4SDIwVjMySDI0VjI4Wk0yOCAyOEgzMlYzMkgyOFYyOFpNMzIgMjhIMzZWMjhaTTM2IDI4SDQwVjMySDM2VjI4Wk0yMCAzNkgxNlY0MEgyMFYzNlpNMjQgMzZIMjBWMjBIMjRWMzZaTTI4IDM2SDMyVjQwSDI4VjM2Wk0zMiAzNkgzNlY0MEgzMlYzNlpNMzYgMzZINDBWMjBIMzZWMzZaTTQwIDM2SDQ0VjQwSDQwVjM2WiIgZmlsbD0iIzY2NzM4MCIvPgo8L3N2Zz4K';
                                        }}
                                      />
                                      <span className="ml-2 text-xs text-gray-500 truncate max-w-20">
                                        {item.qr_image_path ? item.qr_image_path.split('/').pop() : 'No image'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric'
                                    }) : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.updated_at ? new Date(item.updated_at).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric'
                                    }) : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => startEditing(item)}
                                        className="text-blue-600 hover:text-blue-900"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </WebConfigSidebar>
    </div>
  );
};

export default WebsiteSettings;