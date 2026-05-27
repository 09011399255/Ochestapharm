"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { WHATSAPP_PHONE_NUMBER, DELIVERY_FEE } from "@/lib/constants";
import {
  AlertTriangle,
  Pill,
  HeartPulse,
  Stethoscope,
  Leaf,
  Thermometer,
  Baby,
  Droplet,
  Layers,
  Activity,
  Sparkles,
  Syringe,
  Search,
  Check,
  CheckCircle,
  X,
  FileText,
  UploadCloud,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  MapPin,
  CreditCard,
  Building,
  DollarSign,
  Truck,
  Phone,
  Mail,
  Package
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

interface CartItem {
  product: Product;
  quantity: number;
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
    return <Pill size={24} style={{ color: 'var(--green)' }} />;
  if (n.includes('diabete') || n.includes('metformin') || n.includes('glibenclamide') || n.includes('glucometer') || n.includes('insulin')) 
    return <HeartPulse size={24} style={{ color: '#ef4444' }} />;
  if (n.includes('blood pressure') || n.includes('amlodipine') || n.includes('lisinopril') || n.includes('losartan') || n.includes('atenolol') || n.includes('cardio') || n.includes('heart')) 
    return <Stethoscope size={24} style={{ color: '#0d3b6e' }} />;
  if (n.includes('vitamin c') || n.includes('zinc') || n.includes('folic') || n.includes('supplement') || n.includes('multivitamin') || n.includes('mineral')) 
    return <Leaf size={24} style={{ color: '#10b981' }} />;
  if (n.includes('fever') || n.includes('pain') || n.includes('paracetamol') || n.includes('ibuprofen') || n.includes('diclofenac')) 
    return <Thermometer size={24} style={{ color: '#f59e0b' }} />;
  if (n.includes('child') || n.includes('baby') || n.includes('infant') || n.includes('paediatric') || n.includes('syrup')) 
    return <Baby size={24} style={{ color: '#3b82f6' }} />;
  if (n.includes('malaria') || n.includes('test') || n.includes('kit') || n.includes('device') || n.includes('monitor') || n.includes('oximeter')) 
    return <Droplet size={24} style={{ color: '#ef4444' }} />;
  if (n.includes('skin') || n.includes('cream') || n.includes('antifungal') || n.includes('clotrimazole') || n.includes('ointment')) 
    return <Layers size={24} style={{ color: '#8b5cf6' }} />;
  if (n.includes('anxiolytic') || n.includes('antidepressant') || n.includes('sleep') || n.includes('mental') || n.includes('brain')) 
    return <Activity size={24} style={{ color: '#6366f1' }} />;
  if (n.includes('maternal') || n.includes('pregnacare') || n.includes('pregnant')) 
    return <Sparkles size={24} style={{ color: '#ec4899' }} />;
  if (n.includes('digestive') || n.includes('stomach') || n.includes('acid') || n.includes('laxative') || n.includes('dewormer') || n.includes('gastro')) 
    return <Activity size={24} style={{ color: '#10b981' }} />;
  if (n.includes('inject') || n.includes('fluid') || n.includes('ampoule') || n.includes('syringe')) 
    return <Syringe size={24} style={{ color: '#ef4444' }} />;

  if (cat.includes('presc')) return <Pill size={24} style={{ color: 'var(--green)' }} />;
  if (cat.includes('supp')) return <Leaf size={24} style={{ color: '#10b981' }} />;
  if (cat.includes('otc')) return <Thermometer size={24} style={{ color: '#f59e0b' }} />;
  if (cat.includes('paed') || cat.includes('child')) return <Baby size={24} style={{ color: '#3b82f6' }} />;
  if (cat.includes('diag') || cat.includes('test')) return <Droplet size={24} style={{ color: '#ef4444' }} />;

  return <Pill size={24} style={{ color: 'var(--green)' }} />;
}

function getProductImageUrl(imageUrl: string | undefined | null) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const { data } = supabase.storage.from("product-images").getPublicUrl(imageUrl);
  return data.publicUrl;
}

function generateOrderId(): string {
  return `OCP-${Math.floor(100000 + Math.random() * 900000)}`;
}

function generateRandomString(): string {
  return Math.random().toString(36).substring(2);
}

function OrderPageContent() {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get("product");

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [productId: string]: CartItem }>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  // Step 2: Prescription state
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionUrl, setPrescriptionUrl] = useState("");
  const [uploadingRx, setUploadingRx] = useState(false);

  // Step 3: Details form
  const [details, setDetails] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "Lagos", // Default city
    state: "Lagos", // Default state matching HTML
    notes: "",
  });

  // Step 4: Payment state
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // Prefill details if user is logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setDetails((prev) => ({
          ...prev,
          email: session.user.email || prev.email,
          firstName: meta.firstName || meta.first_name || prev.firstName,
          lastName: meta.lastName || meta.last_name || prev.lastName,
          phone: meta.phone || prev.phone,
        }));
      }
    });
  }, []);

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
          // Handle preselection
          if (preselectedProductId) {
            const matched = data.find((p) => p.id === preselectedProductId);
            if (matched) {
              setCart({ [matched.id]: { product: matched, quantity: 1 } });
            }
          }
        } else {
          setProducts(FALLBACK_PRODUCTS);
          if (preselectedProductId) {
            const matched = FALLBACK_PRODUCTS.find((p) => p.id === preselectedProductId);
            if (matched) {
              setCart({ [matched.id]: { product: matched, quantity: 1 } });
            }
          }
        }
      } catch (err) {
        console.error("Error loading products for order catalog, using fallback list:", err);
        setProducts(FALLBACK_PRODUCTS);
        if (preselectedProductId) {
          const matched = FALLBACK_PRODUCTS.find((p) => p.id === preselectedProductId);
          if (matched) {
            setCart({ [matched.id]: { product: matched, quantity: 1 } });
          }
        }
      }
    }
    loadProducts();
  }, [preselectedProductId]);

  // Totals calculations
  const cartItemsArray = Object.values(cart);
  const cartCount = cartItemsArray.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItemsArray.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal + DELIVERY_FEE;

  // Rx validation check
  const requiresRx = cartItemsArray.some((item) => item.product.requires_prescription);

  const handleQtyChange = (product: Product, delta: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (!updated[product.id]) {
        if (delta > 0) {
          updated[product.id] = { product, quantity: delta };
        }
      } else {
        const newQty = updated[product.id].quantity + delta;
        if (newQty <= 0) {
          delete updated[product.id];
        } else {
          updated[product.id].quantity = newQty;
        }
      }
      return updated;
    });
  };

  const handleRxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPrescriptionFile(file);
    setUploadingRx(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${generateRandomString()}.${fileExt}`;
      const filePath = `prescriptions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("prescriptions")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("prescriptions").getPublicUrl(filePath);

      setPrescriptionUrl(publicUrl);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Prescription upload failed:", errMsg);
      alert("Failed to upload prescription to storage. We will allow you to proceed; please send it to us on WhatsApp after ordering.");
      setPrescriptionUrl("will-send-via-whatsapp");
    } finally {
      setUploadingRx(false);
    }
  };

  const clearRxFile = () => {
    setPrescriptionFile(null);
    setPrescriptionUrl("");
  };

  const goTo = (step: number) => {
    if (step === 2 && cartCount === 0) {
      alert("Please add medicines to your cart first.");
      return;
    }
    if (step === 3 && requiresRx && !prescriptionUrl) {
      alert("Please upload a prescription for the prescription items in your cart.");
      return;
    }
    if (step === 4) {
      if (!details.firstName || !details.lastName || !details.phone || !details.address || !details.city) {
        alert("Please fill in all required delivery fields.");
        return;
      }
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToReview = () => {
    if (!details.firstName || !details.lastName || !details.phone || !details.address || !details.city) {
      alert("Please fill in all required delivery fields.");
      return;
    }
    goTo(4);
  };

  const placeOrder = async () => {
    setPlacingOrder(true);
    const orderId = generateOrderId();

    const orderPayload = {
      id: orderId,
      customer_name: `${details.firstName} ${details.lastName}`,
      customer_phone: details.phone,
      total_amount: total,
      status: "pending",
      items: {
        cart: cartItemsArray.map((item) => ({
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        customer_email: details.email || `${details.firstName.toLowerCase()}@ochep-guest.com`,
        delivery_address: details.address,
        delivery_city: details.city,
        prescription_url: prescriptionUrl || null,
        subtotal,
        delivery_fee: DELIVERY_FEE,
        total,
        payment_method: paymentMethod,
      }
    };

    // Construct the WhatsApp message
    const itemsStr = cartItemsArray.map((item) => `- ${item.product.name} (x${item.quantity})`).join("\n");
    const rxStr = prescriptionUrl === "will-send-via-whatsapp" ? "\n*Note: I will send my prescription now*" : (prescriptionUrl ? `\nPrescription: ${prescriptionUrl}` : "");
    const message = `New Order ${orderId}\nCustomer: ${details.firstName} ${details.lastName}\nPhone: ${details.phone}\nAddress: ${details.address}, ${details.city}\nItems:\n${itemsStr}${rxStr}\nTotal: ₦${total.toLocaleString()}`;

    try {
      // 1. Insert order record
      const { error } = await supabase.from("orders").insert([orderPayload]);
      if (error) throw error;

      // 2. Try to update stock level for each product (optional best-effort)
      for (const item of cartItemsArray) {
        if (item.product.stock_qty && !item.product.id.startsWith("1")) { // Don't deduct from fallback IDs
          const newQty = Math.max(0, item.product.stock_qty - item.quantity);
          await supabase
            .from("products")
            .update({ stock_qty: newQty })
            .eq("id", item.product.id);
        }
      }

      setPlacedOrderId(orderId);
      setCurrentStep(5); // Success step
      setCart({});

      // 3. Open WhatsApp instantly
      window.open(`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Order submission failed:", errMsg);
      alert("Failed to submit order database record. Let's redirect you to submit via WhatsApp!");
      window.open(`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    } finally {
      setPlacingOrder(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === "All" || p.category.toLowerCase() === selectedCat.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="order-page">
      <nav className="order-nav">
        <Link href="/" className="logo">
          <span className="logo-dot"></span>O&apos;Chesta Pharma
        </Link>
        <Link href="/" className="back-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>

      <div className="page">
        <h1 className="page-title">Order Medicines</h1>
        <p className="page-sub">Safe, verified, delivered to your door within 24–48 hours.</p>

        {currentStep <= 4 && (
          <div className="steps-bar">
            <div className={`step-tab ${currentStep === 1 ? "active" : currentStep > 1 ? "done" : ""}`} onClick={() => goTo(1)}>
              <span className="step-num-badge" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{currentStep > 1 ? <Check size={12} /> : "1"}</span>Browse & Select
            </div>
            <div className={`step-tab ${currentStep === 2 ? "active" : currentStep > 2 ? "done" : ""}`} onClick={() => goTo(2)}>
              <span className="step-num-badge" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{currentStep > 2 ? <Check size={12} /> : "2"}</span>Prescription
            </div>
            <div className={`step-tab ${currentStep === 3 ? "active" : currentStep > 3 ? "done" : ""}`} onClick={() => goTo(3)}>
              <span className="step-num-badge" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{currentStep > 3 ? <Check size={12} /> : "3"}</span>Your Details
            </div>
            <div className={`step-tab ${currentStep === 4 ? "active" : currentStep > 4 ? "done" : ""}`} onClick={() => goTo(4)}>
              <span className="step-num-badge" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{currentStep > 4 ? <Check size={12} /> : "4"}</span>Review & Pay
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="panel active" id="panel1">
            <div className="order-layout">
              <div>
                <div className="search-bar" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Search size={18} style={{ position: "absolute", left: "1.25rem", color: "var(--muted)" }} />
                  <input
                    className="search-input"
                    type="text"
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: "2.8rem" }}
                  />
                </div>
                <div className="cat-filter">
                  {["All", "Prescription", "OTC", "Supplements", "Diagnostics", "Paediatrics"].map((cat) => (
                    <button
                      key={cat}
                      className={`cat-btn ${selectedCat === cat ? "active" : ""}`}
                      onClick={() => setSelectedCat(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="catalog-grid">
                  {filteredProducts.map((p) => {
                    const icon = getProductIcon(p.category, p.name);
                    const qtyInCart = cart[p.id]?.quantity || 0;
                    const imageUrl = getProductImageUrl(p.image_url);
                    return (
                      <div key={p.id} className={`med-card ${qtyInCart > 0 ? "selected" : ""}`}>
                        <div className="med-image-container" style={{ position: "relative", width: "100%", height: "100px", marginBottom: "0.75rem", borderRadius: "10px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)" }}>
                          {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span className="med-emoji" style={{ display: "inline-flex" }}>{icon}</span>
                          )}
                        </div>
                        <div className="med-cat">{p.category.toUpperCase()}</div>
                        <div className="med-name">{p.name}</div>
                        <div className="med-desc">{p.description}</div>
                        <div className="med-price">₦{Number(p.price).toLocaleString()}</div>
                        {p.requires_prescription && <span className="med-rx">Rx</span>}
                        <div className="qty-control">
                          <button className="qty-btn" onClick={(e) => { e.stopPropagation(); handleQtyChange(p, -1); }}>-</button>
                          <span className="qty-num">{qtyInCart}</span>
                          <button className="qty-btn" onClick={(e) => { e.stopPropagation(); handleQtyChange(p, 1); }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="cart-box">
                <div className="cart-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Your Cart</span>
                  <span className="cart-badge" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><ShoppingBag size={14} /> {cartCount}</span>
                </div>
                <div className="cart-items">
                  {cartItemsArray.length === 0 ? (
                    <div className="cart-empty">No items yet.<br />Add medicines from the catalog.</div>
                  ) : (
                    cartItemsArray.map((item) => (
                      <div key={item.product.id} className="cart-item">
                        <div>
                          <div className="cart-item-name">{item.product.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>x{item.quantity}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="cart-item-price">₦{(item.product.price * item.quantity).toLocaleString()}</span>
                          <button className="cart-remove" onClick={() => handleQtyChange(item.product, -item.quantity)} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cartItemsArray.length > 0 && (
                  <div className="cart-total"><span>Total</span><span>₦{subtotal.toLocaleString()}</span></div>
                )}
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => goTo(2)}
                  disabled={cartCount === 0}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="panel active" id="panel2">
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>Upload Prescription</h3>
              <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
                Required for prescription medicines. Our pharmacist will verify before dispensing.
              </p>
              {!prescriptionUrl ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="rx-box" onClick={() => document.getElementById("rxFile")?.click()} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", border: "2px dashed var(--border)", borderRadius: "16px", cursor: "pointer", transition: "0.2s" }}>
                    <UploadCloud size={40} style={{ color: "var(--green)", marginBottom: "1rem" }} />
                    <h4 style={{ fontWeight: 700, margin: "0 0 4px 0" }}>Tap to Upload Prescription</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>JPG, PNG or PDF — max 5MB</p>
                    <input
                      type="file"
                      id="rxFile"
                      accept=".jpg,.jpeg,.png,.pdf"
                      style={{ display: "none" }}
                      onChange={handleRxUpload}
                    />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <button
                      className="btn"
                      onClick={() => setPrescriptionUrl("will-send-via-whatsapp")}
                      style={{ background: "transparent", border: "1px dashed var(--green)", color: "var(--green-dark)", cursor: "pointer", padding: "0.6rem 1rem", borderRadius: "10px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      I will send the prescription via WhatsApp instead
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rx-uploaded show" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1rem", background: "var(--green-glow)", border: "1px solid rgba(0,192,127,0.2)", borderRadius: "12px" }}>
                  <FileText size={24} style={{ color: "var(--green)" }} />
                  <span style={{ fontWeight: 600, flex: 1 }}>
                    {prescriptionUrl === "will-send-via-whatsapp" ? "Prescription will be sent via WhatsApp" : (prescriptionFile ? prescriptionFile.name : "prescription.pdf")}
                  </span>
                  <button className="btn btn-ghost" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", background: "#fff" }} onClick={clearRxFile}>
                    Remove
                  </button>
                </div>
              )}
              {uploadingRx && (
                <div style={{ textAlign: "center", marginTop: "1rem", color: "var(--green-dark)", fontSize: "0.85rem" }}>
                  Uploading prescription...
                </div>
              )}
              <div style={{ background: "rgba(255,100,0,0.06)", border: "1px solid rgba(255,100,0,0.2)", borderRadius: "12px", padding: "1.25rem", marginTop: "2rem", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <AlertTriangle size={18} style={{ color: "#c45000", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "0.85rem", color: "#c45000", lineHeight: "1.6", margin: 0 }}>
                  <strong>Prescription Notice:</strong> For OTC items only, you may skip this step. Prescription medicines require a valid prescription from a licensed doctor.
                </p>
              </div>
              <div className="nav-btns" style={{ display: "flex", gap: "10px", marginTop: "2rem" }}>
                <button className="btn btn-ghost" onClick={() => goTo(1)} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><ArrowLeft size={16} /> Back</button>
                <button className="btn btn-primary" onClick={() => goTo(3)} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>Continue <ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="panel active" id="panel3">
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>Delivery Details</h3>
              <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>Where should we deliver your order?</p>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={details.firstName}
                    onChange={(e) => setDetails((d) => ({ ...d, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={details.lastName}
                    onChange={(e) => setDetails((d) => ({ ...d, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={details.phone}
                    onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))}
                    placeholder="+234 800 000 0000"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={details.email}
                    onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))}
                    placeholder="john@email.com"
                  />
                </div>
                <div className="form-group full">
                  <label>Delivery Address</label>
                  <input
                    type="text"
                    value={details.address}
                    onChange={(e) => setDetails((d) => ({ ...d, address: e.target.value }))}
                    placeholder="House number, street name, area"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={details.city}
                    onChange={(e) => setDetails((d) => ({ ...d, city: e.target.value }))}
                    placeholder="Lagos"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <select
                    value={details.state}
                    onChange={(e) => setDetails((d) => ({ ...d, state: e.target.value }))}
                  >
                    <option>Lagos</option>
                    <option>Abuja FCT</option>
                    <option>Rivers</option>
                    <option>Kano</option>
                    <option>Ogun</option>
                    <option>Oyo</option>
                    <option>Enugu</option>
                    <option>Delta</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Delivery Notes (optional)</label>
                  <input
                    type="text"
                    value={details.notes}
                    onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
                    placeholder="e.g. Call on arrival, leave at gate..."
                  />
                </div>
              </div>
              <div className="nav-btns" style={{ display: "flex", gap: "10px", marginTop: "2rem" }}>
                <button className="btn btn-ghost" onClick={() => goTo(2)} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><ArrowLeft size={16} /> Back</button>
                <button className="btn btn-primary" onClick={goToReview} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>Review Order <ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="panel active" id="panel4">
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "2rem" }}>Review Your Order</h3>
              <div className="confirm-box">
                <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}><ShoppingBag size={18} style={{ color: "var(--green)" }} /> Order Summary</h4>
                <div id="confirmItems">
                  {cartItemsArray.map((item) => (
                    <div key={item.product.id} className="confirm-row">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>₦{(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="confirm-row" style={{ marginTop: "0.5rem" }}>
                  <span>Delivery Fee</span>
                  <span>₦{DELIVERY_FEE.toLocaleString()}</span>
                </div>
                <div className="confirm-row">
                  <span>Total</span>
                  <span id="confirmTotal">₦{total.toLocaleString()}</span>
                </div>
              </div>
              <div className="confirm-box">
                <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}><MapPin size={18} style={{ color: "var(--green)" }} /> Delivery Address</h4>
                <div id="confirmAddress" style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: "1.7" }}>
                  <p style={{ fontWeight: 700, color: "var(--ink)", margin: "0 0 4px 0" }}>{details.firstName} {details.lastName}</p>
                  <p style={{ margin: "0 0 4px 0" }}>{details.address}</p>
                  <p style={{ margin: "0 0 8px 0" }}>{details.city}, {details.state}</p>
                  <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 4px 0" }}><Phone size={14} /> {details.phone}</p>
                  {details.email && <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 4px 0" }}><Mail size={14} /> {details.email}</p>}
                  {details.notes && <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 4px 0" }}><FileText size={14} /> Notes: {details.notes}</p>}
                </div>
              </div>
              <div className="confirm-box">
                <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}><CreditCard size={18} style={{ color: "var(--green)" }} /> Payment Method</h4>
                <div className="payment-options">
                  <div className={`pay-opt ${paymentMethod === "transfer" ? "selected" : ""}`} onClick={() => setPaymentMethod("transfer")}>
                    <span className="pay-icon" style={{ display: "flex" }}><Building size={24} /></span>
                    <p>Bank Transfer</p>
                  </div>
                  <div className={`pay-opt ${paymentMethod === "card" ? "selected" : ""}`} onClick={() => setPaymentMethod("card")}>
                    <span className="pay-icon" style={{ display: "flex" }}><CreditCard size={24} /></span>
                    <p>Card Payment</p>
                  </div>
                  <div className={`pay-opt ${paymentMethod === "pod" ? "selected" : ""}`} onClick={() => setPaymentMethod("pod")}>
                    <span className="pay-icon" style={{ display: "flex" }}><DollarSign size={24} /></span>
                    <p>Pay on Delivery</p>
                  </div>
                </div>
              </div>
              <div className="nav-btns" style={{ display: "flex", gap: "10px", marginTop: "2rem" }}>
                <button className="btn btn-ghost" onClick={() => goTo(3)} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><ArrowLeft size={16} /> Back</button>
                <button
                  className="btn btn-primary"
                  onClick={placeOrder}
                  style={{ padding: "1rem 2.5rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
                  disabled={placingOrder}
                >
                  {placingOrder ? "Placing Order..." : <><CheckCircle size={18} /> Place Order</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {currentStep === 5 && (
          <div className="panel active" id="panelSuccess">
            <div className="success-screen">
              <span className="success-icon" style={{ display: "inline-flex", color: "var(--green)" }}><CheckCircle size={64} /></span>
              <h2 style={{ marginTop: "1rem" }}>Order Placed Successfully!</h2>
              <p>Your order has been received and is being reviewed by our pharmacist. You&apos;ll receive confirmation shortly.</p>
              <div className="order-id" id="orderId">Order #{placedOrderId}</div>
              <div className="tracking-steps">
                <div className="track-step"><div className="track-dot" style={{ display: "inline-flex" }}><Check size={16} /></div><p>Order Placed</p></div>
                <div className="track-line"></div>
                <div className="track-step"><div className="track-dot" style={{ display: "inline-flex" }}><FileText size={16} /></div><p>Pharmacist Review</p></div>
                <div className="track-line"></div>
                <div className="track-step"><div className="track-dot" style={{ display: "inline-flex" }}><Package size={16} /></div><p>Packed</p></div>
                <div className="track-line"></div>
                <div className="track-step"><div className="track-dot" style={{ display: "inline-flex" }}><Truck size={16} /></div><p>On the Way</p></div>
                <div className="track-line"></div>
                <div className="track-step"><div className="track-dot" style={{ display: "inline-flex" }}><MapPin size={16} /></div><p>Delivered</p></div>
              </div>
              <Link href="/" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>Back to Home <ArrowRight size={16} /></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "#f5f3ee" }}>Loading Checkout Catalog...</div>}>
      <OrderPageContent />
    </Suspense>
  );
}
