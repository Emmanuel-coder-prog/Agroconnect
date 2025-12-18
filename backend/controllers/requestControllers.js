const Request = require("../models/Request");
const Service = require("../models/Service");
const User = require("../models/User");

// Farmer creates a new request
exports.createRequest = async (req, res) => {
  try {
    const { serviceId, farmDetails, scheduledDate, scheduledTime, farmerNotes } = req.body;

    if (!serviceId) return res.status(400).send("serviceId is required");
    if (!farmDetails || !farmDetails.size || !farmDetails.location) {
      return res.status(400).send("Farm details (size and location) are required");
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).send("Service not found");

    // Calculate estimated cost
    const estimatedCost = service.basePrice * farmDetails.size;

    const request = new Request({
      farmer: req.user.id,
      service: serviceId,
      serviceType: service.type,
      farmDetails,
      scheduledDate,
      scheduledTime,
      farmerNotes,
      estimatedCost,
      status: "pending"
    });

    await request.save();
    
    // Populate for response
    await request.populate('service');
    await request.populate('farmer', 'name email phone');
    
    res.status(201).json({ 
      message: "Service request created successfully", 
      request 
    });
  } catch (error) {
    res.status(500).send("Error creating request: " + error.message);
  }
};

// Get requests based on user role
exports.getRequests = async (req, res) => {
  try {
    let filter = {};
    const userRole = req.user.role;

    if (userRole === "farmer") {
      filter = { farmer: req.user.id };
    } else if (userRole === "provider") {
      filter = { 
        provider: req.user.id,
        status: { $in: ["accepted", "in_progress"] }
      };
    } else if (userRole === "admin") {
      // Admin sees all
    } else {
      return res.status(403).send("Unauthorized role");
    }

    const requests = await Request.find(filter)
      .populate("service")
      .populate("farmer", "name email phone")
      .populate("provider", "name email phone serviceType")
      .sort("-createdAt");

    res.json(requests);
  } catch (error) {
    res.status(500).send("Error fetching requests: " + error.message);
  }
};

// Get available requests for providers
exports.getAvailableRequests = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).send("Only providers can view available requests");
    }

    // Get provider's service type
    const provider = await User.findById(req.user.id);
    const providerServiceType = provider.serviceType;

    let serviceTypeFilter = {};
    if (providerServiceType === "both") {
      serviceTypeFilter = { serviceType: { $in: ["drone", "tractor"] } };
    } else if (providerServiceType) {
      serviceTypeFilter = { serviceType: providerServiceType };
    }

    const availableRequests = await Request.find({
      status: "pending",
      ...serviceTypeFilter
    })
      .populate("service")
      .populate("farmer", "name email phone address")
      .sort("-createdAt");

    res.json(availableRequests);
  } catch (error) {
    res.status(500).send("Error fetching available requests: " + error.message);
  }
};

// Provider accepts a request
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await Request.findById(id);
    if (!request) return res.status(404).send("Request not found");
    
    if (request.status !== "pending") {
      return res.status(400).send("Request is no longer available");
    }

    // Check if provider can handle this service type
    const provider = await User.findById(req.user.id);
    if (provider.serviceType !== "both" && provider.serviceType !== request.serviceType) {
      return res.status(400).send("You cannot accept this type of service");
    }

    request.provider = req.user.id;
    request.status = "accepted";
    request.acceptedAt = new Date();
    
    await request.save();
    
    await request.populate("service");
    await request.populate("farmer", "name email phone");
    await request.populate("provider", "name email phone");

    res.json({ 
      message: "Request accepted successfully", 
      request 
    });
  } catch (error) {
    res.status(500).send("Error accepting request: " + error.message);
  }
};

// Update request status (for providers)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, providerNotes, finalCost } = req.body;
    
    const request = await Request.findById(id);
    if (!request) return res.status(404).send("Request not found");
    
    // Verify provider owns this request
    if (!request.provider || request.provider.toString() !== req.user.id) {
      return res.status(403).send("Not authorized to update this request");
    }

    const allowedStatuses = ["accepted", "in_progress", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).send("Invalid status transition");
    }

    // Update status with timestamps
    request.status = status;
    if (providerNotes) request.providerNotes = providerNotes;
    if (finalCost) request.finalCost = finalCost;
    
    if (status === "in_progress" && !request.startedAt) {
      request.startedAt = new Date();
    } else if (status === "completed" && !request.completedAt) {
      request.completedAt = new Date();
      if (!request.finalCost) {
        request.finalCost = request.estimatedCost;
      }
    }

    await request.save();
    
    await request.populate("service");
    await request.populate("farmer", "name email phone");
    await request.populate("provider", "name email phone");

    res.json({ 
      message: `Request status updated to ${status}`, 
      request 
    });
  } catch (error) {
    res.status(500).send("Error updating request: " + error.message);
  }
};

// Get request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("service")
      .populate("farmer", "name email phone address")
      .populate("provider", "name email phone serviceType");
    
    if (!request) return res.status(404).send("Request not found");
    
    // Check authorization
    if (req.user.role === "farmer" && request.farmer._id.toString() !== req.user.id) {
      return res.status(403).send("Not authorized");
    }
    if (req.user.role === "provider" && request.provider && request.provider._id.toString() !== req.user.id) {
      return res.status(403).send("Not authorized");
    }

    res.json(request);
  } catch (error) {
    res.status(500).send("Error fetching request: " + error.message);
  }
};

// Update request (for all fields)
exports.updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).send("Request not found");

    // Authorization checks
    if (req.user.role === "farmer" && request.farmer.toString() !== req.user.id) {
      return res.status(403).send("Not authorized");
    }
    
    if (req.user.role === "provider") {
      // Providers can only update status and providerNotes
      const { status, providerNotes } = req.body;
      if (status) request.status = status;
      if (providerNotes) request.providerNotes = providerNotes;
    } else {
      // Farmers and admins can update more fields
      const allowedUpdates = ["farmDetails", "scheduledDate", "scheduledTime", "farmerNotes", "status"];
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          request[key] = req.body[key];
        }
      });
    }

    await request.save();
    
    await request.populate("service");
    await request.populate("farmer", "name email phone");
    if (request.provider) {
      await request.populate("provider", "name email phone");
    }
    
    res.json({ 
      message: "Request updated successfully", 
      request 
    });
  } catch (error) {
    res.status(500).send("Error updating request: " + error.message);
  }
};

// Delete request (farmer or admin only)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).send("Request not found");
    
    // Check authorization
    if (req.user.role === "farmer" && request.farmer.toString() !== req.user.id) {
      return res.status(403).send("Not authorized");
    }
    if (req.user.role === "provider") {
      return res.status(403).send("Providers cannot delete requests");
    }

    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).send("Error deleting request: " + error.message);
  }
};