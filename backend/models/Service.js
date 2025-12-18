const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["drone", "tractor"],
      required: true
    },
    basePrice: { type: Number, required: true },
    priceUnit: {
      type: String,
      enum: ["acre", "hour", "fixed"],
      default: "acre"
    },
    duration: String, // e.g., "2-3 hours per 10 acres"
    requirements: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);