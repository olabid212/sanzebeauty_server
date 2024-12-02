const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: [true, "Service is required"], // Ensure the service is provided
    },
    date: {
      type: Date,
      required: [true, "Date is required"], // Ensure the appointment date is provided
    },
    time: {
      type: String,
      required: [true, "Time is required"], // Ensure the appointment time is provided
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"], // Ensure the guest's name is provided
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"], // Ensure the guest's email is provided
      match: [/.+@.+\..+/, "Please provide a valid email"], // Validate email format
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"], // Ensure the guest's phone number is provided
      match: [/^\d{10,15}$/, "Please provide a valid phone number"], // Validate phone format
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
