const Service = require("../models/Service");

exports.createService = async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== "admin") {
      return res.status(403).send("Admin access required");
    }

    const { name, description, type, basePrice, priceUnit, duration, requirements } = req.body;
    
    if (!name || !type || !basePrice) {
      return res.status(400).send("Name, type, and basePrice are required");
    }

    const service = new Service({ 
      name, 
      description, 
      type, 
      basePrice, 
      priceUnit: priceUnit || "acre",
      duration,
      requirements,
      isActive: true 
    });
    
    await service.save();
    
    res.status(201).json({ 
      message: "Service created successfully", 
      service 
    });
  } catch (error) {
    res.status(500).send("Error creating service: " + error.message);
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (error) {
    res.status(500).send("Error fetching services: " + error.message);
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).send("Service not found");
    res.json(service);
  } catch (error) {
    res.status(500).send("Error fetching service: " + error.message);
  }
};

exports.updateService = async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== "admin") {
      return res.status(403).send("Admin access required");
    }

    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).send("Service not found");

    Object.assign(service, req.body);
    await service.save();
    
    res.json({ 
      message: "Service updated successfully", 
      service 
    });
  } catch (error) {
    res.status(500).send("Error updating service: " + error.message);
  }
};

exports.deleteService = async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== "admin") {
      return res.status(403).send("Admin access required");
    }

    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).send("Service not found");
    
    res.json({ 
      message: "Service deleted successfully" 
    });
  } catch (error) {
    res.status(500).send("Error deleting service: " + error.message);
  }
};