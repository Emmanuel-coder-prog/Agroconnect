const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Enhanced farm details
    farmDetails: {
      size: { type: Number, required: true },
      unit: { type: String, enum: ["acre", "hectare"], default: "acre" },
      location: { type: String, required: true },
      cropType: String,
      specialInstructions: String
    },
    
    // Service details
    serviceType: {
      type: String,
      enum: ["drone", "tractor"],
      required: true
    },
    
    // Schedule
    scheduledDate: { type: Date },
    scheduledTime: String,
    
    // Status with AgroConnect workflow
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "rejected", "cancelled"],
      default: "pending"
    },
    
    // Pricing
    estimatedCost: Number,
    finalCost: Number,
    
    // Timestamps for tracking
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
    
    // Notes
    farmerNotes: String,
    providerNotes: String,
    adminNotes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);