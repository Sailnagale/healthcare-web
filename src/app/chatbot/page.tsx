// src/app/page.tsx (Updated feature list)

export default function HomePage() {
  return (
    <div className="page-container">
      <h1>Welcome to Your AI Health Companion</h1>
      <p className="description">
        Leverage AI for better health management and seamless patient services.
      </p>

      <h2>Key Features Overview</h2>
      <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
        <li>
          **AI Symptom Checker (Chatbot):** Get pre-diagnosis insights based on
          your symptoms.
        </li>
        {/* UPDATED LIST ITEM HERE */}
        <li>
          **Appointment System:** Easily book, view, and manage your patient
          appointments.
        </li>
        <li>
          **AI for Radiology:** Upload scans for preliminary anomaly detection
          (Hackathon Lite).
        </li>
        <li>
          **Digital Twin for Health:** Visualize the long-term impact of your
          lifestyle choices on your future health.
        </li>
      </ul>

      <p style={{ marginTop: "20px", fontWeight: "bold" }}>
        Use the navigation bar above to explore the different tools.
      </p>
    </div>
  );
}
