
// src/app/layout.tsx

import "./globals.css"
// 1. IMPORT
import { Inter } from "next/font/google"; 
import Link from "next/link";

// 2. DEFINE THE FONT VARIABLE
// This must be a constant defined at the module level (outside the function)
const inter = Inter({ subsets: ["latin"] }); 

export const metadata = {
  // ...
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ... rest of your layout */}
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
              {/* ⭐⭐⭐ ADDED PNEUMONIA DIAGNOSIS LINK ⭐⭐⭐ */}
              <Link href="/diagnosis">Pneumonia AI</Link>
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