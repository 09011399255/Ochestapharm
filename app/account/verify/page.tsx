"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="account-page" style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="account-container" style={{ maxWidth: "450px", width: "100%" }}>
        <div className="auth-card" style={{ textAlign: "center", padding: "3rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          <div 
            style={{ 
              width: "72px", 
              height: "72px", 
              borderRadius: "50%", 
              background: "rgba(0, 192, 127, 0.1)", 
              color: "var(--green)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}
          >
            <CheckCircle size={40} />
          </div>
          
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--ink)" }}>
            Email verified!
          </h2>
          
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Your account has been successfully verified. You can now sign in.
          </p>
          
          <Link 
            href="/account" 
            className="btn btn-primary" 
            style={{ width: "100%", justifyContent: "center", marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            Go to Sign In <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
