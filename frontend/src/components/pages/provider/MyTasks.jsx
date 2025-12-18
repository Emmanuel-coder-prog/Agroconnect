import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";

function MyTasks() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updatingTask, setUpdatingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/api/requests");
      setTasks(res.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Failed to load your tasks");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setUpdatingTask(taskId);
    try {
      await api.put(`/api/requests/${taskId}/status`, { status: newStatus });
      alert(`Task status updated to ${newStatus.replace("_", " ")}`);
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      alert(error.response?.data || "Failed to update task");
    } finally {
      setUpdatingTask(null);
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

  const getStatusActions = (task) => {
    switch (task.status) {
      case "accepted":
        return (
          <button
            onClick={() => updateTaskStatus(task._id, "in_progress")}
            disabled={updatingTask === task._id}
            className="px-3 py-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
          >
            {updatingTask === task._id ? "Starting..." : "Start Work"}
          </button>
        );
      case "in_progress":
        return (
          <button
            onClick={() => updateTaskStatus(task._id, "completed")}
            disabled={updatingTask === task._id}
            className="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
          >
            {updatingTask === task._id ? "Completing..." : "Mark Complete"}
          </button>
        );
      default:
        return null;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const stats = {
    total: tasks.length,
    accepted: tasks.filter(t => t.status === "accepted").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    pending: tasks.filter(t => t.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Assigned Tasks</h1>
              <p className="mt-2 text-gray-600">Manage your accepted service requests</p>
            </div>
            <Link
              to="/provider/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
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
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-700">Filter by status:</div>
            <div className="flex flex-wrap gap-2">
              {["all", "accepted", "in_progress", "completed", "pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === status
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" ? "All" : status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-500">Loading your tasks...</div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-500 mb-4">No tasks found</div>
            <p className="text-gray-600 mb-6">
              {filter !== "all" 
                ? `You don't have any ${filter.replace("_", " ")} tasks.`
                : "You haven't accepted any tasks yet."}
            </p>
            <Link
              to="/requests/available"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Browse Available Requests →
            </Link>
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
                    Estimated Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {task.service?.name}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {task.serviceType}
                          </div>
                        </div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ${task.estimatedCost?.toFixed(2)}
                      </div>
                      {task.finalCost && (
                        <div className="text-sm text-gray-500">
                          Final: ${task.finalCost.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {getStatusActions(task)}
                      <Link
                        to={`/requests/${task._id}`}
                        className="text-green-600 hover:text-green-900"
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

        {/* Summary */}
        {tasks.length > 0 && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${tasks.reduce((sum, t) => sum + (t.estimatedCost || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Total Estimated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${tasks.filter(t => t.finalCost).reduce((sum, t) => sum + (t.finalCost || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Total Final</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => t.acceptedAt).length}
                </div>
                <div className="text-sm text-gray-500">Accepted This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {tasks.filter(t => t.startedAt).length}
                </div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTasks;