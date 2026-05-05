// PaymentForm.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const refundPolicies = [
  "Returns accepted within 7 days of purchase.",
  "Items must be unused and in original packaging.",
  "Shipping fees are non-refundable.",
  "Refunds will be processed within 5-7 business days.",
  "Please provide proof of purchase with return request."
];

const PaymentForm = () => {
  const navigate = useNavigate();

  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [method, setMethod] = useState("COD");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [slipFile, setSlipFile] = useState(null);
  const [message, setMessage] = useState("");
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [discountInfo, setDiscountInfo] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token) {
      alert("⚠️ Please login to continue");
      navigate("/login");
      return;
    }
    fetchCartData();
    loadDiscountInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDiscountInfo = () => {
    try {
      const savedDiscount = localStorage.getItem("appliedDiscount");
      const savedSummary = localStorage.getItem("checkoutSummary");

      if (savedDiscount) {
        setDiscountInfo(JSON.parse(savedDiscount));
        console.log("✅ Loaded discount info:", JSON.parse(savedDiscount));
      }

      if (savedSummary) {
        console.log("✅ Loaded checkout summary:", JSON.parse(savedSummary));
      }
    } catch (error) {
      console.error("Error loading discount info:", error);
    }
  };

  const fetchCartData = async () => {
    try {
      console.log("🔥 Fetching cart data for payment...");
      const response = await axios.get(`${API_BASE_URL}/cart/my-cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ Cart data received:", response.data);
      if (response.data && response.data.cart) {
        setCartData(response.data.cart);
      } else {
        // Accept direct array as fallback if your API returns differently
        if (Array.isArray(response.data)) {
          setCartData({ items: response.data });
        } else {
          throw new Error("No cart data found");
        }
      }
    } catch (error) {
      console.error("❌ Error fetching cart:", error.response?.data || error.message);
      alert("Failed to load cart data. Please try again.");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => setSlipFile(e.target.files[0] || null);

  const calculateOrderTotals = () => {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      return {
        subtotal: 0,
        discountAmount: 0,
        discountCode: null,
        tax: 0,
        shippingFee: 0,
        totalAmount: 0,
        items: []
      };
    }

    // Sum using defensive property access (some APIs use different names)
    const subtotal = cartData.items.reduce((sum, item) => {
      const price = item.productId?.Price ?? item.productId?.price ?? item.price ?? 0;
      const quantity = item.quantity ?? 0;
      return sum + price * quantity;
    }, 0);

    let discountAmount = 0;
    let discountCode = null;

    if (discountInfo) {
      discountCode = discountInfo.code;
      if (discountInfo.type === "percentage") {
        discountAmount = (subtotal * discountInfo.value) / 100;
      } else {
        discountAmount = Math.min(discountInfo.value, subtotal);
      }
      console.log("💰 Discount applied:", discountAmount);
    }

    const taxableAmount = subtotal - discountAmount;
    const tax = taxableAmount * 0.1; // 10%
    const shippingFee = 300;
    const totalAmount = subtotal - discountAmount + tax + shippingFee;

    const items = cartData.items.map((item) => ({
      name: item.productId?.product_name ?? item.productId?.name ?? item.name ?? "Unknown Product",
      price: item.productId?.Price ?? item.productId?.price ?? item.price ?? 0,
      quantity: item.quantity ?? 0,
      productId: item.productId?._id ?? item.productId
    }));

    return {
      subtotal,
      discountAmount,
      discountCode,
      tax,
      shippingFee,
      totalAmount,
      items
    };
  };

  const performSubmit = async () => {
    setSubmitting(true);
    setMessage("");
    setReceiptUrl(null);

    try {
      const orderTotals = calculateOrderTotals();

      if (orderTotals.items.length === 0) {
        alert("❌ Your cart is empty!");
        setSubmitting(false);
        return;
      }

      console.log("🛒 Creating order with data:", orderTotals);

      const orderPayload = {
        userId,
        items: orderTotals.items,
        subtotal: orderTotals.subtotal,
        discountAmount: orderTotals.discountAmount,
        discountCode: orderTotals.discountCode,
        tax: orderTotals.tax,
        shippingFee: orderTotals.shippingFee,
        totalAmount: orderTotals.totalAmount,
        status: "Pending"
      };

      console.log("📤 Sending order payload:", JSON.stringify(orderPayload, null, 2));

      let orderResponse = null;

      // Try /api/orders first, fallback to /orders
      const orderEndpoints = [`${API_BASE_URL}/api/orders`, `${API_BASE_URL}/orders`];

      for (let i = 0; i < orderEndpoints.length; i++) {
        try {
          console.log("📤 POST to", orderEndpoints[i]);
          orderResponse = await axios.post(orderEndpoints[i], orderPayload, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          console.log("✅ Order created via", orderEndpoints[i], orderResponse.data);
          break;
        } catch (err) {
          console.warn("❌ Order endpoint failed:", orderEndpoints[i], err.response?.status || err.message);
          // continue to next endpoint
        }
      }

      if (!orderResponse) {
        throw new Error("Order creation failed on all endpoints (404/Network).");
      }

      const order = orderResponse.data.order ?? orderResponse.data;
      const orderId = order._id ?? order.id ?? order._id;

      if (!orderId) {
        throw new Error("Order created but no ID returned");
      }

      setCreatedOrder(order);
      console.log("✅ Order created successfully:", orderId);

      // Build payment FormData
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("userId", userId);
      formData.append("method", method);
      formData.append("amount", String(orderTotals.totalAmount));
      formData.append("status", method === "COD" ? "Pending" : "Completed");

      if (method === "BankSlip") {
        if (!referenceNumber || !referenceNumber.trim()) {
          setMessage("❌ Please fill in the reference number.");
          setSubmitting(false);
          return;
        }
        if (!slipFile) {
          setMessage("❌ Please upload a bank slip image.");
          setSubmitting(false);
          return;
        }
        formData.append("referenceNumber", referenceNumber);
        formData.append("slipImage", slipFile);
      }

      console.log("💳 Processing payment...");

      let paymentResponse = null;
      const paymentEndpoints = [`${API_BASE_URL}/api/payments`, `${API_BASE_URL}/payments`];

      for (let i = 0; i < paymentEndpoints.length; i++) {
        try {
          console.log("📤 POST to", paymentEndpoints[i]);
          paymentResponse = await axios.post(paymentEndpoints[i], formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          });
          console.log("✅ Payment processed via", paymentEndpoints[i], paymentResponse.data);
          break;
        } catch (err) {
          console.warn("❌ Payment endpoint failed:", paymentEndpoints[i], err.response?.status || err.message);
        }
      }

      if (!paymentResponse) {
        throw new Error("Payment processing failed on all endpoints.");
      }

      // If API returns receipt path or URL
      if (paymentResponse.data?.receipt) {
        const receiptPath = paymentResponse.data.receipt;
        setReceiptUrl(receiptPath);
        console.log("📄 Receipt generated:", receiptPath);
      } else if (paymentResponse.data?.url) {
        setReceiptUrl(paymentResponse.data.url);
        console.log("📄 Receipt URL:", paymentResponse.data.url);
      }

      // Clear cart (best-effort)
      try {
        await axios.post(`${API_BASE_URL}/cart/clear`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ Cart cleared");
      } catch (err) {
        console.warn("⚠️ Cart clear failed (non-critical):", err.response?.data || err.message);
      }

      // Clear discount info
      localStorage.removeItem("appliedDiscount");
      localStorage.removeItem("checkoutSummary");

      setMessage("✅ Order & Payment submitted successfully! Receipt is ready for download.");

      // Auto-download if receipt is a server path
      if (paymentResponse.data?.receipt) {
        const receiptPath = paymentResponse.data.receipt.replace(/\\/g, "/").replace(/^\/+/, "");
        const downloadUrl = `${API_BASE_URL}/${receiptPath}`;
        setTimeout(() => {
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = `receipt-${orderId}.pdf`;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          console.log("📥 Auto-downloading receipt...");
        }, 1500);
      }

      // Navigate to orders after short delay so user sees success
      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (error) {
      console.error("❌ Payment submission error:", error);
      console.error("Server response:", error.response?.data ?? error.message);
      let errorMessage = "Failed to process payment. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage(`❌ Submission failed: ${errorMessage}`);

      if (createdOrder) {
        setMessage((prev) => `${prev}\n\nOrder ID: ${createdOrder._id} (Payment pending)`);
      }
    } finally {
      setSubmitting(false);
      setShowPolicyModal(false);
      setAgreed(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (method === "BankSlip") {
      if (!referenceNumber || !referenceNumber.trim()) {
        alert("❌ Please enter the bank reference number");
        return;
      }
      if (!slipFile) {
        alert("❌ Please upload the bank slip image");
        return;
      }
    }

    setShowPolicyModal(true);
  };

  const handleConfirm = () => {
    if (agreed) {
      performSubmit();
    } else {
      alert("❌ Please agree to the refund policy to continue");
    }
  };

  const handleDownloadReceipt = () => {
    if (!receiptUrl) return;
    // If receiptUrl looks like a relative path (no protocol), prefix API_BASE_URL
    const isAbsolute = /^https?:\/\//i.test(receiptUrl);
    const path = isAbsolute ? receiptUrl : `${API_BASE_URL}/${receiptUrl.replace(/^\/+/, "")}`;
    window.open(path, "_blank");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
          <h2>Loading checkout...</h2>
        </div>
      </div>
    );
  }

  const orderTotals = calculateOrderTotals();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "30px",
        alignItems: "start"
      }}>
        {/* LEFT: Order Summary */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{
            margin: "0 0 20px 0",
            fontSize: "24px",
            fontWeight: "bold",
            borderBottom: "2px solid #f0f0f0",
            paddingBottom: "15px"
          }}>
            📋 Order Summary
          </h3>

          {/* Items List */}
          <div style={{ marginBottom: "20px" }}>
            {orderTotals.items.map((item, idx) => (
              <div key={idx} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid #f0f0f0"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Qty: {item.quantity} × Rs. {Number(item.price).toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: "bold", color: "#333" }}>
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div style={{ borderTop: "2px solid #f0f0f0", paddingTop: "15px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
              fontSize: "15px"
            }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: "600" }}>
                Rs. {orderTotals.subtotal.toFixed(2)}
              </span>
            </div>

            {orderTotals.discountAmount > 0 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
                fontSize: "15px",
                color: "#10b981",
                fontWeight: "600",
                background: "rgba(16, 185, 129, 0.1)",
                padding: "8px 12px",
                borderRadius: "6px"
              }}>
                <span>🎉 Discount ({orderTotals.discountCode})</span>
                <span>- Rs. {orderTotals.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
              fontSize: "15px"
            }}>
              <span>Tax (10%)</span>
              <span style={{ fontWeight: "600" }}>
                Rs. {orderTotals.tax.toFixed(2)}
              </span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
              fontSize: "15px"
            }}>
              <span>Shipping</span>
              <span style={{ fontWeight: "600", color: "#28a745" }}>
                Rs. {orderTotals.shippingFee.toFixed(2)}
              </span>
            </div>

            <div style={{
              borderTop: "2px solid #f0f0f0",
              paddingTop: "15px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "20px",
              fontWeight: "bold"
            }}>
              <span>Total Amount</span>
              <span style={{ color: "#FF6B35" }}>
                Rs. {orderTotals.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Payment Form */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{
            margin: "0 0 20px 0",
            fontSize: "24px",
            fontWeight: "bold"
          }}>
            💳 Payment Details
          </h3>

          {message && message.includes("successfully") && receiptUrl && (
            <div style={{
              background: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
              border: "2px solid #10b981",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>✅</div>
              <h3 style={{ color: "#065f46", marginBottom: "10px" }}>Payment Successful!</h3>
              <p style={{ color: "#047857", marginBottom: "15px" }}>Your receipt has been generated</p>
              <button
                onClick={handleDownloadReceipt}
                style={{
                  padding: "12px 24px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}
              >
                📄 Download Receipt PDF
              </button>
              <p style={{ marginTop: "10px", fontSize: "12px", color: "#065f46" }}>Redirecting to orders page...</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{
              marginBottom: "20px",
              padding: "20px",
              background: "#f8f9fa",
              borderRadius: "12px"
            }}>
              <h4 style={{ marginBottom: "15px" }}>Payment Method</h4>

              <label style={{
                display: "flex",
                alignItems: "center",
                padding: "15px",
                background: method === "COD" ? "#e3f2fd" : "white",
                border: method === "COD" ? "2px solid #2196f3" : "2px solid #e0e0e0",
                borderRadius: "8px",
                marginBottom: "10px",
                cursor: "pointer"
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={method === "COD"}
                  onChange={() => setMethod("COD")}
                  disabled={submitting}
                  style={{ marginRight: "12px" }}
                />
                <span>
                  <strong>💵 Cash on Delivery</strong><br />
                  <small>Pay when you receive your order</small>
                </span>
              </label>

              <label style={{
                display: "flex",
                alignItems: "center",
                padding: "15px",
                background: method === "BankSlip" ? "#e3f2fd" : "white",
                border: method === "BankSlip" ? "2px solid #2196f3" : "2px solid #e0e0e0",
                borderRadius: "8px",
                cursor: "pointer"
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BankSlip"
                  checked={method === "BankSlip"}
                  onChange={() => setMethod("BankSlip")}
                  disabled={submitting}
                  style={{ marginRight: "12px" }}
                />
                <span>
                  <strong>🏦 Bank Slip</strong><br />
                  <small>Pay via bank transfer</small>
                </span>
              </label>
            </div>

            {method === "BankSlip" && (
              <div style={{
                padding: "20px",
                background: "#f0f8ff",
                borderRadius: "12px",
                marginBottom: "20px",
                border: "2px solid #2196f3"
              }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#1976d2" }}>🏦 Bank Transfer Details</h4>
                <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
                  <p><strong>Bank:</strong> Commercial Bank of Sri Lanka</p>
                  <p><strong>Account Name:</strong> CraftLink Store</p>
                  <p><strong>Account Number:</strong> 8001234567890</p>
                  <p><strong>Branch:</strong> Colombo Main Branch</p>
                  <p style={{ marginTop: "10px", fontSize: "12px", color: "#666", fontStyle: "italic" }}>
                    💡 Please transfer the exact amount and upload the slip
                  </p>
                </div>

                <div style={{ marginTop: "15px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                    Reference Number <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Enter Bank Reference Number"
                    required
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "14px",
                      marginBottom: "15px"
                    }}
                  />

                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                    Upload Bank Slip <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    required
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "2px solid #ddd",
                      borderRadius: "8px"
                    }}
                  />
                  {slipFile && (
                    <p style={{ marginTop: "8px", fontSize: "13px", color: "#28a745", fontWeight: "600" }}>
                      ✓ File selected: {slipFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || orderTotals.items.length === 0}
              style={{
                width: "100%",
                padding: "16px",
                background: submitting ? "#9ca3af" : "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "18px",
                marginBottom: "15px"
              }}
            >
              {submitting ? "⏳ Processing Payment..." : "💳 Confirm & Pay"}
            </button>
          </form>

          {message && message.includes("failed") && (
            <p style={{
              padding: "15px",
              background: "#fee",
              border: "2px solid #dc3545",
              borderRadius: "8px",
              color: "#dc3545",
              fontWeight: "600",
              whiteSpace: "pre-line"
            }}>
              {message}
            </p>
          )}

          <button
            onClick={() => navigate("/cart")}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px",
              background: "transparent",
              color: "#667eea",
              border: "2px solid #667eea",
              borderRadius: "8px",
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: "bold",
              opacity: submitting ? 0.5 : 1
            }}
          >
            ← Back to Cart
          </button>
        </div>
      </div>

      {/* Refund Policy Modal */}
      {showPolicyModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1500
          }}
          onClick={() => {
            if (!submitting) {
              setShowPolicyModal(false);
              setAgreed(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "480px",
              width: "90%",
              boxShadow: "0 4px 14px rgba(0,0,0,0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem", color: "#003366", fontSize: "20px" }}>
              📋 Refund Policy
            </h3>
            <ul style={{ paddingLeft: "1.2rem", color: "#222", fontWeight: "600" }}>
              {refundPolicies.map((policy, idx) => (
                <li key={idx} style={{ marginBottom: "0.5rem" }}>
                  {policy}
                </li>
              ))}
            </ul>

            <div style={{
              padding: "15px",
              background: "#f0f8ff",
              borderRadius: "8px",
              border: "1px solid #007bff",
              marginTop: "15px"
            }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#004080" }}>
                <strong>📄 Receipt:</strong> A PDF receipt will be automatically generated
                and available for download after payment confirmation.
              </p>
            </div>

            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: "600",
              color: "#004080",
              marginTop: "20px",
              cursor: "pointer"
            }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              I agree to the refund policy and terms
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowPolicyModal(false);
                  setAgreed(false);
                }}
                disabled={submitting}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1.5px solid #007bff",
                  background: "transparent",
                  color: "#007bff",
                  fontWeight: "600",
                  cursor: submitting ? "not-allowed" : "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!agreed || submitting}
                onClick={handleConfirm}
                style={{
                  padding: "0.5rem 1.5rem",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: !agreed || submitting ? "#a5c5ff" : "#007bff",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: !agreed || submitting ? "not-allowed" : "pointer"
                }}
              >
                {submitting ? "⏳ Processing..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
