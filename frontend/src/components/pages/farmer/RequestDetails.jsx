import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";

function RequestDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const res = await api.get(`/api/requests/${id}`);
      setRequest(res.data);
    } catch (error) {
      setError("Failed to load request details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async () => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    
    try {
      await api.put(`/api/requests/${id}`, { status: "cancelled" });
      navigate("/farmer/dashboard");
    } catch (error) {
      alert("Failed to cancel request");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      rejected: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error || "Request not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/farmer/dashboard"
            className="text-green-600 hover:text-green-700 font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {request.service?.name || "Service Request"}
              </h1>
              <p className="mt-2 text-gray-600">
                Request ID: {request._id?.slice(-8)}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {request.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Farm Details Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Farm Details</h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.farmDetails?.location}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Farm Size</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {request.farmDetails?.size} {request.farmDetails?.unit}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Crop Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.farmDetails?.cropType || "Not specified"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Service Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{request.serviceType}</dd>
                  </div>
                </dl>
                {request.farmDetails?.specialInstructions && (
                  <div className="mt-4">
                    <dt className="text-sm font-medium text-gray-500">Special Instructions</dt>
                    <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                      {request.farmDetails.specialInstructions}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Schedule & Pricing</h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Scheduled Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(request.scheduledDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Preferred Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.scheduledTime || "Flexible"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estimated Cost</dt>
                    <dd className="mt-1 text-2xl font-bold text-green-600">
                      ${request.estimatedCost?.toFixed(2) || "0.00"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Final Cost</dt>
                    <dd className="mt-1 text-2xl font-bold text-gray-900">
                      {request.finalCost ? `$${request.finalCost.toFixed(2)}` : "To be determined"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Notes Card */}
            {(request.farmerNotes || request.providerNotes) && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {request.farmerNotes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Your Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                        {request.farmerNotes}
                      </dd>
                    </div>
                  )}
                  {request.providerNotes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Provider Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-blue-50 p-3 rounded">
                        {request.providerNotes}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions & Provider Info */}
          <div className="space-y-8">
            {/* Provider Card */}
            {request.provider && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Assigned Provider</h3>
                </div>
                <div className="px-6 py-5">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {request.provider?.name?.charAt(0) || "P"}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{request.provider?.name}</h4>
                      <p className="text-sm text-gray-500">{request.provider?.serviceType || "Agricultural Services"}</p>
                      <p className="text-sm text-gray-500 mt-1">{request.provider?.phone || "No contact provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Request Timeline</h3>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Request Created</p>
                      <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                  
                  {request.acceptedAt && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Accepted by Provider</p>
                        <p className="text-sm text-gray-500">{formatDate(request.acceptedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {request.startedAt && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Service Started</p>
                        <p className="text-sm text-gray-500">{formatDate(request.startedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {request.completedAt && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Service Completed</p>
                        <p className="text-sm text-gray-500">{formatDate(request.completedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Card */}
            {request.status === "pending" && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Actions</h3>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <button
                    onClick={cancelRequest}
                    className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Cancel Request
                  </button>
                  <Link
                    to={`/requests/${id}/edit`}
                    className="w-full block px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-center"
                  >
                    Edit Request
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestDetails;