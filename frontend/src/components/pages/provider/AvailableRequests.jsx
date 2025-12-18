import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";

function AvailableRequests() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, drone, tractor
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/requests/available");
      setRequests(res.data || []);
    } catch (error) {
      console.error("Error fetching available requests:", error);
      alert("Failed to load available requests");
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    setAcceptingId(requestId);
    try {
      await api.post(`/api/requests/${requestId}/accept`);
      alert("Request accepted successfully!");
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error("Error accepting request:", error);
      alert(error.response?.data || "Failed to accept request");
    } finally {
      setAcceptingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === "all") return true;
    return request.serviceType === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Available Service Requests</h1>
              <p className="mt-2 text-gray-600">
                Browse and accept available agricultural service requests
              </p>
            </div>
            <Link
              to="/provider/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-700">Filter by service type:</div>
            <div className="flex space-x-2">
              {["all", "drone", "tractor"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === type
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-500">Loading available requests...</div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-500 mb-4">No available requests found</div>
            <p className="text-gray-600 mb-6">
              {filter !== "all" 
                ? `No ${filter} service requests available. Try selecting "All Types".`
                : "Check back later for new service requests."}
            </p>
            <Link
              to="/provider/dashboard"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Return to Dashboard →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 hover:border-green-300 transition-colors">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{request.service?.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 capitalize">• {request.serviceType}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${request.estimatedCost?.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Estimated</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {request.farmDetails?.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      {request.farmDetails?.size} {request.farmDetails?.unit}
                    </div>
                    {request.farmDetails?.cropType && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        {request.farmDetails.cropType}
                      </div>
                    )}
                  </div>
                </div>

                {/* Farmer Info */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold">
                        {request.farmer?.name?.charAt(0) || "F"}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{request.farmer?.name}</div>
                      <div className="text-sm text-gray-500">Farmer</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <Link
                      to={`/requests/${request._id}`}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      View Details →
                    </Link>
                    <button
                      onClick={() => acceptRequest(request._id)}
                      disabled={acceptingId === request._id}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {acceptingId === request._id ? "Accepting..." : "Accept Job"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {requests.length > 0 && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Showing {filteredRequests.length} of {requests.length} requests</div>
              <div className="flex justify-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
                  <div className="text-sm text-gray-500">Total Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${requests.reduce((sum, req) => sum + (req.estimatedCost || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Total Value</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AvailableRequests;