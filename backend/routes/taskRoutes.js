const express = require("express");
const route = express.Router();
const userController = require("../controllers/userControllers");
const auth = require("../middleware/authMiddleware");
const serviceCtrl = require("../controllers/serviceControllers");
const requestCtrl = require("../controllers/requestControllers");

// USER ROUTES (Public)
route.post("/api/auth/register", userController.createUser);
route.post("/api/auth/login", userController.login);

// USER ROUTES (Protected)
route.get("/api/users", auth, userController.getUsers);
route.get("/api/users/:id", auth, userController.getUserById);
route.put("/api/users/:id", auth, userController.updateUsers);
route.delete("/api/users/:id", auth, userController.deleteUser);

// SERVICE ROUTES
route.get("/api/services", serviceCtrl.getServices); // Public
route.get("/api/services/:id", serviceCtrl.getServiceById); // Public
route.post("/api/services", auth, serviceCtrl.createService); // Admin only
route.put("/api/services/:id", auth, serviceCtrl.updateService); // Admin only
route.delete("/api/services/:id", auth, serviceCtrl.deleteService); // Admin only

// REQUEST ROUTES
route.post("/api/requests", auth, requestCtrl.createRequest); // Farmer creates
route.get("/api/requests", auth, requestCtrl.getRequests); // Get user's requests
route.get("/api/requests/available", auth, requestCtrl.getAvailableRequests); // For providers
route.post("/api/requests/:id/accept", auth, requestCtrl.acceptRequest); // Provider accepts
route.put("/api/requests/:id/status", auth, requestCtrl.updateRequestStatus); // Provider updates status
route.put("/api/requests/:id", auth, requestCtrl.updateRequest); // Update request details
route.get("/api/requests/:id", auth, requestCtrl.getRequestById); // Get specific request
route.delete("/api/requests/:id", auth, requestCtrl.deleteRequest); // Farmer or admin deletes

// ADMIN DASHBOARD ROUTES
route.get("/api/admin/stats", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send("Admin access required");
    }
    
    const User = require("../models/User");
    const Request = require("../models/Request");
    
    const [
      totalUsers,
      totalFarmers,
      totalProviders,
      totalRequests,
      pendingRequests,
      completedRequests
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "provider" }),
      Request.countDocuments(),
      Request.countDocuments({ status: "pending" }),
      Request.countDocuments({ status: "completed" })
    ]);
    
    res.json({
      totalUsers,
      totalFarmers,
      totalProviders,
      totalRequests,
      pendingRequests,
      completedRequests
    });
  } catch (error) {
    res.status(500).send("Error fetching stats: " + error.message);
  }
});

// Health check
route.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

module.exports = route;