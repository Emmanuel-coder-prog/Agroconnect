import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [finalCost, setFinalCost] = useState("");

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/api/requests/${id}`);
      setRequest(res.data);
      setNotes(res.data.providerNotes || "");
      setFinalCost(res.data.finalCost || "");
    } catch (error) {
      console.error("Error fetching request:", error);
      alert("Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this request as ${newStatus}?`)) {
      return;
    }

    setUpdating(true);
    try {
      const data = { status: newStatus };
      if (newStatus === "completed" && finalCost) {
        data.finalCost = parseFloat(finalCost);
      }
      if (notes && user.role === "provider") {
        data.providerNotes = notes;
      }

      await api.put(`/api/requests/${id}/status`, data);
      fetchRequest(); // Refresh
      alert(`Request status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this request? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/api/requests/${id}`);
      alert("Request deleted successfully");
      navigate(user.role === "farmer" ? "/farmer/dashboard" : "/provider/dashboard");
    } catch (error) {
      console.error("Error deleting request:", error);
      alert(error.response?.data || "Failed to delete request");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "accepted": return "bg-blue-100 text-blue-800 border-blue-300";
      case "in_progress": return "bg-purple-100 text-purple-800 border-purple-300";
      case "completed": return "bg-green-100 text-green-800 border-green-300";
      case "rejected": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading request details...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Request not found</div>
          <Link to="/" className="text-green-600 hover:text-green-700 font-medium">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Request Details</h1>
              <p className="mt-2 text-gray-600">ID: {request._id}</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={user.role === "farmer" ? "/farmer/dashboard" : "/provider/dashboard"}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </Link>
              {(user.role === "farmer" || user.role === "admin") && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  disabled={updating}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`mb-8 p-4 rounded-lg border ${getStatusColor(request.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Current Status</div>
              <div className="text-2xl font-bold capitalize mt-1">{request.status.replace("_", " ")}</div>
              {request.provider && (
                <div className="mt-2 text-sm">
                  Assigned to: <span className="font-medium">{request.provider?.name}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm">Created</div>
              <div className="font-medium">{formatDate(request.createdAt)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Request Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Service Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Service Type</div>
                  <div className="font-medium">{request.service?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Service Category</div>
                  <div className="font-medium capitalize">{request.serviceType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Estimated Cost</div>
                  <div className="font-medium text-green-600">${request.estimatedCost?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Final Cost</div>
                  <div className="font-medium">
                    {request.finalCost ? (
                      <span className="text-green-600">${request.finalCost.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-500">Not set</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Farm Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Farm Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">{request.farmDetails?.location}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Farm Size</div>
                  <div className="font-medium">{request.farmDetails?.size} {request.farmDetails?.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Crop Type</div>
                  <div className="font-medium">{request.farmDetails?.cropType || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Scheduled Date</div>
                  <div className="font-medium">{formatDate(request.scheduledDate)}</div>
                </div>
                {request.farmDetails?.specialInstructions && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Special Instructions</div>
                    <div className="font-medium mt-1 p-3 bg-gray-50 rounded">{request.farmDetails.specialInstructions}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
              <div className="space-y-6">
                {request.farmerNotes && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Farmer's Notes</div>
                    <div className="p-3 bg-blue-50 rounded">{request.farmerNotes}</div>
                  </div>
                )}
                
                {user.role === "provider" && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Provider Notes</div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="3"
                      placeholder="Add notes about this service..."
                    />
                  </div>
                )}
                
                {request.providerNotes && user.role !== "provider" && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Provider's Notes</div>
                    <div className="p-3 bg-green-50 rounded">{request.providerNotes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Timeline */}
          <div className="space-y-8">
            {/* User Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">People</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Farmer</div>
                  <div className="font-medium">{request.farmer?.name}</div>
                  <div className="text-sm text-gray-600">{request.farmer?.email}</div>
                  <div className="text-sm text-gray-600">{request.farmer?.phone}</div>
                </div>
                
                {request.provider && (
                  <div>
                    <div className="text-sm text-gray-500">Service Provider</div>
                    <div className="font-medium">{request.provider?.name}</div>
                    <div className="text-sm text-gray-600">{request.provider?.email}</div>
                    <div className="text-sm text-gray-600">{request.provider?.phone}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {(user.role === "provider" || user.role === "admin") && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Update Status</h2>
                
                {user.role === "provider" && request.provider && request.provider._id === user.id && (
                  <div className="space-y-3">
                    {request.status === "accepted" && (
                      <button
                        onClick={() => handleStatusUpdate("in_progress")}
                        disabled={updating}
                        className="w-full px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                      >
                        {updating ? "Updating..." : "Start Work"}
                      </button>
                    )}
                    
                    {request.status === "in_progress" && (
                      <>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Final Cost
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              $
                            </span>
                            <input
                              type="number"
                              value={finalCost}
                              onChange={(e) => setFinalCost(e.target.value)}
                              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="Enter final cost"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleStatusUpdate("completed")}
                          disabled={updating || !finalCost}
                          className="w-full px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          {updating ? "Completing..." : "Mark as Completed"}
                        </button>
                      </>
                    )}
                    
                    {["pending", "accepted", "in_progress"].includes(request.status) && (
                      <button
                        onClick={() => handleStatusUpdate("rejected")}
                        disabled={updating}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        {updating ? "Updating..." : "Reject Request"}
                      </button>
                    )}
                  </div>
                )}
                
                {user.role === "admin" && (
                  <div className="space-y-2">
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      disabled={updating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      Admin: Direct status update
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                {request.createdAt && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Request Created</div>
                      <div className="text-sm text-gray-500">{formatDate(request.createdAt)}</div>
                    </div>
                  </div>
                )}
                
                {request.acceptedAt && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Request Accepted</div>
                      <div className="text-sm text-gray-500">{formatDate(request.acceptedAt)}</div>
                    </div>
                  </div>
                )}
                
                {request.startedAt && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-purple-500 rounded-full"></div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Work Started</div>
                      <div className="text-sm text-gray-500">{formatDate(request.startedAt)}</div>
                    </div>
                  </div>
                )}
                
                {request.completedAt && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Work Completed</div>
                      <div className="text-sm text-gray-500">{formatDate(request.completedAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestDetails;