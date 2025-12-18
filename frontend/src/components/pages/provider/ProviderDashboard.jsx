import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";

function ProviderDashboard() {
  const { user } = useContext(AuthContext);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [availableRes, tasksRes] = await Promise.all([
        api.get("/api/requests/available"),
        api.get("/api/requests")
      ]);

      setAvailableRequests(availableRes.data || []);
      setMyTasks(tasksRes.data || []);

      // Calculate stats
      const available = availableRes.data.length;
      const assigned = tasksRes.data.filter(t => t.status === "accepted").length;
      const inProgress = tasksRes.data.filter(t => t.status === "in_progress").length;
      const completed = tasksRes.data.filter(t => t.status === "completed").length;

      setStats({ available, assigned, inProgress, completed });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await api.post(`/api/requests/${requestId}/accept`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error accepting request:", error);
      alert(error.response?.data || "Failed to accept request");
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/api/requests/${taskId}/status`, { status });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating task:", error);
      alert(error.response?.data || "Failed to update task");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Provider Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome, {user?.name}! Manage your agricultural services here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.available}</div>
            <div className="text-sm text-gray-500">Available Jobs</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
            <div className="text-sm text-gray-500">Assigned Tasks</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        {/* Available Requests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Available Service Requests</h2>
            <Link
              to="/requests/available"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View all →
            </Link>
          </div>
          
          {loading ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
              Loading available requests...
            </div>
          ) : availableRequests.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
              <p>No available requests at the moment.</p>
              <p className="text-sm mt-1">Check back later for new service requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRequests.slice(0, 3).map((request) => (
                <div key={request._id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.service?.name}
                      </h3>
                      <span className="text-lg font-bold text-green-600">
                        ${request.estimatedCost?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Farm:</span> {request.farmDetails?.location}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Size:</span> {request.farmDetails?.size} {request.farmDetails?.unit}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Crop:</span> {request.farmDetails?.cropType || "Not specified"}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <button
                        onClick={() => acceptRequest(request._id)}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Accept Job
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Assigned Tasks</h2>
            <Link
              to="/requests/my-tasks"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View all →
            </Link>
          </div>
          
          {myTasks.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
              <p>You don't have any assigned tasks yet.</p>
              <p className="text-sm mt-1">Accept available jobs to get started!</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Farmer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myTasks.slice(0, 5).map((task) => (
                    <tr key={task._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {task.service?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${task.estimatedCost?.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{task.farmer?.name}</div>
                        <div className="text-sm text-gray-500">{task.farmer?.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {task.status === "accepted" && (
                          <button
                            onClick={() => updateTaskStatus(task._id, "in_progress")}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Start
                          </button>
                        )}
                        {task.status === "in_progress" && (
                          <button
                            onClick={() => updateTaskStatus(task._id, "completed")}
                            className="text-green-600 hover:text-green-900"
                          >
                            Complete
                          </button>
                        )}
                        <Link
                          to={`/requests/${task._id}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProviderDashboard;