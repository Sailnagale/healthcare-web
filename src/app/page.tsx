// src/app/page.tsx
import React from "react";
import Link from "next/link";
import "./home.css"; // Import the new CSS file

// Type for the card data
interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
}

const services: ServiceCardProps[] = [
  {
    title: "Talk to Our Chatbot",
    description:
      "Get instant answers to your health questions from our dual-engine AI assistant (Gemini/OpenAI).",
    icon: "💬",
    href: "/chatbot",
  },
  {
    title: "Book an Appointment",
    description:
      "Schedule your next consultation with our specialists quickly and easily.",
    icon: "📅",
    href: "/appointment",
  },
  {
    title: "Check Your X-Ray",
    description:
      "Upload your diagnostic images for quick AI-powered initial review and insights.",
    icon: "レントゲン", // X-ray/Radiography symbol
    href: "/diagnosis",
  },
  {
    title: "My Digital Twin",
    description:
      "Visualize and monitor your personalized health model to predict potential risks and outcomes.",
    icon: "🧬", // DNA/Genetics symbol
    href: "/twin", // Links to your existing 'twin' folder
  },
  {
    title: "Medicine Checker",
    description:
      "Verify drug information, check dosages, and look up potential interactions.",
    icon: "💊", // Pill/Medicine symbol
    href: "/medicine-checker", // Links to a new medicine checker folder
  },
];

// Reusable Card Component
const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  href,
}) => (
  <Link href={href} className="service-card-link">
    <div className="service-card">
      <div className="service-icon">{icon}</div>
      <h2 className="service-title">{title}</h2>
      <p className="service-description">{description}</p>
      <div className="service-cta">Go &rarr;</div>
    </div>
  </Link>
);

const HomePage: React.FC = () => {
  return (
    <div className="home-page-container">
      <header className="home-header">
        <h1>Your Health Portal</h1>
        <p>A seamless, AI-powered healthcare experience.</p>
      </header>

      <main className="services-grid">
        {services.map((service, index) => (
          <ServiceCard key={index} {...service} />
        ))}
      </main>

      <footer className="home-footer">
        <p>
          &copy; {new Date().getFullYear()} AI Health Solutions. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
