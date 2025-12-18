const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Service = require("./models/Service");
const Request = require("./models/Request");

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database for seeding");

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Request.deleteMany({});
    
    console.log("🗑️ Cleared existing data");

    // Create users
    const salt = await bcrypt.genSalt(10);
    
    // Create admin
    const adminPassword = await bcrypt.hash("admin123", salt);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@agroconnect.com",
      password: adminPassword,
      role: "admin",
      phone: "+1234567890",
      address: {
        street: "123 Admin St",
        city: "Admin City",
        state: "AC",
        zipCode: "12345"
      }
    });

    // Create farmers
    const farmer1Password = await bcrypt.hash("farmer123", salt);
    const farmer1 = await User.create({
      name: "John Farmer",
      email: "john@farm.com",
      password: farmer1Password,
      role: "farmer",
      phone: "+1234567891",
      address: {
        street: "456 Farm Road",
        city: "AgriCity",
        state: "FC",
        zipCode: "54321"
      },
      farmSize: "50 acres",
      cropType: "Corn"
    });

    const farmer2Password = await bcrypt.hash("farmer456", salt);
    const farmer2 = await User.create({
      name: "Sarah Farmer",
      email: "sarah@farm.com",
      password: farmer2Password,
      role: "farmer",
      phone: "+1234567892",
      address: {
        street: "789 Ranch Lane",
        city: "Farmville",
        state: "FV",
        zipCode: "67890"
      },
      farmSize: "30 acres",
      cropType: "Wheat"
    });

    // Create providers
    const provider1Password = await bcrypt.hash("provider123", salt);
    const provider1 = await User.create({
      name: "Drone Masters Inc",
      email: "drone@service.com",
      password: provider1Password,
      role: "provider",
      phone: "+1234567893",
      address: {
        street: "101 Tech Park",
        city: "Innovation City",
        state: "IC",
        zipCode: "10101"
      },
      serviceType: "drone"
    });

    const provider2Password = await bcrypt.hash("provider456", salt);
    const provider2 = await User.create({
      name: "Tractor Services Co",
      email: "tractor@service.com",
      password: provider2Password,
      role: "provider",
      phone: "+1234567894",
      address: {
        street: "202 Equipment Rd",
        city: "Machinery Town",
        state: "MT",
        zipCode: "20202"
      },
      serviceType: "tractor"
    });

    // Create services
    const services = await Service.create([
      {
        name: "Drone Crop Spraying",
        type: "drone",
        description: "Precision crop spraying using advanced drone technology. Covers up to 50 acres per day.",
        basePrice: 25,
        priceUnit: "acre",
        duration: "2-3 hours per 10 acres",
        requirements: ["Clear weather conditions", "Access to water source", "No flight restrictions"],
        isActive: true
      },
      {
        name: "Tractor Plowing Service",
        type: "tractor",
        description: "Professional land preparation and plowing services for large farm areas.",
        basePrice: 50,
        priceUnit: "acre",
        duration: "4-6 hours per 10 acres",
        requirements: ["Clear field access", "No major obstacles", "Minimum 5 acres"],
        isActive: true
      },
      {
        name: "Drone Crop Monitoring",
        type: "drone",
        description: "Aerial crop health monitoring and analysis with detailed reports.",
        basePrice: 15,
        priceUnit: "acre",
        duration: "1-2 hours per 20 acres",
        requirements: ["Clear weather", "GPS coordinates", "Field boundaries"],
        isActive: true
      },
      {
        name: "Tractor Harvesting",
        type: "tractor",
        description: "Efficient harvesting service for various crops with modern equipment.",
        basePrice: 75,
        priceUnit: "acre",
        duration: "6-8 hours per 10 acres",
        requirements: ["Mature crops", "Clear access paths", "Storage arrangements"],
        isActive: true
      }
    ]);

    // Create sample requests
    const requests = await Request.create([
      {
        farmer: farmer1._id,
        service: services[0]._id,
        serviceType: "drone",
        farmDetails: {
          size: 20,
          unit: "acre",
          location: "456 Farm Road, AgriCity",
          cropType: "Corn",
          specialInstructions: "Avoid spraying near the pond"
        },
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        scheduledTime: "10:00 AM",
        status: "pending",
        estimatedCost: 20 * 25, // size * basePrice
        farmerNotes: "Need this done before the rain season"
      },
      {
        farmer: farmer2._id,
        service: services[1]._id,
        serviceType: "tractor",
        farmDetails: {
          size: 15,
          unit: "acre",
          location: "789 Ranch Lane, Farmville",
          cropType: "Wheat",
          specialInstructions: "Gentle slope area, be careful"
        },
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        scheduledTime: "2:00 PM",
        status: "accepted",
        provider: provider2._id,
        estimatedCost: 15 * 50,
        acceptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        farmerNotes: "Preparing for winter planting"
      },
      {
        farmer: farmer1._id,
        service: services[2]._id,
        serviceType: "drone",
        farmDetails: {
          size: 25,
          unit: "acre",
          location: "456 Farm Road, AgriCity",
          cropType: "Corn",
          specialInstructions: "Focus on the northern section"
        },
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        scheduledTime: "9:00 AM",
        status: "in_progress",
        provider: provider1._id,
        estimatedCost: 25 * 15,
        acceptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        farmerNotes: "Checking for pest damage"
      }
    ]);

    console.log("✅ Database seeded successfully!");
    console.log(`👥 Created ${await User.countDocuments()} users`);
    console.log(`🛠️ Created ${await Service.countDocuments()} services`);
    console.log(`📋 Created ${await Request.countDocuments()} requests`);
    
    console.log("\n🔑 Login Credentials:");
    console.log("Admin: admin@agroconnect.com / admin123");
    console.log("Farmer 1: john@farm.com / farmer123");
    console.log("Farmer 2: sarah@farm.com / farmer456");
    console.log("Drone Provider: drone@service.com / provider123");
    console.log("Tractor Provider: tractor@service.com / provider456");
    
    console.log("\n🌐 API Base URL: http://localhost:4000");
    console.log("🩺 Health Check: http://localhost:4000/api/health");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();