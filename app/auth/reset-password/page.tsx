"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { KeyRound, AlertTriangle, CheckCircle, ArrowLeft, ArrowRight, Lock } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Supabase will automatically consume the access_token from the URL hash
    // and establish a session. We wait a tiny bit to let Supabase client process the hash.
    const checkSession = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      } else {
        setError("Invalid or expired password reset link. Please request a new recovery email.");
      }
      setCheckingSession(false);
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "#0a0f1e", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          <Lock className="animate-pulse" size={20} style={{ color: "var(--green)" }} />
          <span>Verifying Reset Link...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "#0a0f1e", color: "#fff", padding: "1rem" }}>
      <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2.5rem", width: "100%", maxWidth: "420px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#00c07f", marginRight: "8px", verticalAlign: "middle" }}></span>
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", fontWeight: 800 }}>Reset Password</span>
          <p style={{ fontSize: "0.85rem", color: "#8a8f9e", marginTop: "0.5rem" }}>Set a new password for your admin account</p>
        </div>

        {error && !hasSession ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ color: "#ef4444", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.1)", padding: "0.8rem", borderRadius: "8px", lineHeight: "1.5", display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => router.push("/admin")}
              className="btn"
              style={{ width: "100%", justifyContent: "center", background: "transparent", border: "2px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", padding: "0.75rem", borderRadius: "30px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#8a8f9e", fontWeight: 700 }}>New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{ padding: "0.8rem 1rem", background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", outline: "none", width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#8a8f9e", fontWeight: 700 }}>Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={{ padding: "0.8rem 1rem", background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", outline: "none", width: "100%" }}
              />
            </div>

            {error && (
              <div style={{ color: "#ef4444", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.1)", padding: "0.6rem", borderRadius: "6px", display: "flex", gap: "6px", alignItems: "center" }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={{ color: "#00c07f", fontSize: "0.85rem", background: "rgba(0, 192, 127, 0.1)", padding: "0.6rem", borderRadius: "6px", display: "flex", gap: "6px", alignItems: "center" }}>
                <CheckCircle size={16} />
                <span>Password reset successful! Redirecting to dashboard...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              style={{ padding: "0.9rem", background: "#00c07f", color: "#0a0f1e", border: "none", borderRadius: "30px", fontWeight: 700, cursor: "pointer", transition: "0.2s", display: "flex", justifyContent: "center", alignItems: "center", width: "100%", gap: "6px" }}
            >
              {loading ? "Updating password..." : <><KeyRound size={16} /> Reset Password <ArrowRight size={16} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "#0a0f1e", color: "#fff" }}>
        <div>Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
