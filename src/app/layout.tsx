// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";

// 🛑 THIS LINE MUST BE HERE AND OUTSIDE THE FUNCTION 🛑
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
      {/* The variable 'inter' is now correctly used here */}
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
             
              <Link href="/diagnosis">AI Diagnosis</Link>
              <Link href="/twin">Digital Twin</Link>
              <Link href="/mediguard">MediGuard</Link>
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
