// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google"; // Make sure this import is present
import Link from "next/link";

// Define the font variable 'inter' here (outside the component function)
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Health Companion",
  description: "AI-powered healthcare application with Digital Twin simulation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 'inter' is now correctly defined and accessible */}
      <body className={inter.className}>
        <header className="site-header">
          <nav className="navbar">
            <div className="logo">
              <Link href="/">
                <span className="logo-text">HEALTH CARE AI</span>
              </Link>
            </div>
            <div className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/chatbot">Chatbot</Link>
              <Link href="/appointment">Book Appointment</Link>
              <Link href="/twin">Digital Twin</Link>
            </div>
          </nav>
        </header>
        <main className="main-content">{children}</main>
        <footer className="site-footer">
          &copy; {new Date().getFullYear()} AI Health Companion
        </footer>
      </body>
    </html>
  );
}
