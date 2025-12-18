import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

function CreateRequest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const preService = searchParams.get("service");

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    serviceId: preService || "",
    serviceType: "tractor",
    farmDetails: {
      location: "",
      size: "",
      unit: "acre",
      cropType: "",
      specialInstructions: ""
    },
    scheduledDate: "",
    farmerNotes: "",
    estimatedCost: ""
  });

  useEffect(() => {
    if (!user || user.role !== "farmer") {
      navigate("/");
      return;
    }

    fetchServices();
  }, [user, navigate]);

  const fetchServices = async () => {
    try {
      const res = await api.get("/api/services");
      setServices(res.data || []);
      
      // If pre-selected service, populate its details
      if (preService) {
        const selectedService = res.data.find(s => s._id === preService);
        if (selectedService) {
          setForm(prev => ({
            ...prev,
            serviceType: selectedService.category,
            estimatedCost: selectedService.pricePerUnit
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      alert("Failed to load services");
    }
  };

  const updateForm = (field, value) => {
    if (field.startsWith("farmDetails.")) {
      const farmField = field.split(".")[1];
      setForm(prev => ({
        ...prev,
        farmDetails: {
          ...prev.farmDetails,
          [farmField]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const calculateCost = () => {
    if (!form.serviceId || !form.farmDetails.size) return "0.00";
    
    const service = services.find(s => s._id === form.serviceId);
    if (!service) return "0.00";
    
    const size = parseFloat(form.farmDetails.size) || 0;
    const cost = size * service.pricePerUnit;
    return cost.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== "farmer") {
      alert("Only farmers can create service requests");
      return;
    }

    if (!form.serviceId) {
      alert("Please select a service");
      return;
    }

    if (!form.farmDetails.location || !form.farmDetails.size) {
      alert("Please provide farm location and size");
      return;
    }

    try {
      setLoading(true);
      
      const selectedService = services.find(s => s._id === form.serviceId);
      const payload = {
        serviceId: form.serviceId,
        serviceType: form.serviceType,
        farmDetails: {
          ...form.farmDetails,
          size: parseFloat(form.farmDetails.size)
        },
        scheduledDate: form.scheduledDate || undefined,
        farmerNotes: form.farmerNotes,
        estimatedCost: parseFloat(calculateCost())
      };

      const res = await api.post("/api/requests", payload);
      
      if (res.status === 201) {
        alert("Service request created successfully!");
        navigate("/farmer/dashboard");
      } else {
        alert("Failed to create request: " + (res.data?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Create request error:", error);
      alert(error.response?.data?.message || error.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  const cropTypes = [
    "Wheat", "Rice", "Corn", "Soybean", "Cotton", "Sugarcane",
    "Coffee", "Tea", "Fruits", "Vegetables", "Flowers", "Other"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Create New Service Request</h1>
            <p className="text-green-100 mt-1">Request agricultural services for your farm</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Service Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Select Service</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    value={form.serviceId}
                    onChange={(e) => {
                      const selected = services.find(s => s._id === e.target.value);
                      updateForm("serviceId", e.target.value);
                      updateForm("serviceType", selected?.category || "tractor");
                      updateForm("estimatedCost", selected?.pricePerUnit || "");
                    }}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a service...</option>
                    {services
                      .filter(s => s.isActive)
                      .map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.name} - ${service.pricePerUnit}/{service.unit}
                        </option>
                      ))}
                  </select>
                </div>

                {form.serviceId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-900">
                          {services.find(s => s._id === form.serviceId)?.name}
                        </div>
                        <div className="text-sm text-green-700 mt-1">
                          {services.find(s => s._id === form.serviceId)?.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${calculateCost()}
                        </div>
                        <div className="text-sm text-green-600">
                          Estimated Total
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Farm Details */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Farm Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Location *
                  </label>
                  <input
                    type="text"
                    value={form.farmDetails.location}
                    onChange={(e) => updateForm("farmDetails.location", e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    placeholder="Enter farm address or coordinates"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Size *
                    </label>
                    <input
                      type="number"
                      value={form.farmDetails.size}
                      onChange={(e) => updateForm("farmDetails.size", e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      value={form.farmDetails.unit}
                      onChange={(e) => updateForm("farmDetails.unit", e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="acre">Acres</option>
                      <option value="hectare">Hectares</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Type
                  </label>
                  <select
                    value={form.farmDetails.cropType}
                    onChange={(e) => updateForm("farmDetails.cropType", e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select crop type</option>
                    {cropTypes.map((crop) => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduledDate}
                    onChange={(e) => updateForm("scheduledDate", e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={form.farmDetails.specialInstructions}
                  onChange={(e) => updateForm("farmDetails.specialInstructions", e.target.value)}
                  rows="3"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Any special requirements or instructions for the service provider..."
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Additional Notes</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes for Service Provider
                </label>
                <textarea
                  value={form.farmerNotes}
                  onChange={(e) => updateForm("farmerNotes", e.target.value)}
                  rows="4"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add any additional information or specific requirements..."
                />
              </div>
            </div>

            {/* Summary & Submit */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <div className="text-lg font-semibold text-gray-900">Request Summary</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {form.serviceId ? (
                      <>
                        {services.find(s => s._id === form.serviceId)?.name} • 
                        {form.farmDetails.size} {form.farmDetails.unit} • 
                        Estimated: <span className="font-bold text-green-600">${calculateCost()}</span>
                      </>
                    ) : (
                      "Complete the form to see summary"
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/services")}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Browse More Services
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !form.serviceId}
                    className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating Request..." : "Create Service Request"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateRequest;