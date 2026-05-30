"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function handleExchange() {
      try {
        const code = searchParams.get("code");
        if (code) {
          console.log("Exchanging authorization code for session...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // If no code, check if we already have an active session
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error("No password reset code or active session detected. Please check your recovery link or request a new one.");
          }
        }
      } catch (err: any) {
        console.error("Exchange error:", err);
        setMessage({
          text: err.message || "Failed to initialize secure reset session. Please request a new recovery link.",
          type: "error",
        });
      } finally {
        setSessionChecking(false);
      }
    }

    handleExchange();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters long.", type: "error" });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setMessage({ text: "Password updated successfully!", type: "success" });
      
      // Redirect to /account with the sign-in tab active
      setTimeout(() => {
        router.push("/account?tab=login");
      }, 2000);
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to reset password. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sessionChecking) {
    return (
      <div className="account-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ fontWeight: 500 }}>Verifying recovery credentials...</p>
      </div>
    );
  }

  return (
    <div className="account-page" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "1.5rem" }}>
      <div className="account-container" style={{ width: "100%", maxWidth: "420px" }}>
        <div className="auth-card" style={{ padding: "2.5rem 2rem", borderRadius: "16px", background: "var(--background-card, #fff)", border: "1px solid var(--border)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800 }}>New Password</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: "0.5rem" }}>
              Set a strong, new password for your account.
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

          {(!message || message.type !== "error" || password !== "") && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>New Password</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Lock size={16} style={{ position: "absolute", left: "1rem", color: "var(--muted)" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: "0.75rem 2.5rem 0.75rem 2.5rem", width: "100%", borderRadius: "10px", border: "1px solid var(--border)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "1rem",
                      background: "none",
                      border: "none",
                      color: "var(--muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Confirm Password</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Lock size={16} style={{ position: "absolute", left: "1rem", color: "var(--muted)" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ padding: "0.75rem 2.5rem 0.75rem 2.5rem", width: "100%", borderRadius: "10px", border: "1px solid var(--border)" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
                disabled={loading}
              >
                {loading ? "Updating password..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="account-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p>Loading reset portal...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
