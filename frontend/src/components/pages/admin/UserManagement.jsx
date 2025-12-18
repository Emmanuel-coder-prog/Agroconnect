import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";

function UserManagement() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive
    });
  };

  const handleUpdate = async (userId) => {
    try {
      await api.put(`/api/users/${userId}`, editForm);
      alert("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error.response?.data || "Failed to update user");
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      alert("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.response?.data || "Failed to delete user");
    }
  };

  const toggleUserStatus = async (userId, currentStatus, userName) => {
    const newStatus = !currentStatus;
    if (!window.confirm(`Are you sure you want to ${newStatus ? "activate" : "deactivate"} ${userName}?`)) {
      return;
    }

    try {
      await api.put(`/api/users/${userId}`, { isActive: newStatus });
      alert(`User ${newStatus ? "activated" : "deactivated"} successfully`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      alert(error.response?.data || "Failed to update user status");
    }
  };

  const filteredUsers = users.filter(user => {
    // Apply search filter
    if (search && !user.name.toLowerCase().includes(search.toLowerCase()) && 
        !user.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Apply role filter
    if (filter !== "all" && user.role !== filter) {
      return false;
    }
    
    return true;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "provider": return "bg-blue-100 text-blue-800";
      case "farmer": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (isActive) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-gray-600">Manage all users in the system</p>
            </div>
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="Search by name or email..."
              />
            </div>
            
            {/* Role Filter */}
            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="farmer">Farmers</option>
                <option value="provider">Service Providers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === "farmer").length}
            </div>
            <div className="text-sm text-gray-500">Farmers</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === "provider").length}
            </div>
            <div className="text-sm text-gray-500">Providers</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === "admin").length}
            </div>
            <div className="text-sm text-gray-500">Admins</div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-500">Loading users...</div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === userItem._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      ) : (
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold">
                              {userItem.name?.charAt(0) || "U"}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                            <div className="text-sm text-gray-500">{userItem.email}</div>
                          </div>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === userItem._id ? (
                        <div className="space-y-2">
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                          >
                            <option value="farmer">Farmer</option>
                            <option value="provider">Provider</option>
                            <option value="admin">Admin</option>
                          </select>
                          <select
                            value={editForm.isActive}
                            onChange={(e) => setEditForm({...editForm, isActive: e.target.value === "true"})}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userItem.role)}`}>
                            {userItem.role}
                          </span>
                          <div>{getStatusBadge(userItem.isActive)}</div>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === userItem._id ? (
                        <input
                          type="text"
                          value={editForm.phone || ""}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                          placeholder="Phone number"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{userItem.phone || "Not provided"}</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {editingUser === userItem._id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(userItem._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(userItem)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleUserStatus(userItem._id, userItem.isActive, userItem.name)}
                            className={userItem.isActive ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                          >
                            {userItem.isActive ? "Deactivate" : "Activate"}
                          </button>
                          {user._id !== userItem._id && (
                            <button
                              onClick={() => handleDelete(userItem._id, userItem.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isActive).length}
              </div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {users.filter(u => !u.isActive).length}
              </div>
              <div className="text-sm text-gray-500">Inactive Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === "provider" && u.isActive).length}
              </div>
              <div className="text-sm text-gray-500">Active Providers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(users.map(u => u.createdAt?.split('T')[0])).size}
              </div>
              <div className="text-sm text-gray-500">Registration Days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;