"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically sign out any session established by the verification link redirect
    // to force the user to log in manually.
    supabase.auth.signOut().catch((err) => {
      console.error("Error signing out on verify load:", err);
    });
  }, []);

  const handleSignInClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out on click:", err);
    }
    router.push("/account");
  };

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
          
          <a 
            href="/account" 
            onClick={handleSignInClick}
            className="btn btn-primary" 
            style={{ width: "100%", justifyContent: "center", marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
          >
            Go to Sign In <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
