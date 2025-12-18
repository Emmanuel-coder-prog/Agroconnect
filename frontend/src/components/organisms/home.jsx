import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./home.css";

function Home() {
  const { user, isAuthenticated } = useContext(AuthContext);

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "farmer": return "/farmer/dashboard";
      case "provider": return "/provider/dashboard";
      case "admin": return "/admin/dashboard";
      default: return "/";
    }
  };

  const getDashboardText = () => {
    if (!user) return "Get Started";
    switch (user.role) {
      case "farmer": return "Go to Farmer Dashboard";
      case "provider": return "Go to Provider Dashboard";
      case "admin": return "Go to Admin Dashboard";
      default: return "Dashboard";
    }
  };

  return (
    <div className="hero">
      <div className="hero-content">
        <h1>AgroConnect</h1>
        <p className="lead">
          Connecting farmers with agricultural service providers. 
          Request drone spraying, tractor services, and track progress in real-time.
        </p>
        
        <div className="benefits">
          <div className="benefit">
            <i>🚜</i>
            <strong>For Farmers</strong>
            <p>Request services, track progress, and manage your farm efficiently</p>
          </div>
          <div className="benefit">
            <i>🛠️</i>
            <strong>For Service Providers</strong>
            <p>Find jobs, manage tasks, and grow your agricultural services business</p>
          </div>
          <div className="benefit">
            <i>📊</i>
            <strong>Real-time Tracking</strong>
            <p>Monitor service progress from pending to completion</p>
          </div>
          <div className="benefit">
            <i>💳</i>
            <strong>Transparent Pricing</strong>
            <p>Clear estimates and final costs for all services</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          {isAuthenticated ? (
            <Link
              to={getDashboardLink()}
              className="cta-btn"
              style={{
                background: "linear-gradient(to right, #10b981, #059669)",
                color: "white",
                boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)"
              }}
              onMouseEnter={(e) => e.target.style.boxShadow = "0 6px 25px rgba(16, 185, 129, 0.4)"}
              onMouseLeave={(e) => e.target.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.3)"}
            >
              {getDashboardText()}
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="cta-btn"
                style={{
                  background: "linear-gradient(to right, #10b981, #059669)",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)"
                }}
                onMouseEnter={(e) => e.target.style.boxShadow = "0 6px 25px rgba(16, 185, 129, 0.4)"}
                onMouseLeave={(e) => e.target.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.3)"}
              >
                Sign Up Free
              </Link>
              <Link
                to="/login"
                className="cta-btn"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "2px solid rgba(255,255,255,0.3)",
                  backdropFilter: "blur(10px)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.15)";
                  e.target.style.borderColor = "#10b981";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.1)";
                  e.target.style.borderColor = "rgba(255,255,255,0.3)";
                }}
              >
                Login
              </Link>
            </>
          )}
          
          <Link
            to="/services"
            className="cta-btn"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(10px)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.15)";
              e.target.style.borderColor = "#10b981";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
              e.target.style.borderColor = "rgba(255,255,255,0.3)";
            }}
          >
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;