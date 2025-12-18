import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

function RequestList() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    serviceType: "all",
    dateRange: "all"
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const endpoint = user?.role === "admin" 
        ? "/api/requests/admin" 
        : "/api/requests";
      
      const res = await api.get(endpoint);
      setRequests(res.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      alert("Failed to load requests");
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
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getServiceTypeColor = (type) => {
    switch (type) {
      case "tractor": return "bg-blue-100 text-blue-800";
      case "drone": return "bg-purple-100 text-purple-800";
      case "irrigation": return "bg-cyan-100 text-cyan-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Filter and sort requests
  const filteredRequests = requests
    .filter(request => {
      // Status filter
      if (filters.status !== "all" && request.status !== filters.status) {
        return false;
      }
      
      // Service type filter
      if (filters.serviceType !== "all" && request.serviceType !== filters.serviceType) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange !== "all") {
        const requestDate = new Date(request.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now - requestDate) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case "today": return diffDays === 0;
          case "week": return diffDays <= 7;
          case "month": return diffDays <= 30;
          default: return true;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "cost":
          aValue = a.finalCost || a.estimatedCost || 0;
          bValue = b.finalCost || b.estimatedCost || 0;
          break;
        case "date":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      
      if (sortOrder === "desc") {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    accepted: requests.filter(r => r.status === "accepted").length,
    inProgress: requests.filter(r => r.status === "in_progress").length,
    completed: requests.filter(r => r.status === "completed").length,
    totalValue: requests.reduce((sum, r) => sum + (r.finalCost || r.estimatedCost || 0), 0)
  };

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" }
  ];

  const serviceTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "tractor", label: "Tractor" },
    { value: "drone", label: "Drone" },
    { value: "irrigation", label: "Irrigation" },
    { value: "harvesting", label: "Harvesting" },
    { value: "planting", label: "Planting" }
  ];

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 30 Days" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
              <p className="mt-2 text-gray-600">
                {user?.role === "admin" 
                  ? "All service requests in the system" 
                  : "Your service requests"}
              </p>
            </div>
            {user?.role === "farmer" && (
              <Link
                to="/requests/new"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                New Request
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Requests</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.accepted}</div>
            <div className="text-sm text-gray-500">Accepted</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalValue)}
            </div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={filters.serviceType}
                onChange={(e) => setFilters({...filters, serviceType: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              >
                {serviceTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                >
                  <option value="date">Date</option>
                  <option value="cost">Cost</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-500">Loading requests...</div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-500 mb-4">No requests found</div>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(f => f !== "all") 
                ? "Try adjusting your filters" 
                : user?.role === "farmer" 
                  ? "Create your first service request!"
                  : "No service requests available yet."}
            </p>
            {user?.role === "farmer" && (
              <Link
                to="/requests/new"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Create New Request →
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farm Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.service?.name || "Service Request"}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceTypeColor(request.serviceType)}`}>
                              {request.serviceType}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Created: {formatDate(request.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.farmDetails?.location || "Location not specified"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.farmDetails?.size} {request.farmDetails?.unit}
                        {request.farmDetails?.cropType && ` • ${request.farmDetails.cropType}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Farmer: {request.farmer?.name}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace("_", " ")}
                        </span>
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(request.finalCost || request.estimatedCost)}
                        </div>
                        {request.finalCost && (
                          <div className="text-xs text-gray-500">
                            Final cost
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/requests/${request._id}`}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        View Details
                      </Link>
                      {user?.role === "admin" && (
                        <button className="text-blue-600 hover:text-blue-900">
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {filteredRequests.length > 0 && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="text-sm text-gray-500">
                  Showing {filteredRequests.length} of {requests.length} requests
                </div>
                <div className="text-sm text-gray-500">
                  Total filtered value: {formatCurrency(
                    filteredRequests.reduce((sum, r) => sum + (r.finalCost || r.estimatedCost || 0), 0)
                  )}
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Print Report
                </button>
                <button
                  onClick={() => {
                    const csv = [
                      ['ID', 'Service', 'Status', 'Cost', 'Location', 'Created'],
                      ...filteredRequests.map(r => [
                        r._id,
                        r.service?.name,
                        r.status,
                        r.finalCost || r.estimatedCost,
                        r.farmDetails?.location,
                        formatDate(r.createdAt)
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'service-requests.csv';
                    a.click();
                  }}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestList;