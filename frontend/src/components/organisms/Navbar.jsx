import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Navbar() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "farmer": return "/farmer/dashboard";
      case "provider": return "/provider/dashboard";
      case "admin": return "/admin/dashboard";
      default: return "/";
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-800 rounded-lg mr-2"></div>
              <span className="text-xl font-bold text-gray-800">AgroConnect</span>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link 
                to={getDashboardLink()} 
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              
              {user?.role === "farmer" && (
                <>
                  <Link 
                    to="/services" 
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Services
                  </Link>
                  <Link 
                    to="/requests/new" 
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    New Request
                  </Link>
                </>
              )}
              
              {user?.role === "provider" && (
                <>
                  <Link 
                    to="/requests/available" 
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Available Jobs
                  </Link>
                  <Link 
                    to="/requests/my-tasks" 
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Tasks
                  </Link>
                </>
              )}
              
              {user?.role === "admin" && (
                <>
                  <Link 
                    to="/admin/users" 
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Users
                  </Link>
                  <Link 
                    to="/admin/services" 
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Services
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;