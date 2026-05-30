"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import {
  ArrowLeft,
  KeyRound,
  Pill,
  HeartPulse,
  Stethoscope,
  Leaf,
  Thermometer,
  Baby,
  Droplet,
  Layers,
  Syringe,
  Sparkles,
  Activity,
  Award,
  Users,
  Clock,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Globe,
  ShoppingBag,
  FileText,
  CheckCircle,
  AlertTriangle,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Building,
  Bot,
  Truck,
  MessageSquare,
  Lock,
  Package,
  TrendingUp,
  CreditCard,
  Settings,
  Plus,
  Search,
  Bell,
  LogOut,
  Edit,
  Trash2,
  Eye,
  Check,
  DollarSign
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock_qty: number;
  image_url?: string;
  requires_prescription: boolean;
  created_at?: string;
}

interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  items: OrderItem[];
  prescription_url?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  status: string; // 'pending' | 'verified' | 'dispatched' | 'delivered' | 'cancelled'
  created_at: string;
}

interface CustomerRecord {
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  active: boolean;
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");

  // App State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [productSort, setProductSort] = useState<"name" | "newest" | "stock">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Custom delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Prescription",
    description: "",
    price: "",
    stock_qty: "",
    image_url: "",
    requires_prescription: false,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error"; show: boolean }>({
    msg: "",
    type: "success",
    show: false,
  });

  const triggerToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type, show: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Error loading products:", errMsg);
      triggerToast("Failed to load products", "error");
    }
  }, [triggerToast]);

  const loadOrders = useCallback(async () => {
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
      });

      setOrders(formattedOrders);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Error loading orders:", errMsg);
      triggerToast("Failed to load orders", "error");
    }
  }, [triggerToast]);

  const checkIsAdmin = (emailAddress?: string) => {
    if (!emailAddress) return false;
    const allowedAdmins = [
      "ochestapharma@gmail.com",
      (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase()
    ].filter(Boolean);
    return allowedAdmins.includes(emailAddress.toLowerCase());
  };

  // Check current session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && checkIsAdmin(session.user?.email)) {
        setSession(session);
      } else {
        setSession(null);
      }
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && checkIsAdmin(session.user?.email)) {
        setSession(session);
      } else {
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch app data when authenticated
  useEffect(() => {
    if (session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadProducts();
      loadOrders();
    }
  }, [session, loadProducts, loadOrders]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (!checkIsAdmin(data.user?.email)) {
        await supabase.auth.signOut();
        throw new Error("Access Denied: You do not have administrator privileges.");
      }

      setSession(data.session);
    } catch (err: any) {
      console.error("Supabase auth login error:", err);
      const errMsg = err?.message || (typeof err === "string" ? err : "Invalid login credentials");
      setAuthError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setForgotSuccess("");

    try {
      if (!checkIsAdmin(email.trim())) {
        throw new Error("Access Denied: Only administrator accounts can reset passwords here.");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setForgotSuccess("Password reset link sent to your email!");
    } catch (err: any) {
      console.error("Supabase forgot password error:", err);
      setAuthError(err?.message || "Failed to send password reset link.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // CRUD Product
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "Prescription",
      description: "",
      price: "",
      stock_qty: "",
      image_url: "",
      requires_prescription: false,
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description || "",
      price: String(product.price),
      stock_qty: String(product.stock_qty),
      image_url: product.image_url || "",
      requires_prescription: product.requires_prescription,
    });
    setProductModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload file to product-images bucket
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      setProductForm((prev) => ({ ...prev, image_url: publicUrl }));
      triggerToast("Image uploaded successfully!");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Upload error:", errMsg);
      triggerToast("Failed to upload image. Using default.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, category, description, price, stock_qty, image_url, requires_prescription } =
      productForm;

    const payload = {
      name,
      category,
      description,
      price: parseFloat(price) || 0,
      stock_qty: parseInt(stock_qty) || 0,
      image_url: image_url || null,
      requires_prescription,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);

        if (error) throw error;
        triggerToast("Product updated successfully!");
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
        triggerToast("Product created successfully!");
      }

      setProductModalOpen(false);
      loadProducts();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Save product error:", errMsg);
      triggerToast("Failed to save product", "error");
    }
  };

  const confirmDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      triggerToast("Product deleted successfully!");
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch (err: any) {
      console.error("Delete product error:", err);
      const errMsg = err?.message || (typeof err === "string" ? err : "Database error");
      triggerToast("Failed to delete product: " + errMsg, "error");
    }
  };

  const handleQuickRestock = async (productId: string, amount: number) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const newQty = product.stock_qty + amount;

      const { error } = await supabase
        .from("products")
        .update({ stock_qty: newQty })
        .eq("id", productId);

      if (error) throw error;

      triggerToast(`Restocked ${product.name} with +${amount} units!`);
      loadProducts();
    } catch (err: any) {
      console.error("Restock error:", err);
      const errMsg = err?.message || "Failed to update stock";
      triggerToast("Restock failed: " + errMsg, "error");
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      triggerToast(`Order status updated to ${newStatus}`);

      // If selected order modal is open, update local state
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }

      loadOrders();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Update order status error:", errMsg);
      triggerToast("Failed to update status", "error");
    }
  };

  // Generate WhatsApp link
  const getWhatsAppLink = (order: Order, type: "verified" | "dispatched") => {
    // Format customer phone: ensure it starts with country code or standard format
    let cleanPhone = order.customer_phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "234" + cleanPhone.slice(1);
    }
    if (!cleanPhone.startsWith("234") && cleanPhone.length === 10) {
      cleanPhone = "234" + cleanPhone;
    }

    const itemsSummary = order.items.map((i) => `- ${i.name} (x${i.quantity})`).join("\n");

    let message = "";
    if (type === "verified") {
      message = `Hello *${order.customer_name}*, your O'Chesta Pharma order *${order.id}* has been verified by our pharmacist and is being packed.\n\n*Items:*\n${itemsSummary}\n\n*Total:* ₦${Number(order.total).toLocaleString()}\n\nThank you for choosing O'Chesta Pharma!`;
    } else {
      message = `Hello *${order.customer_name}*, your O'Chesta Pharma order *${order.id}* has been dispatched and is on its way to your delivery address: ${order.delivery_address}, ${order.delivery_city}.\n\nOur delivery partner will reach out to you shortly. Feel free to contact support here for any updates.`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Calculate Metrics from state
  const today = new Date().toISOString().split("T")[0];

  const todayOrders = orders.filter((o) => o.created_at.startsWith(today));
  const todayRevenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const pendingRxOrders = orders.filter(
    (o) => o.status === "pending" && o.prescription_url
  ).length;

  const lowStockProducts = products.filter((p) => p.stock_qty <= 20).length;

  // Process customer records dynamically from orders
  const customers: CustomerRecord[] = [];
  orders.forEach((order) => {
    const existing = customers.find((c) => c.email.toLowerCase() === order.customer_email.toLowerCase());
    if (existing) {
      existing.totalOrders += 1;
      if (order.status !== "cancelled") {
        existing.totalSpent += Number(order.total);
      }
      if (new Date(order.created_at) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.created_at;
      }
    } else {
      customers.push({
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        totalOrders: 1,
        totalSpent: order.status !== "cancelled" ? Number(order.total) : 0,
        lastOrderDate: order.created_at,
        active: true,
      });
    }
  });

  // Filtering lists
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === "all" || o.status === orderFilter;
    const matchesSearch =
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const filteredProductsList = products
    .filter((p) => {
      const matchesFilter = productFilter === "all" || p.category.toLowerCase() === productFilter.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (productSort === "newest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; // Newest first
      }
      if (productSort === "stock") {
        return a.stock_qty - b.stock_qty; // Low stock first
      }
      return a.name.localeCompare(b.name); // Alphabetical A-Z
    });

  if (checkingAuth) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "#0a0f1e", color: "#fff" }}>
        <div>Loading Admin Session...</div>
      </div>
    );
  }

  // LOGIN PAGE
  if (!session) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "#0a0f1e", color: "#fff", padding: "1rem" }}>
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2.5rem", width: "100%", maxWidth: "420px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#00c07f", marginRight: "8px", verticalAlign: "middle" }}></span>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", fontWeight: 800 }}>O&apos;Chesta Pharma Admin</span>
          </div>

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <p style={{ fontSize: "0.85rem", color: "#8a8f9e", margin: 0, textAlign: "center", lineHeight: "1.4" }}>
                Enter your admin email address and we will send you a secure link to reset your password.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.8rem", color: "#8a8f9e", fontWeight: 700 }}>Email Address</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Mail size={16} style={{ position: "absolute", left: "1rem", color: "var(--muted)" }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ochep.com"
                    style={{ padding: "0.8rem 1rem 0.8rem 2.5rem", background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", outline: "none", width: "100%" }}
                  />
                </div>
              </div>

              {authError && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.1)", padding: "0.6rem", borderRadius: "6px", display: "flex", gap: "6px", alignItems: "center" }}>
                  <AlertTriangle size={16} />
                  <span>{authError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div style={{ color: "#00c07f", fontSize: "0.85rem", background: "rgba(0, 192, 127, 0.1)", padding: "0.6rem", borderRadius: "6px", display: "flex", gap: "6px", alignItems: "center" }}>
                  <CheckCircle size={16} />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                style={{ padding: "0.9rem", background: "#00c07f", color: "#0a0f1e", border: "none", borderRadius: "30px", fontWeight: 700, cursor: "pointer", transition: "0.2s", display: "flex", justifyContent: "center", alignItems: "center", width: "100%", gap: "6px" }}
              >
                {authLoading ? "Sending Link..." : <><Mail size={16} /> Send Reset Link <ArrowRight size={16} /></>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setAuthError("");
                  setForgotSuccess("");
                }}
                style={{ background: "transparent", border: "none", color: "#8a8f9e", cursor: "pointer", fontSize: "0.85rem", textDecoration: "none", marginTop: "0.5rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.8rem", color: "#8a8f9e", fontWeight: 700 }}>Email Address</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Mail size={16} style={{ position: "absolute", left: "1rem", color: "var(--muted)" }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ochep.com"
                    style={{ padding: "0.8rem 1rem 0.8rem 2.5rem", background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", outline: "none", width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "0.8rem", color: "#8a8f9e", fontWeight: 700 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setAuthError("");
                      setForgotSuccess("");
                    }}
                    style={{ background: "transparent", border: "none", color: "#00c07f", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Lock size={16} style={{ position: "absolute", left: "1rem", color: "var(--muted)" }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ padding: "0.8rem 1rem 0.8rem 2.5rem", background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", outline: "none", width: "100%" }}
                  />
                </div>
              </div>

              {authError && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.1)", padding: "0.6rem", borderRadius: "6px", display: "flex", gap: "6px", alignItems: "center" }}>
                  <AlertTriangle size={16} />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                style={{ padding: "0.9rem", background: "#00c07f", color: "#0a0f1e", border: "none", borderRadius: "30px", fontWeight: 700, cursor: "pointer", transition: "0.2s", display: "flex", justifyContent: "center", alignItems: "center", width: "100%", gap: "6px" }}
              >
                {authLoading ? "Authenticating..." : <><KeyRound size={16} /> Sign In to Admin <ArrowRight size={16} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page" style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5", color: "#0a0f1e", width: "100%" }}>
      {/* TOAST */}
      <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>
        {toast.type === "success" ? "✅ " : "❌ "}
        {toast.msg}
      </div>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-dot"></span>
          <span>O&apos;Chesta Admin</span>
        </div>
        <div className="nav-section">Main</div>
        <button
          className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
          style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
        >
          <span className="nav-icon" style={{ display: "inline-flex" }}><Activity size={18} /></span>
          <span>Dashboard</span>
        </button>
        <button
          className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
          style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
        >
          <span className="nav-icon" style={{ display: "inline-flex" }}><ShoppingBag size={18} /></span>
          <span>Orders</span>
        </button>
        <button
          className={`nav-item ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
          style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
        >
          <span className="nav-icon" style={{ display: "inline-flex" }}><Package size={18} /></span>
          <span>Inventory</span>
        </button>
        <button
          className={`nav-item ${activeTab === "customers" ? "active" : ""}`}
          onClick={() => setActiveTab("customers")}
          style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
        >
          <span className="nav-icon" style={{ display: "inline-flex" }}><Users size={18} /></span>
          <span>Customers</span>
        </button>

        <div className="nav-section">Tools</div>
        <Link href="/" className="nav-item">
          <span className="nav-icon" style={{ display: "inline-flex" }}><Globe size={18} /></span>
          <span>View Storefront</span>
        </Link>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ background: "none", border: "none", width: "100%", textAlign: "left", marginTop: "1rem", color: "#ef4444" }}
        >
          <span className="nav-icon" style={{ display: "inline-flex" }}><LogOut size={18} /></span>
          <span>Logout</span>
        </button>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">AD</div>
            <div className="admin-info">
              <p>Pharmacist</p>
              <span>Verified Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main" style={{ width: "calc(100% - 240px)" }}>
        {/* TOPBAR */}
        <div className="topbar">
          <h1 id="pageTitle" style={{ textTransform: "capitalize" }}>
            {activeTab}
          </h1>
          <div className="topbar-right">
            <div className="search-box" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Search size={16} style={{ color: "var(--muted)" }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: "0.85rem", width: "120px", background: "transparent" }}
              />
            </div>
            <div className="date-badge">
              {new Date().toLocaleDateString("en-NG", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="tab-panel active">
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Today&apos;s Orders
                  <span className="stat-icon" style={{ display: "flex", color: "var(--green)" }}><ShoppingBag size={20} /></span>
                </div>
                <div className="stat-val">{todayOrders.length}</div>
                <div className="stat-change up">Current Live Stats</div>
              </div>
              <div className="stat-card">
                <div className="stat-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Today&apos;s Revenue
                  <span className="stat-icon" style={{ display: "flex", color: "var(--green)" }}><DollarSign size={20} /></span>
                </div>
                <div className="stat-val">₦{todayRevenue.toLocaleString()}</div>
                <div className="stat-change up">Excludes cancelled</div>
              </div>
              <div className="stat-card">
                <div className="stat-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Pending Rx Review
                  <span className="stat-icon" style={{ display: "flex", color: "var(--warn)" }}><FileText size={20} /></span>
                </div>
                <div className="stat-val">{pendingRxOrders}</div>
                <div className="stat-change warn">Requires verification</div>
              </div>
              <div className="stat-card">
                <div className="stat-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Low Stock Items
                  <span className="stat-icon" style={{ display: "flex", color: "var(--danger)" }}><AlertTriangle size={20} /></span>
                </div>
                <div className="stat-val">{lowStockProducts}</div>
                <div className="stat-change down">Stock level &le; 20</div>
              </div>
            </div>

            <div className="dash-grid">
              {/* ALERTS */}
              <div className="card">
                <div className="card-title">System Alerts & Notices</div>
                <div className="alerts-list">
                   {products
                    .filter((p) => p.stock_qty <= 5)
                    .map((p) => (
                      <div key={p.id} className="alert-item danger" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <span className="alert-icon" style={{ display: "flex", color: "#ef4444" }}><AlertTriangle size={16} /></span>
                          <div>
                            <strong>{p.name}</strong> Out of stock soon! Only {p.stock_qty} left.
                          </div>
                        </div>
                        <button
                          onClick={() => handleQuickRestock(p.id, 50)}
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#ef4444",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "20px",
                            padding: "0.3rem 0.7rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "0.2s"
                          }}
                        >
                          Restock +50
                        </button>
                      </div>
                    ))}
                  {products
                    .filter((p) => p.stock_qty > 5 && p.stock_qty <= 20)
                    .map((p) => (
                      <div key={p.id} className="alert-item warn" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <span className="alert-icon" style={{ display: "flex", color: "#f59e0b" }}><AlertTriangle size={16} /></span>
                          <div>
                            <strong>{p.name}</strong> Low stock alert ({p.stock_qty} left).
                          </div>
                        </div>
                        <button
                          onClick={() => handleQuickRestock(p.id, 50)}
                          style={{
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "#f59e0b",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            borderRadius: "20px",
                            padding: "0.3rem 0.7rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "0.2s"
                          }}
                        >
                          Restock +50
                        </button>
                      </div>
                    ))}
                  {orders.filter((o) => o.status === "pending").length > 0 && (
                    <div className="alert-item warn" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span className="alert-icon" style={{ display: "flex", color: "#f59e0b" }}><FileText size={16} /></span>
                      <div>
                        <strong>{orders.filter((o) => o.status === "pending").length} Orders</strong> pending admin review.
                      </div>
                    </div>
                  )}
                  <div className="alert-item info" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span className="alert-icon" style={{ display: "flex", color: "var(--green)" }}><CheckCircle size={16} /></span>
                    <div>
                      <strong>System Operational</strong> Supabase backend is successfully connected.
                    </div>
                  </div>
                </div>
              </div>

              {/* STATS BREAKDOWN */}
              <div className="card">
                <div className="card-title">Catalog Summary</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                      <span>Prescription Drugs</span>
                      <span>{products.filter((p) => p.requires_prescription).length} items</span>
                    </div>
                    <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px" }}>
                      <div style={{ height: "100%", width: `${(products.filter((p) => p.requires_prescription).length / (products.length || 1)) * 100}%`, background: "#0d3b6e", borderRadius: "3px" }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                      <span>Over-the-Counter (OTC)</span>
                      <span>{products.filter((p) => !p.requires_prescription).length} items</span>
                    </div>
                    <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px" }}>
                      <div style={{ height: "100%", width: `${(products.filter((p) => !p.requires_prescription).length / (products.length || 1)) * 100}%`, background: "#00c07f", borderRadius: "3px" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="card" style={{ marginTop: "1.25rem" }}>
              <div className="card-title">
                Recent Orders
                <button className="action-btn" onClick={() => setActiveTab("orders")}>
                  View all &rarr;
                </button>
              </div>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id}</strong>
                      </td>
                      <td>{order.customer_name}</td>
                      <td>{order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}</td>
                      <td>₦{Number(order.total).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>{order.status}</span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn" onClick={() => setSelectedOrder(order)} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Eye size={12} /> Open
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "#8a8f9e", padding: "2rem" }}>
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="tab-panel active">
            <div className="section-header">
              <h2>Order Fulfillment</h2>
              <div className="filter-row">
                {["all", "pending", "verified", "dispatched", "delivered", "cancelled"].map((status) => (
                  <button
                    key={status}
                    className={`filter-chip ${orderFilter === status ? "active" : ""}`}
                    onClick={() => setOrderFilter(status)}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id}</strong>
                      </td>
                      <td>{order.customer_name}</td>
                      <td style={{ color: "var(--muted)" }}>{order.customer_phone}</td>
                      <td>{order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}</td>
                      <td>
                        <strong>₦{Number(order.total).toLocaleString()}</strong>
                      </td>
                      <td>
                        <select
                          className={`status-badge ${order.status}`}
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          style={{ border: "none", cursor: "pointer", outline: "none", fontWeight: 700 }}
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="action-btn" onClick={() => setSelectedOrder(order)} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <FileText size={12} /> Details
                          </button>
                          {(order.status === "verified" || order.status === "dispatched") && (
                            <a
                              href={getWhatsAppLink(order, order.status as "verified" | "dispatched")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-btn"
                              style={{ background: "#25D366", color: "#fff", textDecoration: "none", border: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                              <MessageSquare size={12} /> Notify
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", color: "#8a8f9e", padding: "3rem" }}>
                        No matching orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === "inventory" && (
          <div className="tab-panel active">
            <div className="section-header">
              <h2>Product Catalog</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <select
                  value={productSort}
                  onChange={(e) => setProductSort(e.target.value as any)}
                  style={{ padding: "0.4rem 1rem", borderRadius: "100px", border: "1px solid var(--border)", outline: "none", fontSize: "0.8rem", cursor: "pointer", background: "#fff", color: "#0a0f1e" }}
                >
                  <option value="newest">Sort by: Newest</option>
                  <option value="name">Sort by: Name (A-Z)</option>
                  <option value="stock">Sort by: Low Stock First</option>
                </select>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  style={{ padding: "0.4rem 1rem", borderRadius: "100px", border: "1px solid var(--border)", outline: "none", fontSize: "0.8rem", cursor: "pointer", background: "#fff", color: "#0a0f1e" }}
                >
                  <option value="all">All Categories</option>
                  <option value="prescription">Prescription</option>
                  <option value="otc">OTC</option>
                  <option value="supplements">Supplements</option>
                  <option value="diagnostics">Diagnostics</option>
                  <option value="paediatrics">Paediatrics</option>
                </select>
                <button className="btn btn-primary" onClick={openAddProductModal} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Plus size={16} /> Add Product
                </button>
              </div>
            </div>

            <div className="card">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Stock Alert</th>
                    <th>Price</th>
                    <th>Rx Required</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProductsList.map((product) => {
                    const stockPct = Math.min((product.stock_qty / 100) * 100, 100);
                    const isLow = product.stock_qty <= 20;
                    return (
                      <tr key={product.id}>
                        <td>
                          <strong>{product.name}</strong>
                          {product.description && (
                            <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: "normal" }}>
                              {product.description}
                            </div>
                          )}
                        </td>
                        <td style={{ color: "var(--muted)" }}>{product.category}</td>
                        <td>
                          <strong>{product.stock_qty}</strong> units
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="stock-bar-wrap" style={{ width: "80px" }}>
                              <div
                                className={`stock-bar ${product.stock_qty <= 5 ? "stock-out" : isLow ? "stock-low" : "stock-good"}`}
                                style={{ width: `${stockPct}%` }}
                              ></div>
                            </div>
                            <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                              {product.stock_qty <= 5 ? "🔴 Critical" : isLow ? "🟡 Low" : "🟢 Good"}
                            </span>
                          </div>
                        </td>
                        <td>₦{Number(product.price).toLocaleString()}</td>
                        <td>
                          <span className={product.requires_prescription ? "expiry-crit" : "expiry-ok"}>
                            {product.requires_prescription ? "Yes (Rx)" : "No (OTC)"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="action-btn" onClick={() => openEditProductModal(product)} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Edit size={12} /> Edit
                            </button>
                            <button
                              className="action-btn"
                              style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.2)", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              onClick={() => {
                                setProductToDelete(product);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProductsList.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "#8a8f9e", padding: "3rem" }}>
                        No products match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === "customers" && (
          <div className="tab-panel active">
            <div className="section-header">
              <h2>Customer Accounts</h2>
            </div>
            <div className="card">
              <table className="cust-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Total Orders</th>
                    <th>Total Spent</th>
                    <th>Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => {
                    const initials = c.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2);
                    return (
                      <tr key={i}>
                        <td>
                          <span className="cust-avatar">{initials}</span>
                          <strong>{c.name}</strong>
                        </td>
                        <td style={{ color: "var(--muted)" }}>{c.email}</td>
                        <td style={{ color: "var(--muted)" }}>{c.phone}</td>
                        <td>
                          <strong>{c.totalOrders}</strong>
                        </td>
                        <td style={{ color: "var(--green)", fontWeight: 700 }}>
                          ₦{c.totalSpent.toLocaleString()}
                        </td>
                        <td style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                          {new Date(c.lastOrderDate).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#8a8f9e", padding: "3rem" }}>
                        No customer logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* PRODUCT ADD/EDIT MODAL */}
      {productModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", background: "rgba(10,15,30,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "20px", width: "100%", maxWidth: "480px", border: "1px solid var(--border)", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif" }}>
                {editingProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "var(--muted)" }}
                onClick={() => setProductModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.75rem", fontWeight: 700 }}>Product Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Amoxicillin 500mg"
                  style={{ padding: "0.7rem", border: "1.5px solid var(--border)", borderRadius: "10px" }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.75rem", fontWeight: 700 }}>Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                  style={{ padding: "0.7rem", border: "1.5px solid var(--border)", borderRadius: "10px" }}
                >
                  <option value="Prescription">Prescription</option>
                  <option value="OTC">OTC</option>
                  <option value="Supplements">Supplements</option>
                  <option value="Diagnostics">Diagnostics</option>
                  <option value="Paediatrics">Paediatrics</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.75rem", fontWeight: 700 }}>Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Antibiotic for bacterial infections..."
                  style={{ padding: "0.7rem", border: "1.5px solid var(--border)", borderRadius: "10px", minHeight: "60px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem", fontWeight: 700 }}>Price (₦)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="1500"
                    style={{ padding: "0.7rem", border: "1.5px solid var(--border)", borderRadius: "10px" }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem", fontWeight: 700 }}>Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock_qty}
                    onChange={(e) => setProductForm((p) => ({ ...p, stock_qty: e.target.value }))}
                    placeholder="100"
                    style={{ padding: "0.7rem", border: "1.5px solid var(--border)", borderRadius: "10px" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.75rem", fontWeight: 700 }}>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ fontSize: "0.8rem", marginTop: "4px" }}
                />
                {uploadingImage && <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Uploading...</span>}
                {productForm.image_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={productForm.image_url}
                    alt="Preview"
                    style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", marginTop: "8px" }}
                  />
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="reqRx"
                  checked={productForm.requires_prescription}
                  onChange={(e) => setProductForm((p) => ({ ...p, requires_prescription: e.target.checked }))}
                />
                <label htmlFor="reqRx" style={{ fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
                  Requires Prescription (Rx Required)
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1rem" }}>
                <button type="button" className="btn btn-outline" onClick={() => setProductModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmOpen && productToDelete && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", background: "rgba(10,15,30,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "20px", width: "100%", maxWidth: "400px", border: "1px solid var(--border)", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", color: "#0a0f1e" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "#ef4444", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={20} /> Delete Product?
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: "1.5", marginBottom: "1.5rem" }}>
              Are you sure you want to delete <strong>{productToDelete.name}</strong>? This action cannot be undone and will permanently remove the product from the catalog.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setProductToDelete(null);
                }}
                style={{ cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={() => {
                  if (productToDelete) {
                    confirmDeleteProduct(productToDelete.id);
                  }
                }}
                style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "30px", padding: "0.6rem 1.2rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Trash2 size={16} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", background: "rgba(10,15,30,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "20px", width: "100%", maxWidth: "600px", border: "1px solid var(--border)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif" }}>Order Details: {selectedOrder.id}</h3>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "var(--muted)" }}
                onClick={() => setSelectedOrder(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {/* Customer */}
              <div>
                <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>Customer</h4>
                <p style={{ fontWeight: 700 }}>{selectedOrder.customer_name}</p>
                <p style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px", color: "var(--muted)" }}><Mail size={14} /> {selectedOrder.customer_email}</p>
                <p style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px", color: "var(--muted)" }}><Phone size={14} /> {selectedOrder.customer_phone}</p>
              </div>

              {/* Delivery */}
              <div>
                <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>Delivery Address</h4>
                <p style={{ fontSize: "0.9rem" }}>{selectedOrder.delivery_address}, {selectedOrder.delivery_city}</p>
              </div>

              {/* Order Status Dropdown */}
              <div>
                <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>Order Status</h4>
                <select
                  className={`status-badge ${selectedOrder.status}`}
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  style={{ padding: "0.3rem 1rem", borderRadius: "100px", border: "1.5px solid var(--border)", outline: "none", fontWeight: 700, cursor: "pointer" }}
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Items */}
              <div>
                <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>Items ordered</h4>
                <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "1rem" }}>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", paddingBottom: "6px", borderBottom: index === selectedOrder.items.length - 1 ? "none" : "1px solid var(--border)", marginBottom: "6px" }}>
                      <span>
                        {item.name} <strong>x{item.quantity}</strong>
                      </span>
                      <span>₦{(Number(item.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginTop: "1rem", color: "var(--muted)" }}>
                    <span>Subtotal</span>
                    <span>₦{Number(selectedOrder.subtotal).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--muted)" }}>
                    <span>Delivery Fee ({selectedOrder.delivery_city})</span>
                    <span>₦{Number(selectedOrder.delivery_fee).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", fontWeight: 800, marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1.5px solid var(--border)" }}>
                    <span>Total Amount</span>
                    <span style={{ color: "var(--green)" }}>₦{Number(selectedOrder.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>Payment Method</h4>
                <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                  {selectedOrder.payment_method === "transfer"
                    ? "Bank Transfer"
                    : selectedOrder.payment_method === "card"
                    ? "Credit/Debit Card"
                    : "Pay on Delivery (POD)"}
                </p>
              </div>

              {/* Prescription Image */}
              {selectedOrder.prescription_url && (
                <div>
                  <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>Uploaded Prescription</h4>
                  <a href={selectedOrder.prescription_url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedOrder.prescription_url}
                      alt="Prescription"
                      style={{ width: "100%", maxHeight: "250px", objectFit: "contain", borderRadius: "12px", border: "1px solid var(--border)", background: "#f8f9fa", cursor: "zoom-in" }}
                    />
                  </a>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1rem" }}>
                {(selectedOrder.status === "verified" || selectedOrder.status === "dispatched") && (
                  <a
                    href={getWhatsAppLink(selectedOrder, selectedOrder.status as "verified" | "dispatched")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ background: "#25D366", color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <MessageSquare size={16} /> Send WhatsApp Alert
                  </a>
                )}
                <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
