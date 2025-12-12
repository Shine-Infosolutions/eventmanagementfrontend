import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://eventbackend-pi.vercel.app';

const ManagePassTypes = () => {
  const navigate = useNavigate();
  const [passTypes, setPassTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingPassType, setViewingPassType] = useState(null);
  const [editingPassType, setEditingPassType] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    max_people: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    loadPassTypes();
  }, []);

  const loadPassTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pass-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPassTypes(data);
      }
    } catch (error) {
      console.error('Error loading pass types:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPassType = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pass-types`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Pass type created successfully!');
        setShowCreateModal(false);
        resetForm();
        loadPassTypes();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const updatePassType = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pass-types/${editingPassType._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Pass type updated successfully!');
        setEditingPassType(null);
        resetForm();
        loadPassTypes();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const deletePassType = async (id) => {
    if (!confirm('Are you sure you want to delete this pass type?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pass-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Pass type deleted successfully!');
        loadPassTypes();
      } else {
        throw new Error('Failed to delete pass type');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      max_people: '',
      description: '',
      is_active: true
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (passType) => {
    setFormData({
      name: passType.name,
      price: passType.price,
      max_people: passType.max_people,
      description: passType.description || '',
      is_active: passType.is_active
    });
    setEditingPassType(passType);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPassType) {
      updatePassType();
    } else {
      createPassType();
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Pass Types</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center w-full sm:w-auto"
        >
          <span className="mr-2">+</span>
          Add New Pass Type
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4">
            {passTypes.map((passType) => (
              <div key={passType._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{passType.name}</h3>
                    <p className="text-sm text-gray-500">Rs {passType.price} • {passType.max_people} people</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    passType.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {passType.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{passType.description || 'No description'}</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setViewingPassType(passType)}
                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openEditModal(passType)}
                    className="px-3 py-2 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePassType(passType._id)}
                    className="px-3 py-2 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max People</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {passTypes.map((passType) => (
                    <tr key={passType._id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{passType.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">Rs {passType.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{passType.max_people}</td>
                      <td className="px-6 py-4">{passType.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          passType.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {passType.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewingPassType(passType)}
                            className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 bg-blue-100 rounded"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(passType)}
                            className="text-green-600 hover:text-green-800 text-sm px-2 py-1 bg-green-100 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePassType(passType._id)}
                            className="text-red-600 hover:text-red-800 text-sm px-2 py-1 bg-red-100 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {passTypes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No pass types found</p>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPassType) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold">
                {editingPassType ? 'Edit Pass Type' : 'Create Pass Type'}
              </h2>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPassType(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                X
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={editingPassType}
                >
                  <option value="">Select Pass Type</option>
                  <option value="Teens">Teens</option>
                  <option value="Couple">Couple</option>
                  <option value="Family">Family</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Max People</label>
                <input
                  type="number"
                  value={formData.max_people}
                  onChange={(e) => setFormData({...formData, max_people: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPassType(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingPassType ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingPassType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold">Pass Type Details</h2>
              <button 
                onClick={() => setViewingPassType(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                X
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg font-semibold">{viewingPassType.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Price</label>
                  <p className="text-lg font-semibold text-green-600">Rs {viewingPassType.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Max People</label>
                  <p className="text-lg">{viewingPassType.max_people}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm bg-gray-50 p-3 rounded">{viewingPassType.description || 'No description'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    viewingPassType.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {viewingPassType.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Valid For Event</label>
                  <p className="text-sm">{viewingPassType.valid_for_event}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm">{new Date(viewingPassType.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setViewingPassType(null)}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePassTypes;