"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import { supabase } from "@/lib/supabase";
import { WHATSAPP_PHONE_NUMBER, BUSINESS_EMAIL, BUSINESS_PHONE } from "@/lib/constants";
import {
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
  Smartphone,
  ShoppingCart
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
}

const FALLBACK_PRODUCTS: Product[] = [
  { id: '1', name: 'Amoxicillin 500mg', category: 'Prescription', description: 'Antibiotic for bacterial infections', price: 1500, stock_qty: 200, requires_prescription: true },
  { id: '2', name: 'Azithromycin 250mg', category: 'Prescription', description: 'Broad-spectrum antibiotic', price: 2200, stock_qty: 150, requires_prescription: true },
  { id: '3', name: 'Metformin 500mg', category: 'Prescription', description: 'Type 2 diabetes management', price: 1800, stock_qty: 200, requires_prescription: true },
  { id: '4', name: 'Glucometer Kit', category: 'Diagnostics', description: 'Blood sugar monitoring device', price: 12000, stock_qty: 50, requires_prescription: false },
  { id: '5', name: 'Amlodipine 5mg', category: 'Prescription', description: 'Blood pressure medication', price: 900, stock_qty: 250, requires_prescription: true },
  { id: '6', name: 'Lisinopril 10mg', category: 'Prescription', description: 'ACE inhibitor antihypertensive', price: 1100, stock_qty: 300, requires_prescription: true },
  { id: '7', name: 'Vitamin C 1000mg', category: 'Supplements', description: 'Immune system support', price: 600, stock_qty: 300, requires_prescription: false },
  { id: '8', name: 'Zinc 50mg', category: 'Supplements', description: 'Essential mineral supplement', price: 500, stock_qty: 300, requires_prescription: false },
  { id: '9', name: 'Folic Acid 5mg', category: 'Supplements', description: 'Prenatal and general health', price: 400, stock_qty: 300, requires_prescription: false },
  { id: '10', name: 'Paracetamol 500mg', category: 'OTC', description: 'Fever and pain relief (20 tabs)', price: 200, stock_qty: 500, requires_prescription: false },
  { id: '11', name: 'Ibuprofen 400mg', category: 'OTC', description: 'Anti-inflammatory pain relief', price: 350, stock_qty: 300, requires_prescription: false },
  { id: '12', name: 'Loratadine 10mg', category: 'OTC', description: 'Non-drowsy antihistamine', price: 800, stock_qty: 100, requires_prescription: false },
  { id: '13', name: 'Paracetamol Syrup', category: 'Paediatrics', description: 'Children\'s fever & pain (100ml)', price: 750, stock_qty: 100, requires_prescription: false },
  { id: '14', name: 'Vitamin A Drops', category: 'Paediatrics', description: 'Infant micronutrient supplement', price: 600, stock_qty: 100, requires_prescription: false },
  { id: '15', name: 'Malaria RDT Kit', category: 'Diagnostics', description: 'Rapid diagnostic test kit (3 tests)', price: 1200, stock_qty: 150, requires_prescription: false },
  { id: '16', name: 'Clotrimazole Cream', category: 'OTC', description: 'Antifungal topical treatment', price: 900, stock_qty: 100, requires_prescription: false },
];

function getProductIcon(category: string, name: string) {
  const cat = category.toLowerCase();
  const n = name.toLowerCase();
  
  if (n.includes('antibiotic') || n.includes('amoxicillin') || n.includes('azithromycin') || n.includes('ciprofloxacin')) 
    return <Pill size={36} style={{ color: 'var(--green)' }} />;
  if (n.includes('diabete') || n.includes('metformin') || n.includes('glibenclamide') || n.includes('glucometer') || n.includes('insulin')) 
    return <HeartPulse size={36} style={{ color: '#ef4444' }} />;
  if (n.includes('blood pressure') || n.includes('amlodipine') || n.includes('lisinopril') || n.includes('losartan') || n.includes('atenolol') || n.includes('cardio') || n.includes('heart')) 
    return <Stethoscope size={36} style={{ color: '#0d3b6e' }} />;
  if (n.includes('vitamin c') || n.includes('zinc') || n.includes('folic') || n.includes('supplement') || n.includes('multivitamin') || n.includes('mineral')) 
    return <Leaf size={36} style={{ color: '#10b981' }} />;
  if (n.includes('fever') || n.includes('pain') || n.includes('paracetamol') || n.includes('ibuprofen') || n.includes('diclofenac')) 
    return <Thermometer size={36} style={{ color: '#f59e0b' }} />;
  if (n.includes('child') || n.includes('baby') || n.includes('infant') || n.includes('paediatric') || n.includes('syrup')) 
    return <Baby size={36} style={{ color: '#3b82f6' }} />;
  if (n.includes('malaria') || n.includes('test') || n.includes('kit') || n.includes('device') || n.includes('monitor') || n.includes('oximeter')) 
    return <Droplet size={36} style={{ color: '#ef4444' }} />;
  if (n.includes('skin') || n.includes('cream') || n.includes('antifungal') || n.includes('clotrimazole') || n.includes('ointment')) 
    return <Layers size={36} style={{ color: '#8b5cf6' }} />;
  if (n.includes('anxiolytic') || n.includes('antidepressant') || n.includes('sleep') || n.includes('mental') || n.includes('brain')) 
    return <Activity size={36} style={{ color: '#6366f1' }} />;
  if (n.includes('maternal') || n.includes('pregnacare') || n.includes('pregnant')) 
    return <Sparkles size={36} style={{ color: '#ec4899' }} />;
  if (n.includes('digestive') || n.includes('stomach') || n.includes('acid') || n.includes('laxative') || n.includes('dewormer') || n.includes('gastro')) 
    return <Activity size={36} style={{ color: '#10b981' }} />;
  if (n.includes('inject') || n.includes('fluid') || n.includes('ampoule') || n.includes('syringe')) 
    return <Syringe size={36} style={{ color: '#ef4444' }} />;

  if (cat.includes('presc')) return <Pill size={36} style={{ color: 'var(--green)' }} />;
  if (cat.includes('supp')) return <Leaf size={36} style={{ color: '#10b981' }} />;
  if (cat.includes('otc')) return <Thermometer size={36} style={{ color: '#f59e0b' }} />;
  if (cat.includes('paed') || cat.includes('child')) return <Baby size={36} style={{ color: '#3b82f6' }} />;
  if (cat.includes('diag') || cat.includes('test')) return <Droplet size={36} style={{ color: '#ef4444' }} />;

  return <Pill size={36} style={{ color: 'var(--green)' }} />;
}

function getProductImageUrl(imageUrl: string | undefined | null) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  // Otherwise, construct public URL from path
  const { data } = supabase.storage.from("product-images").getPublicUrl(imageUrl);
  return data.publicUrl;
}

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error"; show: boolean }>({
    msg: "",
    type: "success",
    show: false,
  });
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [licenseModal, setLicenseModal] = useState<{ isOpen: boolean; title: string; imageSrc: string }>({
    isOpen: false,
    title: "",
    imageSrc: "",
  });

  // Form references
  const formRef = useRef<HTMLFormElement>(null);

  // Track session for navbar sign in state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dropdown click outside listener
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutsideClick = () => setDropdownOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [dropdownOpen]);

  // Escape key listener to close license lightbox modal
  useEffect(() => {
    if (!licenseModal.isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLicenseModal(prev => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [licenseModal.isOpen]);

  // Initialize EmailJS key
  useEffect(() => {
    const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";
    if (EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  }, []);

  // Fetch products
  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setProducts(data);
        } else {
          // Empty DB fallback
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.error("Error loading products, using fallback list:", err);
        setProducts(FALLBACK_PRODUCTS);
      }
    }
    loadProducts();
  }, []);

  // Filter products by category directly during render to avoid useEffect setState cycles
  const filteredProducts = selectedCat === "all"
    ? products
    : products.filter((p) => p.category.toLowerCase() === selectedCat.toLowerCase());

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reveal elements on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 70);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [products]); // Re-run when products load so cards are animated too

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type, show: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setIsSending(true);

    const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
    const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";

    if (
      EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" ||
      EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID"
    ) {
      // Mock submit if keys are not configured yet
      setTimeout(() => {
        triggerToast("Message sent! (EmailJS not configured - values are placeholders)");
        formRef.current?.reset();
        setIsSending(false);
      }, 1000);
      return;
    }

    try {
      const firstName = (document.getElementById("firstName") as HTMLInputElement).value;
      const lastName = (document.getElementById("lastName") as HTMLInputElement).value;
      const userEmail = (document.getElementById("userEmail") as HTMLInputElement).value;
      const userPhone = (document.getElementById("userPhone") as HTMLInputElement).value;
      const userType = (document.getElementById("userType") as HTMLSelectElement).value;
      const userSubject = (document.getElementById("userSubject") as HTMLSelectElement).value;
      const userMessage = (document.getElementById("userMessage") as HTMLTextAreaElement).value;

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: `${firstName} ${lastName}`,
        from_email: userEmail,
        from_phone: userPhone,
        user_type: userType,
        subject: userSubject,
        message: userMessage,
        to_name: "O'Chesta Pharma Team",
        reply_to: userEmail,
      });

      triggerToast("Message sent! We'll reply within 24 hours.");
      formRef.current.reset();
    } catch (err) {
      console.error("EmailJS failed to send:", err);
      triggerToast(`Failed to send. Please WhatsApp us at +234 ${WHATSAPP_PHONE_NUMBER}`, "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="storefront-page">
      {/* WHATSAPP FLOAT */}
      <a
        href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float"
        title="Chat on WhatsApp"
      >
        💬
      </a>

      {/* TOAST */}
      <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>
        {toast.type === "success" ? "✅ " : "❌ "}
        {toast.msg}
      </div>

      {/* NAV */}
      <nav id="mainNav" className={`storefront-nav ${scrolled ? "scrolled" : ""}`}>
        <a href="#hero" className="logo">
          <span className="logo-dot"></span>O&apos;Chesta Pharma
        </a>
        <ul className={`nav-links ${menuOpen ? "open" : ""}`} id="navLinks">
          <li>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>
          </li>
          <li>
            <a href="#services" onClick={() => setMenuOpen(false)}>
              Services
            </a>
          </li>
          <li>
            <a href="#products" onClick={() => setMenuOpen(false)}>
              Products
            </a>
          </li>
          <li>
            <a href="#epharmacy" onClick={() => setMenuOpen(false)}>
              E-Pharmacy
            </a>
          </li>
          <li>
            <a href="#investor" onClick={() => setMenuOpen(false)}>
              Investors
            </a>
          </li>
          {user ? (
            <li className="nav-dropdown-wrapper" style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                className="nav-dropdown-trigger"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ink)",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "0"
                }}
              >
                My Account <span style={{ fontSize: "0.6rem", transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </button>
              {dropdownOpen && (
                <div
                  className="nav-dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "0.85rem",
                    background: "var(--paper)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "0.5rem 0",
                    minWidth: "150px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Link
                    href="/account"
                    onClick={() => {
                      setDropdownOpen(false);
                      setMenuOpen(false);
                    }}
                    style={{
                      padding: "0.6rem 1.25rem",
                      fontSize: "0.82rem",
                      color: "var(--ink)",
                      textDecoration: "none",
                      fontWeight: 600,
                      textAlign: "left"
                    }}
                  >
                    Order History
                  </Link>
                  <button
                    onClick={async () => {
                      setDropdownOpen(false);
                      setMenuOpen(false);
                      await supabase.auth.signOut();
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0.6rem 1.25rem",
                      fontSize: "0.82rem",
                      color: "#ef4444",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%"
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li>
              <Link href="/account" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
            </li>
          )}
          <li>
            <a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>
              Contact Us
            </a>
          </li>
        </ul>
        <button
          className="hamburger"
          id="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* HERO SECTION */}
      <section id="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-inner">
          <div className="hero-badge-container">
            <span className="hero-badge">Nigeria&apos;s Next-Generation Pharmacy</span>
            <span className="hero-badge-sub">Superintendent Pharmacist: Pharm. Oche Peter Obiabo</span>
          </div>
          <h1>
            Healthcare,
            <br />
            <em>Reimagined</em>
            <br />
            for Africa.
          </h1>
          <p className="hero-sub">
            O&apos;Chesta Pharma Ltd delivers safe, NAFDAC-verified medicines with licensed pharmacist
            oversight — online ordering, prescription verification, and doorstep delivery across
            Nigeria.
          </p>
          <div className="hero-actions">
            <Link href="/order" className="btn btn-primary">
              Order Medicines →
            </Link>
            <a href="#about" className="btn btn-outline">
              Our Story
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark"
            >
              💬 WhatsApp Us
            </a>
          </div>
          <div className="hero-stats">
            <div className="h-stat">
              <div className="h-stat-num">10k+</div>
              <div className="h-stat-label">Patients Served</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-num">500+</div>
              <div className="h-stat-label">Products</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-num">24/7</div>
              <div className="h-stat-label">Support</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-num">48h</div>
              <div className="h-stat-label">Max Delivery</div>
            </div>
          </div>
        </div>
        <div className="scroll-hint">
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about">
        <div className="section-label reveal">Who We Are</div>
        <div className="about-layout">
          <div className="about-body reveal">
            <h2 className="section-title">
              Built to transform <span>pharmacy</span> in Nigeria
            </h2>
            <p style={{ marginTop: "1.5rem" }}>
              O&apos;Chesta Pharma Ltd is a registered pharmaceutical company headquartered in Wuse II,
              Abuja. We are on a mission to bridge the gap between quality healthcare and everyday
              Nigerians by combining licensed pharmacists, cutting-edge digital infrastructure, and a
              robust supply chain.
            </p>
            <p>
              We believe that every Nigerian — regardless of location or income — deserves access to
              safe, authentic, and timely pharmaceutical care. From prescription verification to
              telepharmacy consultations and doorstep delivery, we are redefining what a pharmacy can
              be.
            </p>
            <div className="about-pills">
              <span className="pill">🏥 NAFDAC Registered</span>
              <span className="pill">⚖️ PCN Licensed</span>
              <span className="pill">🔒 NDPR Compliant</span>
              <span className="pill">🇳🇬 Nigeria-Founded</span>
              <span className="pill">💻 Tech-Powered</span>
            </div>
            <div className="about-values">
              <div className="val-card">
                <div className="val-icon">🔬</div>
                <h4>Quality Assurance</h4>
                <p>
                  Every product sourced from NAFDAC-registered suppliers, cold-chain verified before
                  dispatch.
                </p>
              </div>
              <div className="val-card">
                <div className="val-icon">🛡️</div>
                <h4>Compliance First</h4>
                <p>
                  Full NDPR data protection, PCN-licensed pharmacist review on every prescription.
                </p>
              </div>
              <div className="val-card">
                <div className="val-icon">⚡</div>
                <h4>Technology Driven</h4>
                <p>
                  AI-assisted customer support, real-time order tracking, and digital health records.
                </p>
              </div>
              <div className="val-card">
                <div className="val-icon">🤝</div>
                <h4>Patient-Centered</h4>
                <p>Every product decision and service design starts with patient safety and wellbeing.</p>
              </div>
            </div>
            <a href="#contact" className="btn btn-primary" style={{ marginTop: "2rem", display: "inline-flex" }}>
              Get In Touch →
            </a>
          </div>
          <div className="about-visual reveal">
            <span className="big-icon">💊</span>
            <div className="about-metrics">
              <div className="ab-metric">
                <div className="ab-metric-num">NAFDAC</div>
                <div className="ab-metric-label">Registered</div>
              </div>
              <div
                className="ab-metric clickable"
                onClick={() =>
                  setLicenseModal({
                    isOpen: true,
                    title: "PCN Pharmacy License Certificate",
                    imageSrc: "/Assets/License.png",
                  })
                }
              >
                <div className="ab-metric-num">PCN</div>
                <div className="ab-metric-label">
                  Licensed
                  <span className="view-badge">View License 🔍</span>
                </div>
              </div>
              <div className="ab-metric">
                <div className="ab-metric-num">A+</div>
                <div className="ab-metric-label">Quality Rating</div>
              </div>
              <div
                className="ab-metric clickable"
                onClick={() =>
                  setLicenseModal({
                    isOpen: true,
                    title: "CAC Incorporation Certificate",
                    imageSrc: "/Assets/CAC.png",
                  })
                }
              >
                <div className="ab-metric-num">CAC</div>
                <div className="ab-metric-label">
                  Registered 2024
                  <span className="view-badge">View Certificate 🔍</span>
                </div>
              </div>
            </div>
            <div className="team-strip">
              <h5>Our Pharmacy Team</h5>
              <div className="team-members">
                <div className="team-member">
                  <div className="member-avatar">SP</div>
                  <div className="member-info">
                    <p>Superintendent Pharmacist</p>
                    <span>Pharm. Oche Peter Obiabo (B.Pharm, MPH)</span>
                  </div>
                </div>
                <div className="team-member">
                  <div className="member-avatar">RP</div>
                  <div className="member-info">
                    <p>Registered Pharmacists</p>
                    <span>Full PCN-licensed dispensing team</span>
                  </div>
                </div>
                <div className="team-member">
                  <div className="member-avatar">QA</div>
                  <div className="member-info">
                    <p>Quality Assurance Officer</p>
                    <span>NAFDAC compliance & supply chain</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services">
        <div className="services-intro reveal">
          <div>
            <div className="section-label">What We Offer</div>
            <h2 className="section-title">
              Full-spectrum <span>pharmaceutical</span> services
            </h2>
          </div>
          <p>
            From walk-in dispensing to AI-powered telepharmacy, O&apos;Chesta Pharma provides end-to-end
            pharmaceutical services designed for modern Nigerian healthcare needs.
          </p>
        </div>
        <div className="services-grid">
          <div className="svc-card reveal">
            <span className="svc-tag">Core Service</span>
            <span className="svc-icon" style={{ color: "var(--green)", display: "flex" }}><Building size={32} /></span>
            <h3>Retail Pharmacy</h3>
            <p>
              Walk-in dispensing of prescription and OTC medications from our licensed pharmacy outlet in
              Wuse II, Abuja, with full pharmacist oversight.
            </p>
            <ul className="svc-features">
              <li>NAFDAC-verified medicines only</li>
              <li>Licensed pharmacist on duty always</li>
              <li>Prescription storage & records</li>
              <li>Patient counseling included</li>
            </ul>
            <a href="#contact" className="svc-link">
              Visit Us →
            </a>
          </div>

          <div className="svc-card reveal">
            <span className="svc-tag">Digital</span>
            <span className="svc-icon" style={{ color: "var(--green)", display: "flex" }}><Smartphone size={32} /></span>
            <h3>E-Pharmacy Platform</h3>
            <p>
              Order medicines online 24/7, upload your prescription, pay securely, and receive your
              medicines at your doorstep anywhere in Abuja and Lagos.
            </p>
            <ul className="svc-features">
              <li>Online prescription upload</li>
              <li>Secure payment (card, transfer, POD)</li>
              <li>Real-time order tracking</li>
              <li>Digital health records</li>
            </ul>
            <Link href="/order" className="svc-link">
              Order Now →
            </Link>
          </div>

          <div className="svc-card reveal">
            <span className="svc-tag">Telehealth</span>
            <span className="svc-icon" style={{ color: "var(--green)", display: "flex" }}><MessageSquare size={32} /></span>
            <h3>Telepharmacy</h3>
            <p>
              Book a virtual consultation with our licensed pharmacists via WhatsApp or video call for
              medication reviews, drug interactions, and health guidance.
            </p>
            <ul className="svc-features">
              <li>WhatsApp & video consultations</li>
              <li>Medication review & counseling</li>
              <li>Drug interaction checks</li>
              <li>Chronic disease medication management</li>
            </ul>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`}
              className="svc-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book via WhatsApp →
            </a>
          </div>

          <div className="svc-card reveal">
            <span className="svc-tag">Logistics</span>
            <span className="svc-icon" style={{ color: "var(--green)", display: "flex" }}><Truck size={32} /></span>
            <h3>Doorstep Delivery</h3>
            <p>
              Fast, reliable delivery of your medicines across Abuja and Lagos with temperature-controlled
              packaging for sensitive medications.
            </p>
            <ul className="svc-features">
              <li>Abuja & Lagos coverage</li>
              <li>24–48 hour delivery guarantee</li>
              <li>Cold-chain for sensitive medicines</li>
              <li>SMS & WhatsApp delivery alerts</li>
            </ul>
            <Link href="/order" className="svc-link">
              Order for Delivery →
            </Link>
          </div>

          <div className="svc-card reveal">
            <span className="svc-tag">Enterprise</span>
            <span className="svc-icon" style={{ color: "var(--green)", display: "flex" }}><Building size={32} /></span>
            <h3>Corporate Health Plans</h3>
            <p>
              Tailored pharmaceutical supply and managed healthcare packages for businesses, NGOs, schools
              and organisations with dedicated account management.
            </p>
            <ul className="svc-features">
              <li>Bulk medication procurement</li>
              <li>Staff health management</li>
              <li>Monthly billing & reporting</li>
              <li>On-site pharmacy pop-ups</li>
            </ul>
            <a href={`mailto:${BUSINESS_EMAIL}`} className="svc-link">
              Get a Quote →
            </a>
          </div>

          <div className="svc-card reveal">
            <span className="svc-tag">AI-Powered</span>
            <span className="svc-icon" style={{ color: "var(--green)", display: "flex" }}><Bot size={32} /></span>
            <h3>Smart Health Assistant</h3>
            <p>
              Our 24/7 AI-powered WhatsApp assistant answers medication queries, sends refill reminders,
              checks drug interactions, and guides you through ordering.
            </p>
            <ul className="svc-features">
              <li>24/7 medication Q&A</li>
              <li>Refill & dosage reminders</li>
              <li>Drug interaction alerts</li>
              <li>Order status updates</li>
            </ul>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`}
              className="svc-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Try It Now →
            </a>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION (DYNAMIC) */}
      <section id="products">
        <div className="products-top">
          <div>
            <div className="section-label reveal">Our Catalog</div>
            <h2 className="section-title reveal">
              NAFDAC-verified <span>products</span>
              <br />
              you can trust
            </h2>
          </div>
          <div className="prod-filters reveal">
            {["all", "prescription", "otc", "supplements", "diagnostics", "paediatrics"].map((cat) => (
              <button
                key={cat}
                className={`pf-btn ${selectedCat === cat ? "active" : ""}`}
                onClick={() => setSelectedCat(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid" id="productsGrid">
          {filteredProducts.map((product) => {
            const icon = getProductIcon(product.category, product.name);
            const imageUrl = getProductImageUrl(product.image_url);
            return (
              <div key={product.id} className="prod-card reveal" data-cat={product.category.toLowerCase()}>
                <div className="prod-image-container" style={{ position: "relative", width: "100%", height: "160px", marginBottom: "1rem", borderRadius: "12px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span className="prod-emoji" style={{ display: "inline-flex", color: "var(--green)" }}>{icon}</span>
                  )}
                </div>
                <div className="prod-cat">{product.category}</div>
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <div className="prod-footer">
                  <span className="prod-price">₦{Number(product.price).toLocaleString()}</span>
                  {product.requires_prescription ? (
                    <span className="prod-rx">Rx Required</span>
                  ) : (
                    <span className="prod-otc">OTC</span>
                  )}
                </div>
                <Link href={`/order?product=${product.id}`} className="prod-order" style={{ textAlign: "center" }}>
                  Order Now →
                </Link>
              </div>
            );
          })}
        </div>

        <div className="products-cta reveal" style={{ marginTop: "3rem" }}>
          <Link href="/order" className="btn btn-primary" style={{ fontSize: "1rem", padding: "1rem 2.5rem" }}>
            Browse Full Catalog & Order →
          </Link>
        </div>
      </section>

      {/* E-PHARMACY WORKFLOW */}
      <section id="epharmacy">
        <div className="section-label reveal">How It Works</div>
        <h2 className="section-title reveal">
          Getting your medicines has <span>never been easier</span>
        </h2>

        <div className="eph-layout">
          <div className="eph-steps reveal">
            <div className="eph-step">
              <div className="eph-step-left">
                <div className="step-circle">01</div>
                <div className="step-line"></div>
              </div>
              <div className="eph-step-body">
                <div className="eph-step-icon" style={{ color: "var(--green)", display: "flex" }}><Users size={20} /></div>
                <h4>Create Your Account</h4>
                <p>
                  Sign up in under 2 minutes. Your personal health data is encrypted and NDPR-protected at all
                  times.
                </p>
                <div className="eph-features">
                  <span className="eph-feature">No credit card required to sign up</span>
                  <span className="eph-feature">Secure Nigerian phone number verification</span>
                </div>
              </div>
            </div>
            <div className="eph-step">
              <div className="eph-step-left">
                <div className="step-circle">02</div>
                <div className="step-line"></div>
              </div>
              <div className="eph-step-body">
                <div className="eph-step-icon" style={{ color: "var(--green)", display: "flex" }}><ShoppingCart size={20} /></div>
                <h4>Browse & Add to Cart</h4>
                <p>
                  Search 500+ medicines by name or category. For OTC items, add directly to cart. For
                  prescription medicines, you&apos;ll upload your prescription in the next step.
                </p>
                <div className="eph-features">
                  <span className="eph-feature">Filter by category, price, or availability</span>
                  <span className="eph-feature">See real-time stock levels</span>
                </div>
              </div>
            </div>
            <div className="eph-step">
              <div className="eph-step-left">
                <div className="step-circle">03</div>
                <div className="step-line"></div>
              </div>
              <div className="eph-step-body">
                <div className="eph-step-icon" style={{ color: "var(--green)", display: "flex" }}><UploadCloud size={20} /></div>
                <h4>Upload Your Prescription</h4>
                <p>
                  Take a clear photo of your doctor&apos;s prescription and upload it directly. Our licensed
                  pharmacist reviews and verifies it before any dispensing.
                </p>
                <div className="eph-features">
                  <span className="eph-feature">Accepts JPG, PNG or PDF format</span>
                  <span className="eph-feature">Pharmacist review within 2 hours</span>
                </div>
              </div>
            </div>
            <div className="eph-step">
              <div className="eph-step-left">
                <div className="step-circle">04</div>
                <div className="step-line"></div>
              </div>
              <div className="eph-step-body">
                <div className="eph-step-icon" style={{ color: "var(--green)", display: "flex" }}><CreditCard size={20} /></div>
                <h4>Pay Securely</h4>
                <p>
                  Pay via bank transfer, card, or choose Pay-on-Delivery. All transactions are secured with
                  256-bit encryption.
                </p>
                <div className="eph-features">
                  <span className="eph-feature">Bank transfer, card, or cash on delivery</span>
                  <span className="eph-feature">Instant payment confirmation via SMS</span>
                </div>
              </div>
            </div>
            <div className="eph-step">
              <div className="eph-step-left">
                <div className="step-circle">05</div>
              </div>
              <div className="eph-step-body">
                <div className="eph-step-icon" style={{ color: "var(--green)", display: "flex" }}><Truck size={20} /></div>
                <h4>Fast Doorstep Delivery</h4>
                <p>
                  Your order is carefully packed and dispatched. Track delivery in real-time via WhatsApp.
                  Delivered within 24–48 hours across Abuja and Lagos.
                </p>
                <div className="eph-features">
                  <span className="eph-feature">Live tracking via WhatsApp updates</span>
                  <span className="eph-feature">Temperature-controlled packaging</span>
                </div>
              </div>
            </div>
          </div>

          <div className="eph-right reveal">
            <div className="eph-card">
              <div className="eph-card-header" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="eph-card-icon" style={{ display: "flex", color: "var(--green)", background: "rgba(0, 192, 127, 0.08)", padding: "8px", borderRadius: "10px" }}><Lock size={18} /></div>
                <h4>Prescription Verification</h4>
              </div>
              <p>Every prescription is reviewed by a PCN-licensed pharmacist before dispensing — no exceptions.</p>
              <ul>
                <li>Doctor&apos;s details verified</li>
                <li>Drug-disease interaction check</li>
                <li>Dosage and duration review</li>
                <li>Counterfeit medicine detection</li>
              </ul>
            </div>
            <div className="eph-card">
              <div className="eph-card-header" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="eph-card-icon" style={{ display: "flex", color: "var(--green)", background: "rgba(0, 192, 127, 0.08)", padding: "8px", borderRadius: "10px" }}><Package size={18} /></div>
                <h4>Order Tracking</h4>
              </div>
              <p>Know exactly where your medicines are at every step — from pharmacist review to your front door.</p>
              <ul>
                <li>Order confirmed → SMS alert</li>
                <li>Pharmacist approved → WhatsApp alert</li>
                <li>Out for delivery → Live update</li>
                <li>Delivered → Confirmation request</li>
              </ul>
            </div>
            <div className="eph-card">
              <div className="eph-card-header" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="eph-card-icon" style={{ display: "flex", color: "var(--green)", background: "rgba(0, 192, 127, 0.08)", padding: "8px", borderRadius: "10px" }}><Clock size={18} /></div>
                <h4>Refill Reminders</h4>
              </div>
              <p>Never run out of your chronic medication again. Set up automatic refill reminders for your regular prescriptions.</p>
              <ul>
                <li>Custom reminder schedules</li>
                <li>WhatsApp refill notifications</li>
                <li>One-tap reorder from history</li>
                <li>90-day supply options available</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="eph-cta-banner reveal">
          <div>
            <h3>Ready to experience pharmacy <span>the smart way?</span></h3>
            <p>Join thousands of Nigerians getting safe, verified medicines delivered to their door.</p>
          </div>
          <div className="cta-btns">
            <Link href="/order" className="btn btn-primary">Start Your Order <ArrowRight size={16} style={{ marginLeft: "4px" }} /></Link>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-white"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <MessageSquare size={16} /> WhatsApp Order
            </a>
          </div>
        </div>
      </section>

      {/* INVESTORS SECTION */}
      <section id="investor">
        <div className="section-label reveal">Investor Relations</div>
        <h2 className="section-title reveal">Invest in Nigeria&apos;s <span>healthcare future</span></h2>
        <div className="inv-layout">
          <div className="inv-points reveal">
            <div className="inv-point">
              <div className="inv-point-icon" style={{ display: "flex", color: "var(--green)" }}><TrendingUp size={20} /></div>
              <div>
                <h4>Massive & Underserved Market</h4>
                <p>Nigeria&apos;s pharmaceutical market is projected to exceed $2.5 billion by 2028, yet over 70% of Nigerians lack reliable access to quality medicines. O&apos;Chesta Pharma is positioned at the intersection of this gap with a scalable digital-first solution.</p>
              </div>
            </div>
            <div className="inv-point">
              <div className="inv-point-icon" style={{ display: "flex", color: "var(--green)" }}><Lock size={20} /></div>
              <div>
                <h4>Full Regulatory Compliance</h4>
                <p>We are fully registered with NAFDAC and licensed by the Pharmacists Council of Nigeria (PCN). Our NDPR-compliant data infrastructure eliminates regulatory risk for investors, providing a compliant platform from day one.</p>
              </div>
            </div>
            <div className="inv-point">
              <div className="inv-point-icon" style={{ display: "flex", color: "var(--green)" }}><Activity size={20} /></div>
              <div>
                <h4>Technology-Driven Competitive Moat</h4>
                <p>Our proprietary AI pharmacy assistant, digital prescription workflow, real-time inventory management, and integrated logistics create durable barriers to competition that deepen with every new patient and partner added to the platform.</p>
              </div>
            </div>
            <div className="inv-point">
              <div className="inv-point-icon" style={{ display: "flex", color: "var(--green)" }}><Globe size={20} /></div>
              <div>
                <h4>Pan-African Scalability</h4>
                <p>Our technology architecture is built to replicate across West Africa. After establishing dominance in Nigeria, our expansion roadmap targets Ghana, Kenya and Côte d&apos;Ivoire — markets with similar pharmaceutical access gaps.</p>
              </div>
            </div>
            <div className="inv-point">
              <div className="inv-point-icon" style={{ display: "flex", color: "var(--green)" }}><ShoppingCart size={20} /></div>
              <div>
                <h4>Diversified Revenue Streams</h4>
                <p>We generate revenue across four pillars: retail pharmacy margins, e-pharmacy delivery fees, corporate health plan subscriptions, and a forthcoming SaaS platform for independent pharmacy operators across Nigeria.</p>
              </div>
            </div>
            <div className="inv-point">
              <div className="inv-point-icon" style={{ display: "flex", color: "var(--green)" }}><Award size={20} /></div>
              <div>
                <h4>Experienced Founding Team</h4>
                <p>O&apos;Chesta Pharma is founded and led by licensed pharmacists and healthcare technologists with deep domain expertise, regulatory relationships, and a shared mission to transform African healthcare access.</p>
              </div>
            </div>
            <a href={`mailto:${BUSINESS_EMAIL}`} className="btn btn-primary" style={{ marginTop: "0.5rem", display: "inline-flex", alignItems: "center", gap: "6px" }}><Mail size={16} /> Request Pitch Deck</a>
          </div>

          <div className="inv-right reveal">
            <div className="inv-metric-card">
              <h5>Addressable Market</h5>
              <div className="inv-metric-val">$2.5B+</div>
              <div className="inv-metric-sub">Nigeria pharma market by 2028 (WHO)</div>
              <div className="market-bar">
                <p>Our projected market capture — Year 3</p>
                <div className="bar-track"><div className="bar-fill" style={{ width: "18%" }}></div></div>
              </div>
            </div>
            <div className="inv-metric-card">
              <h5>Current Raise</h5>
              <div className="inv-metric-val">₦50M</div>
              <div className="inv-metric-sub">Seed round — equity-based</div>
              <hr className="inv-divider" />
              <div className="inv-breakdown">
                <div className="inv-row"><span>Technology & Platform</span><span>35%</span></div>
                <div className="inv-row"><span>Inventory & Supply Chain</span><span>30%</span></div>
                <div className="inv-row"><span>Team & Operations</span><span>20%</span></div>
                <div className="inv-row"><span>Marketing & Growth</span><span>15%</span></div>
              </div>
            </div>
            <div className="inv-metric-card">
              <h5>Revenue Model</h5>
              <div className="inv-metric-val" style={{ fontSize: "1.4rem" }}>Multi-Stream</div>
              <hr className="inv-divider" />
              <div className="inv-breakdown">
                <div className="inv-row"><span>Retail Pharmacy Margins</span><span>40%</span></div>
                <div className="inv-row"><span>E-Pharmacy Delivery Fees</span><span>25%</span></div>
                <div className="inv-row"><span>Corporate Health Plans</span><span>25%</span></div>
                <div className="inv-row"><span>SaaS Licensing (2026)</span><span>10%</span></div>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", marginTop: "1.5rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Phone size={16} /> Schedule Investor Call
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact">
        <div className="section-label reveal">Get In Touch</div>
        <h2 className="section-title reveal">We&apos;d love to <span>hear from you</span></h2>
        <div className="contact-layout">
          <div className="reveal">
            <p className="contact-intro">Whether you&apos;re a patient needing medicines, a corporate client, a healthcare partner, or an investor — reach out and we&apos;ll respond within 24 hours.</p>
            <div className="contact-items">
              <div className="contact-item">
                <div className="c-icon" style={{ display: "flex", color: "var(--green)" }}><MapPin size={20} /></div>
                <div className="c-info">
                  <h4>Our Address</h4>
                  <p>35 Durban Street, Off Ademola Adetukumbo Crescent<br />Wuse II, Abuja, Nigeria</p>
                  <a href="https://maps.google.com/?q=Wuse+II+Abuja+Nigeria" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.82rem", marginTop: "6px", display: "inline-block" }}>View on Google Maps →</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="c-icon" style={{ display: "flex", color: "var(--green)" }}><Mail size={20} /></div>
                <div className="c-info">
                  <h4>Email Us</h4>
                  <a href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a>
                  <p style={{ fontSize: "0.8rem", marginTop: "3px" }}>We reply within 24 hours</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="c-icon" style={{ display: "flex", color: "var(--green)" }}><MessageSquare size={20} /></div>
                <div className="c-info">
                  <h4>WhatsApp</h4>
                  <a href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`} target="_blank" rel="noopener noreferrer">{BUSINESS_PHONE}</a>
                  <p style={{ fontSize: "0.8rem", marginTop: "3px" }}>Fastest response — typically under 1 hour</p>
                  <div className="social-row">
                    <a href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`} target="_blank" rel="noopener noreferrer" className="social-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><MessageSquare size={14} /> Open WhatsApp</a>
                    <a href={`mailto:${BUSINESS_EMAIL}`} className="social-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Mail size={14} /> Send Email</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="hours-card">
              <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}><Clock size={16} style={{ color: "var(--green)" }} /> Opening Hours</h4>
              <div className="hours-row"><span>Monday – Friday</span><span className="open">8:00am – 8:00pm</span></div>
              <div className="hours-row"><span>Saturday</span><span className="open">9:00am – 6:00pm</span></div>
              <div className="hours-row"><span>Sunday</span><span style={{ color: "var(--muted)" }}>10:00am – 4:00pm</span></div>
              <div className="hours-row"><span>Emergency Line</span><span className="open">24/7 via WhatsApp</span></div>
            </div>

            <div className="map-embed">
              <span style={{ fontSize: "2rem", display: "flex", color: "var(--green)", marginBottom: "8px" }}><MapPin size={32} /></span>
              <p>35 Durban Street, Wuse II, Abuja</p>
              <a href="https://maps.google.com/?q=Wuse+II+Abuja+Nigeria" target="_blank" rel="noopener noreferrer">Open in Google Maps →</a>
            </div>
          </div>

          <div className="reveal">
            <form className="contact-form" id="contactForm" ref={formRef} onSubmit={handleContactSubmit}>
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input type="text" id="firstName" placeholder="John" required /></div>
                <div className="form-group"><label>Last Name</label><input type="text" id="lastName" placeholder="Doe" required /></div>
              </div>
              <div className="form-group"><label>Email Address</label><input type="email" id="userEmail" placeholder="john@email.com" required /></div>
              <div className="form-group"><label>Phone Number</label><input type="tel" id="userPhone" placeholder="+234 800 000 0000" /></div>
              <div className="form-group">
                <label>I am a...</label>
                <select id="userType">
                  <option>Patient / Customer</option>
                  <option>Healthcare Professional</option>
                  <option>Corporate Client</option>
                  <option>Investor</option>
                  <option>Partner / Supplier</option>
                  <option>Media / Press</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select id="userSubject">
                  <option>Medicine Order Enquiry</option>
                  <option>Prescription Help</option>
                  <option>Delivery Query</option>
                  <option>Corporate Health Plan</option>
                  <option>Investment / Partnership</option>
                  <option>General Enquiry</option>
                </select>
              </div>
              <div className="form-group"><label>Message</label><textarea id="userMessage" placeholder="Tell us how we can help you..." required></textarea></div>
              <p className="form-note">By submitting this form, you agree to our privacy policy. Your data is protected under NDPR. We never share patient information with third parties.</p>
              <button type="submit" className="btn btn-primary" id="submitBtn" style={{ width: "100%", justifyContent: "center", fontSize: "1rem", padding: "1rem" }} disabled={isSending}>
                {isSending ? "Sending..." : "Send Message →"}
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <MessageSquare size={16} /> Prefer WhatsApp? Chat with us directly
              </a>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="storefront-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#hero" className="logo" style={{ color: "var(--paper)" }}>
              <span className="logo-dot"></span>O&apos;Chesta Pharma
            </a>
            <p>Nigeria&apos;s tech-powered pharmacy. NAFDAC-verified medicines, licensed pharmacists, delivered to your door across Nigeria.</p>
            <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <a href={`mailto:${BUSINESS_EMAIL}`} style={{ color: "rgba(245,243,238,0.5)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={14} /> {BUSINESS_EMAIL}
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgba(245,243,238,0.5)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <MessageSquare size={14} /> {BUSINESS_PHONE}
              </a>
              <span style={{ color: "rgba(245,243,238,0.4)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={14} /> 35 Durban Street, Wuse II, Abuja</span>
            </div>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Our Services</a></li>
              <li><a href="#products">Products</a></li>
              <li><a href="#investor">Investors</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Platform</h5>
            <ul>
              <li><Link href="/order">Order Medicine</Link></li>
              <li><Link href="/order">Upload Prescription</Link></li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telepharmacy
                </a>
              </li>
              <li><Link href="/order">Track Order</Link></li>
              <li><Link href="/admin">Admin Portal</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Legal & Support</h5>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">NDPR Compliance</a></li>
              <li><a href="#">Returns Policy</a></li>
              <li><a href={`mailto:${BUSINESS_EMAIL}`}>Email Support</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} O&apos;Chesta Pharma Ltd. All rights reserved. Registered with NAFDAC & PCN Nigeria.
            <br />
            Superintendent Pharmacist: Pharm. Oche Peter Obiabo
          </p>
          <div className="badges">
            <span className="badge">NAFDAC</span>
            <span className="badge">PCN Licensed</span>
            <span className="badge">NDPR Compliant</span>
            <span className="badge">SSL Secured</span>
          </div>
        </div>
      </footer>

      {/* LICENSE LIGHTBOX MODAL */}
      {licenseModal.isOpen && (
        <div
          className="license-modal-overlay"
          onClick={() => setLicenseModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div
            className="license-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="license-modal-header">
              <h3>{licenseModal.title}</h3>
              <button
                className="license-modal-close"
                onClick={() => setLicenseModal(prev => ({ ...prev, isOpen: false }))}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="license-modal-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={licenseModal.imageSrc}
                alt={licenseModal.title}
                className="license-modal-img"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
