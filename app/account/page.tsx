"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  ShoppingBag,
  LogOut,
  Clock,
  MapPin,
  CheckCircle,
  Truck,
  FileText,
  Eye,
  EyeOff,
  KeyRound
} from "lucide-react";

function AccountPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "login" || tabParam === "signup") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // States
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    let active = true;
    let subscription: any = null;

    // Timeout guard: force loading state to false after 1000ms if it gets stuck
    const loadingTimeout = setTimeout(() => {
      if (active) {
        console.warn("AccountPage: Session loading timed out. Forcing loading to false.");
        setLoading(false);
      }
    }, 1000);

    async function initSession() {
      try {
        console.log("AccountPage: Fetching session...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("AccountPage: Session response received:", session ? "Active session found" : "No active session");
        if (active) {
          setSession(session);
          if (session) {
            loadUserOrders(session.user.email);
          }
        }
      } catch (err) {
        console.error("AccountPage: Failed to retrieve session:", err);
      } finally {
        if (active) {
          setLoading(false);
          clearTimeout(loadingTimeout);
        }
      }
    }

    try {
      initSession();

      const authChangeResult = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("AccountPage: Auth state change event:", _event, session ? "Session active" : "Session null");
        if (active) {
          setSession(session);
          setLoading(false);
          clearTimeout(loadingTimeout);
          if (session) {
            loadUserOrders(session.user.email);
          } else {
            setOrders([]);
          }
        }
      });

      if (authChangeResult && authChangeResult.data) {
        subscription = authChangeResult.data.subscription;
      }
    } catch (e) {
      console.error("AccountPage: Error setting up auth state listener:", e);
      if (active) {
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    }

    return () => {
      active = false;
      clearTimeout(loadingTimeout);
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (unsubErr) {
          console.error("AccountPage: Error unsubscribing:", unsubErr);
        }
      }
    };
  }, []);

  const loadUserOrders = async (userEmail: string | undefined) => {
    if (!userEmail) return;
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedOrders = (data || []).map((o: any) => {
        if (o.items && !Array.isArray(o.items) && o.items.cart) {
          const itemsData = o.items;
          return {
            ...o,
            items: itemsData.cart,
            customer_email: itemsData.customer_email || o.customer_email || "",
            delivery_address: itemsData.delivery_address || o.delivery_address || "",
            delivery_city: itemsData.delivery_city || o.delivery_city || "",
            prescription_url: itemsData.prescription_url || o.prescription_url || "",
            subtotal: itemsData.subtotal || o.subtotal || 0,
            delivery_fee: itemsData.delivery_fee || o.delivery_fee || 0,
            total: itemsData.total || o.total || o.total_amount || 0,
            payment_method: itemsData.payment_method || o.payment_method || "transfer",
          };
        }
        return {
          ...o,
          total: o.total || o.total_amount || 0,
        };
      }).filter((o: any) => o.customer_email?.toLowerCase() === userEmail.toLowerCase());

      setOrders(formattedOrders);
    } catch (err) {
      console.error("Error loading user orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage(null);

    try {
      if (activeTab === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setFormMessage({ text: "Login successful!", type: "success" });
        router.push("/");
      } else {
        if (!firstName || !lastName || !phone) {
          throw new Error("Please fill out all fields.");
        }
        const redirectUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/account/verify`
          : '';
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              firstName,
              lastName,
              phone,
            },
          },
        });
        if (error) throw error;

        setSubmittedEmail(email);
        setSignupSuccess(true);

        // Clear all fields completely
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setPhone("");
      }
    } catch (err: any) {
      setFormMessage({ text: err.message, type: "error" });
    } finally {
      setFormLoading(false);
    }
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="account-page" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p>Loading account portal...</p>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/" className="back-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        {!session ? (
          <div className="auth-card">
            {signupSuccess ? (
              <div
                className="success-card"
                style={{
                  textAlign: "center",
                  padding: "2.5rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1.25rem"
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "rgba(0, 192, 127, 0.1)",
                    color: "var(--green)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <CheckCircle size={36} />
                </div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.25rem", fontWeight: 800 }}>Account created!</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.6, maxWidth: "320px" }}>
                  We sent a verification link to <strong>{submittedEmail}</strong>. Please check your inbox.
                </p>
              </div>
            ) : (
              <>
                <div className="auth-tabs">
                  <button
                    className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
                    onClick={() => { setActiveTab("login"); setFormMessage(null); }}
                  >
                    Sign In
                  </button>
                  <button
                    className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
                    onClick={() => { setActiveTab("signup"); setFormMessage(null); }}
                  >
                    Create Account
                  </button>
                </div>

                {formMessage && (
                  <div
                    className={`form-message ${formMessage.type}`}
                    style={{
                      padding: "0.85rem",
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      marginBottom: "1.5rem",
                      background: formMessage.type === "success" ? "rgba(0,192,127,0.1)" : "rgba(239,68,68,0.1)",
                      color: formMessage.type === "success" ? "var(--green-dark)" : "var(--danger)",
                      border: `1px solid ${formMessage.type === "success" ? "rgba(0,192,127,0.2)" : "rgba(239,68,68,0.2)"}`,
                    }}
                  >
                    {formMessage.text}
                  </div>
                )}

                <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {activeTab === "signup" && (
                    <>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>First Name</label>
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <User size={16} style={{ position: "absolute", left: "1rem", color: "var(--muted)" }} />
                            <input
                              type="text"
                              placeholder="John"
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              style={{ padding: "0.75rem 1rem 0.75rem 2.5rem", width: "100%", borderRadius: "10px", border: "1px solid var(--border)" }}
                            />
                          </div>
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Last Name</label>
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <User size={16} style={{ position: "absolute", left: "1rem", color: "var(--muted)" }} />
                            <input
                              type="text"
                              placeholder="Doe"
                              required
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              style={{ padding: "0.75rem 1rem 0.75rem 2.5rem", width: "100%", borderRadius: "10px", border: "1px solid var(--border)" }}
                            />
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Phone Number</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <Phone size={16} style={{ position: "absolute", left: "1rem", color: "var(--muted)" }} />
                          <input
                            type="tel"
                            placeholder="+234 800 000 0000"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{ padding: "0.75rem 1rem 0.75rem 2.5rem", width: "100%", borderRadius: "10px", border: "1px solid var(--border)" }}
                          />
                        </div>
                      </div>
                    </>
                  )}

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

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Password</label>
                      {activeTab === "login" && (
                        <Link
                          href="/account/forgot-password"
                          style={{
                            color: "var(--green)",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            textDecoration: "none"
                          }}
                        >
                          Forgot Password?
                        </Link>
                      )}
                    </div>
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
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
                    disabled={formLoading}
                  >
                    {formLoading ? "Processing..." : activeTab === "login" ? "Sign In" : "Create Account"}
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h1 style={{ fontFamily: "Syne, sans-serif" }}>My Account</h1>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "0.5rem 1.25rem" }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>

            <div className="account-grid">
              <div className="profile-card">
                <h3 style={{ fontFamily: "Syne, sans-serif", marginBottom: "1.25rem" }}>Profile Details</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>Name</span>
                    <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>
                      {session.user.user_metadata?.firstName || session.user.user_metadata?.first_name || ""} {session.user.user_metadata?.lastName || session.user.user_metadata?.last_name || ""}
                      {(!session.user.user_metadata?.firstName && !session.user.user_metadata?.first_name) && "Valued Customer"}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>Email Address</span>
                    <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>{session.user.email}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>Phone Number</span>
                    <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>{session.user.user_metadata?.phone || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div className="history-card">
                <h3 style={{ fontFamily: "Syne, sans-serif", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShoppingBag size={20} style={{ color: "var(--green)" }} /> Order History
                </h3>

                {ordersLoading ? (
                  <p>Loading your orders...</p>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--border)", borderRadius: "14px" }}>
                    <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>You haven&apos;t placed any orders yet.</p>
                    <Link href="/order" className="btn btn-primary">
                      Order Medicines Now
                    </Link>
                  </div>
                ) : (
                  <div className="order-history-list">
                    {orders.map((order) => (
                      <div key={order.id} className="user-order-card">
                        <div className="user-order-header">
                          <div>
                            <span className="user-order-id">{order.id}</span>
                            <div className="user-order-date" style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                              <Clock size={12} /> {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <div>
                            <span className={`user-order-status status-${order.status || "pending"}`}>
                              {order.status || "pending"}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: "1rem" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>Items Ordered</span>
                          <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                                <span>{item.name} <span style={{ color: "var(--muted)" }}>x{item.quantity}</span></span>
                                <span>₦{Number(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                              <MapPin size={12} /> Delivery Address
                            </span>
                            <p style={{ fontSize: "0.85rem", marginTop: "3px" }}>{order.delivery_address}, {order.delivery_city}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>Total Amount</span>
                            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--green-dark)", marginTop: "3px" }}>₦{Number(order.total_amount || order.total).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="account-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p>Loading account portal...</p>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
