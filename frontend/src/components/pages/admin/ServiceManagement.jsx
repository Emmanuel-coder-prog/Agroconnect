import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";

function ServiceManagement() {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "tractor",
    pricePerUnit: "",
    unit: "acre",
    duration: "",
    isActive: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get("/api/services");
      setServices(res.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      alert("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await api.put(`/api/services/${editingId}`, form);
        alert("Service updated successfully");
      } else {
        await api.post("/api/services", form);
        alert("Service created successfully");
      }
      
      resetForm();
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      alert(error.response?.data || "Failed to save service");
    }
  };

  const handleEdit = (service) => {
    setEditingId(service._id);
    setForm({
      name: service.name,
      description: service.description,
      category: service.category || "tractor",
      pricePerUnit: service.pricePerUnit,
      unit: service.unit || "acre",
      duration: service.duration || "",
      isActive: service.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/api/services/${serviceId}`);
      alert("Service deleted successfully");
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      alert(error.response?.data || "Failed to delete service");
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus, serviceName) => {
    const newStatus = !currentStatus;
    if (!window.confirm(`Are you sure you want to ${newStatus ? "activate" : "deactivate"} "${serviceName}"?`)) {
      return;
    }

    try {
      await api.put(`/api/services/${serviceId}`, { isActive: newStatus });
      alert(`Service ${newStatus ? "activated" : "deactivated"} successfully`);
      fetchServices();
    } catch (error) {
      console.error("Error updating service status:", error);
      alert(error.response?.data || "Failed to update service status");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      category: "tractor",
      pricePerUnit: "",
      unit: "acre",
      duration: "",
      isActive: true
    });
  };

  const categories = [
    { value: "tractor", label: "Tractor Services", icon: "🚜" },
    { value: "drone", label: "Drone Services", icon: "🚁" },
    { value: "irrigation", label: "Irrigation", icon: "💧" },
    { value: "harvesting", label: "Harvesting", icon: "🌾" },
    { value: "planting", label: "Planting", icon: "🌱" },
    { value: "spraying", label: "Spraying", icon: "🧪" }
  ];

  const units = [
    { value: "acre", label: "Per Acre" },
    { value: "hectare", label: "Per Hectare" },
    { value: "hour", label: "Per Hour" },
    { value: "day", label: "Per Day" },
    { value: "job", label: "Per Job" }
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case "tractor": return "bg-blue-100 text-blue-800";
      case "drone": return "bg-purple-100 text-purple-800";
      case "irrigation": return "bg-cyan-100 text-cyan-800";
      case "harvesting": return "bg-amber-100 text-amber-800";
      case "planting": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
              <p className="mt-2 text-gray-600">Manage the service catalog</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/admin/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {showForm ? "Cancel" : "Add New Service"}
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? "Edit Service" : "Add New Service"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    required
                    placeholder="e.g., Tractor Plowing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Per Unit *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={form.pricePerUnit}
                      onChange={(e) => setForm({...form, pricePerUnit: e.target.value})}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-green-500 focus:border-green-500"
                      required
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({...form, unit: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select unit</option>
                    {units.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({...form, duration: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 2-3 hours per acre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.isActive}
                    onChange={(e) => setForm({...form, isActive: e.target.value === "true"})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows="3"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  required
                  placeholder="Describe the service in detail..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {editingId ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-2xl font-bold text-gray-900">{services.length}</div>
            <div className="text-sm text-gray-500">Total Services</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-2xl font-bold text-green-600">
              {services.filter(s => s.isActive).length}
            </div>
            <div className="text-sm text-gray-500">Active Services</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(services.map(s => s.category)).size}
            </div>
            <div className="text-sm text-gray-500">Categories</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-2xl font-bold text-purple-600">
              ${services.reduce((sum, s) => sum + (s.pricePerUnit || 0), 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-500">Loading services...</div>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-500 mb-4">No services found</div>
            <p className="text-gray-600 mb-6">Add your first service to get started!</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Add New Service →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const categoryIcon = categories.find(c => c.value === service.category)?.icon || "🔧";
              return (
                <div key={service._id} className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  {/* Header */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{categoryIcon}</span>
                          <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                        </div>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                            {service.category}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {service.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${service.pricePerUnit}</div>
                        <div className="text-sm text-gray-500">per {service.unit}</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                    
                    {service.duration && (
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {service.duration}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Created: {new Date(service.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleServiceStatus(service._id, service.isActive, service.name)}
                          className={service.isActive ? "text-yellow-600 hover:text-yellow-900 text-sm font-medium" : "text-green-600 hover:text-green-900 text-sm font-medium"}
                        >
                          {service.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(service._id, service.name)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceManagement;