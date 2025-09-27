// src/app/appointment/page.tsx
"use client";

import React, { useState } from "react";
// In a real app, you would install and import a date picker like 'react-datepicker' here
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// Mock Data for Doctor and Time Slots
const mockDoctors = [
  { id: 1, name: "Dr. Jane Smith", specialty: "Cardiology" },
  { id: 2, name: "Dr. John Doe", specialty: "General Practice" },
  { id: 3, name: "Dr. Alice Brown", specialty: "Radiology" },
];

const mockTimeSlots = ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"];

export default function AppointmentPage() {
  const [formData, setFormData] = useState({
    patientName: "",
    doctor: "",
    date: "", // Will hold a date object or string
    timeSlot: "",
    reason: "",
  });
  const [isBooked, setIsBooked] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // **API Integration Point:**
    // In a real application, you would make an API POST request here
    // to your backend to validate and persist the booking.
    // e.g., mutation.mutate(formData);

    console.log("Attempting to book appointment with:", formData);

    // Simulate successful API response
    setTimeout(() => {
      setIsBooked(true);
      // Clear form after successful booking
      setFormData({
        patientName: "",
        doctor: "",
        date: "",
        timeSlot: "",
        reason: "",
      });
    }, 1500);
  };

  if (isBooked) {
    return (
      <div className="page-container" style={{ textAlign: "center" }}>
        <h2>✅ Appointment Confirmed!</h2>
        <p>Your appointment has been successfully booked.</p>
        <p>You will receive a confirmation email shortly.</p>
        <button
          onClick={() => setIsBooked(false)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "20px",
            cursor: "pointer",
          }}
        >
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Book a New Appointment</h1>
      <p>Select your preferred doctor, date, and time slot.</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "20px", marginTop: "20px" }}
      >
        {/* Patient Name */}
        <label>Patient Name:</label>
        <input
          type="text"
          name="patientName"
          value={formData.patientName}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />

        {/* Doctor Selection */}
        <label>Select Doctor:</label>
        <select
          name="doctor"
          value={formData.doctor}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <option value="">-- Choose Doctor --</option>
          {mockDoctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name} - ({doc.specialty})
            </option>
          ))}
        </select>

        {/* Date Selection - Placeholder */}
        <label>Appointment Date:</label>
        {/* In a real app, replace this text input with a <DatePicker> component */}
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />

        {/* Time Slot Selection */}
        <label>Available Time Slot:</label>
        <select
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <option value="">-- Choose Time Slot --</option>
          {/* In a real app, these slots would be dynamically fetched based on the selected doctor and date */}
          {mockTimeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>

        {/* Reason for Visit */}
        <label>Reason for Visit:</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows={3}
          required
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            resize: "vertical",
          }}
        />

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            padding: "15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1.1rem",
            marginTop: "10px",
          }}
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
}
