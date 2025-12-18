import { Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/organisms/Navbar";
import ProtectedRoute from "./components/hoc/ProtectedRoute";
import RoleBasedRoute from "./components/hoc/RoleBasedRoute";

// Public Pages
import Home from "./components/organisms/home.jsx";
import Signup from "./components/pages/SignupPage.jsx";
import Login from "./components/pages/LoginPage.jsx";
import ServicesPage from "./components/pages/ServicesPage.jsx";

// Farmer Pages
import FarmerDashboard from "./components/pages/farmer/FarmerDashboard.jsx";
import CreateRequest from "./components/pages/CreateRequest.jsx";
import RequestDetails from "./components/pages/RequestDetails.jsx";
import RequestList from "./components/pages/RequestList.jsx";
import Profile from "./components/pages/Profile.jsx";

// Provider Pages
import ProviderDashboard from "./components/pages/provider/ProviderDashboard.jsx";
import AvailableRequests from "./components/pages/provider/AvailableRequests.jsx";
import MyTasks from "./components/pages/provider/MyTasks.jsx";

// Admin Pages
import AdminDashboard from "./components/pages/admin/AdminDashboard.jsx";
import UserManagement from "./components/pages/admin/UserManagement.jsx";
import ServiceManagement from "./components/pages/admin/ServiceManagement.jsx";

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/services" element={<ServicesPage />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <RequestList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:id"
          element={
            <ProtectedRoute>
              <RequestDetails />
            </ProtectedRoute>
          }
        />

        {/* Farmer Routes */}
        <Route
          path="/farmer/dashboard"
          element={
            <RoleBasedRoute role="farmer">
              <FarmerDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/requests/new"
          element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <CreateRequest />
            </ProtectedRoute>
          }
        />

        {/* Provider Routes */}
        <Route
          path="/provider/dashboard"
          element={
            <RoleBasedRoute role="provider">
              <ProviderDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/requests/available"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <AvailableRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/my-tasks"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <MyTasks />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleBasedRoute role="admin">
              <AdminDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleBasedRoute role="admin">
              <UserManagement />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <RoleBasedRoute role="admin">
              <ServiceManagement />
            </RoleBasedRoute>
          }
        />

        {/* Catch all */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;