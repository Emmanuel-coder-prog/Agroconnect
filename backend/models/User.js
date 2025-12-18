const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["farmer", "provider", "admin"],
      default: "farmer",
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    
    // Farmer-specific fields
    farmSize: String,
    cropType: String,
    
    // Provider-specific fields
    serviceType: {
      type: String,
      enum: ["drone", "tractor", "both", null],
      default: null
    },
    
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);