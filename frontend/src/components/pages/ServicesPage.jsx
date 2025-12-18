import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // FIX: Changed from "/services" to "/api/services"
      const res = await api.get("/api/services");
      console.log("Services loaded:", res.data); // Debug log
      setServices(res.data || []);
    } catch (err) {
      console.error("Error loading services:", err);
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Available Services</h2>
      {loading ? (
        <p>Loading services...</p>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700">Failed to load services: {String(error)}</p>
          <button 
            onClick={load} 
            className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-500">No services available.</p>
          <p className="text-sm text-gray-400 mt-2">
            Services have been seeded. Check if API endpoint is correct.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => (
            <li key={s._id} className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-800">{s.name}</h3>
                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {s.type}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{s.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-indigo-600">${s.basePrice}</span>
                  <span className="text-gray-500 text-sm ml-1">per {s.priceUnit}</span>
                  <p className="text-sm text-gray-500 mt-1">{s.duration}</p>
                </div>
                <Link 
                  to={`/requests/new?service=${s._id}`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Request Service
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}