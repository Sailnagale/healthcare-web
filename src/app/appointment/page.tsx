"use client";

import React, { useState } from "react";
import "./page.css";

// Mock Data for Doctors and Time Slots
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
    date: "",
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
    console.log("Booking appointment:", formData);

    setTimeout(() => {
      setIsBooked(true);
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
      <div className="appointment-page booked">
        <div className="confirmation-card">
          <h2>✅ Appointment Confirmed!</h2>
          <p>Your appointment has been successfully booked.</p>
          <p>You will receive a confirmation email shortly.</p>
          <button onClick={() => setIsBooked(false)}>Book Another Appointment</button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-page">
      <div className="appointment-card">
        <h1>Book a New Appointment</h1>
        <p>Select your preferred doctor, date, and time slot.</p>

        <form onSubmit={handleSubmit} className="appointment-form">
          <label>Patient Name:</label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
          />

          <label>Select Doctor:</label>
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            required
          >
            <option value="">-- Choose Doctor --</option>
            {mockDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} - ({doc.specialty})
              </option>
            ))}
          </select>

          <label>Appointment Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <label>Available Time Slot:</label>
          <select
            name="timeSlot"
            value={formData.timeSlot}
            onChange={handleChange}
            required
          >
            <option value="">-- Choose Time Slot --</option>
            {mockTimeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>

          <label>Reason for Visit:</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={3}
            required
          />

          <button type="submit">Confirm Booking</button>
        </form>
      </div>
    </div>
  );
}
