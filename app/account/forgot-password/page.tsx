"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Mail, CheckCircle, AlertTriangle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://ochestapharm.vercel.app/account/reset-password",
      });

      if (error) throw error;

      setMessage({
        text: "Reset link sent! Check your email.",
        type: "success",
      });
      setEmail("");
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to send reset link. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "1.5rem" }}>
      <div className="account-container" style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/account" className="back-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "var(--muted)", fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>

        <div className="auth-card" style={{ padding: "2.5rem 2rem", borderRadius: "16px", background: "var(--background-card, #fff)", border: "1px solid var(--border)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800 }}>Forgot Password</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: "0.5rem" }}>
              Enter your email address to receive a password recovery link.
            </p>
          </div>

          {message && (
            <div
              className={`form-message ${message.type}`}
              style={{
                padding: "0.85rem",
                borderRadius: "10px",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
                background: message.type === "success" ? "rgba(0,192,127,0.1)" : "rgba(239,68,68,0.1)",
                color: message.type === "success" ? "var(--green-dark)" : "var(--danger)",
                border: `1px solid ${message.type === "success" ? "rgba(0,192,127,0.2)" : "rgba(239,68,68,0.2)"}`,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {message.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Email Address</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Mail size={16} style={{ position: "absolute", left: "1rem", color: "var(--muted)" }} />
                <input
                  type="email"
                  placeholder="john@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ padding: "0.75rem 1rem 0.75rem 2.5rem", width: "100%", borderRadius: "10px", border: "1px solid var(--border)" }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
              disabled={loading}
            >
              {loading ? "Sending link..." : "Send Recovery Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
