import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";

function FarmerDashboard() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    completed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/requests");
      setRequests(res.data || []);
      
      // Calculate stats
      const pending = res.data.filter(r => r.status === "pending").length;
      const accepted = res.data.filter(r => r.status === "accepted").length;
      const completed = res.data.filter(r => r.status === "completed").length;
      
      setStats({
        pending,
        accepted,
        completed,
        total: res.data.length
      });
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.name}! Manage your service requests here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Requests</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.accepted}</div>
            <div className="text-sm text-gray-500">Accepted</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8 flex space-x-4">
          <Link
            to="/services"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Browse Services
          </Link>
          <Link
            to="/requests/new"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            New Service Request
          </Link>
        </div>

        {/* Recent Requests */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Service Requests</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>You haven't created any service requests yet.</p>
              <Link to="/services" className="text-green-600 hover:text-green-700 font-medium">
                Browse available services →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {requests.slice(0, 5).map((request) => (
                <li key={request._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {request.service?.name || "Service Request"}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Location: {request.farmDetails?.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Size: {request.farmDetails?.size} {request.farmDetails?.unit}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Scheduled: {formatDate(request.scheduledDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Link
                        to={`/requests/${request._id}`}
                        className="font-medium text-green-600 hover:text-green-700"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {requests.length > 5 && (
            <div className="px-4 py-4 sm:px-6 border-t border-gray-200 text-center">
              <Link to="/requests" className="text-green-600 hover:text-green-700 font-medium">
                View all requests →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FarmerDashboard;