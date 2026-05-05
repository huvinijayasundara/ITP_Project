import React, { useState, useEffect } from "react";
import { createComplaint } from "../../api/complaintApi";

const ComplaintForm = ({ onAdded, userEmail: propUserEmail, userName: propUserName }) => {
  // ✅ Get logged-in user's info from user object in localStorage
  const getLoggedInUserInfo = () => {
    let name = propUserName || '';
    let email = propUserEmail || '';
    
    // If not passed as props, try to get from localStorage
    if (!name || !email) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          email = (user.gmail || user.email || '').toLowerCase().trim();
          name = user.name || '';
        }
      } catch (e) {
        console.warn("Could not parse user object:", e);
      }
      
      // Fallback to userName
      if (!name) {
        name = localStorage.getItem('userName') || localStorage.getItem('name') || '';
      }
    }
    
    console.log("🔐 Auto-filling form with logged-in user:", { name, email });
    return { name, email };
  };

  const { name: loggedInName, email: loggedInEmail } = getLoggedInUserInfo();

  const [form, setForm] = useState({
    customerName: loggedInName, // ✅ Auto-fill from user object
    email: loggedInEmail,        // ✅ Auto-fill from user object
    issue: "",
    category: "",
    priority: "medium"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ✅ Update form if user info changes
  useEffect(() => {
    const getUserInfo = () => {
      let name = propUserName || '';
      let email = propUserEmail || '';
      
      if (!name || !email) {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            email = (user.gmail || user.email || '').toLowerCase().trim();
            name = user.name || '';
          }
        } catch (e) {
          console.warn("Could not parse user object:", e);
        }
        
        if (!name) {
          name = localStorage.getItem('userName') || localStorage.getItem('name') || '';
        }
      }
      
      return { name, email };
    };

    const { name, email } = getUserInfo();
    setForm(prev => ({
      ...prev,
      customerName: name,
      email: email
    }));
  }, [propUserEmail, propUserName]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ✅ CRITICAL VALIDATION: Check if email exists
    if (!form.email || form.email.trim() === '') {
      alert("❌ Cannot submit complaint: Your email is not available. Please log out and log in again.");
      setIsSubmitting(false);
      return;
    }

    // Validation
    if (!form.customerName.trim()) {
      alert("Please enter your name.");
      setIsSubmitting(false);
      return;
    }

    if (!form.issue.trim()) {
      alert("Please describe your issue.");
      setIsSubmitting(false);
      return;
    }

    if (form.issue.trim().length < 10) {
      alert("Please provide a more detailed description (at least 10 characters).");
      setIsSubmitting(false);
      return;
    }

    if (!form.category) {
      alert("Please select a category for your complaint.");
      setIsSubmitting(false);
      return;
    }

    if (!termsAccepted) {
      alert("Please accept the terms and conditions to proceed.");
      setIsSubmitting(false);
      return;
    }

    try {
      // ✅ CRITICAL: Use the logged-in user's email to ensure proper filtering
      const complaintData = {
        customerName: form.customerName.trim(),
        email: form.email.trim().toLowerCase(), // ✅ Normalize email
        issue: form.issue.trim(),
        category: form.category,
        priority: form.priority || "medium"
      };

      console.log("📤 Submitting complaint:", complaintData);

      const response = await createComplaint(complaintData);
      
      // Get the ticket number from the response
      const ticketNumber = response.data?.data?.ticketRef || response.data?.ticketRef || "GENERATED";
      
      console.log("✅ Complaint created successfully:", ticketNumber);

      onAdded(); // refresh list
      
      // Reset only the issue fields, keep user info
      setForm({ 
        customerName: loggedInName, // ✅ Keep user name
        email: loggedInEmail,       // ✅ Keep user email
        issue: "",
        category: "",
        priority: "medium"
      });
      setTermsAccepted(false);
      
      // Show big success message with ticket number
      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #B8764F, #8B4513);
        color: white;
        padding: 40px 60px;
        border-radius: 20px;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(139, 69, 19, 0.3);
        border: 3px solid #fff;
        animation: successPulse 0.6s ease-out;
      `;
      successMessage.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
        <div style="font-size: 28px; margin-bottom: 10px;">SUCCESS!</div>
        <div style="font-size: 20px; margin-bottom: 15px;">Complaint Submitted</div>
        <div style="font-size: 32px; color: #F5DEB3; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px; font-family: monospace;">
          Ticket: ${ticketNumber}
        </div>
        <div style="font-size: 14px; margin-top: 15px; opacity: 0.9;">
          Save this ticket number for tracking
        </div>
      `;
      
      // Add animation keyframes
      const style = document.createElement('style');
      style.textContent = `
        @keyframes successPulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(successMessage);
      
      // Remove message after 4 seconds
      setTimeout(() => {
        successMessage.remove();
        style.remove();
      }, 4000);
    } catch (error) {
      console.error("❌ Error submitting complaint:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to submit complaint. Please try again.";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Show error if no email available
  if (!loggedInEmail || loggedInEmail.trim() === '') {
    return (
      <div style={{
        backgroundColor: "#FFEBEE",
        padding: "30px",
        borderRadius: "12px",
        border: "2px solid #EF9A9A",
        marginBottom: "20px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "15px" }}>⚠️</div>
        <h3 style={{ color: "#C62828", margin: "0 0 10px 0" }}>
          Unable to Load Complaint Form
        </h3>
        <p style={{ color: "#C62828", margin: "0 0 15px 0" }}>
          Your email information is not available. This is required to submit complaints.
        </p>
        <p style={{ color: "#C62828", margin: "0", fontWeight: "bold" }}>
          Please log out and log in again to fix this issue.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "#ffffff",
      padding: "30px",
      borderRadius: "12px",
      border: "2px solid #E8D4C0",
      boxShadow: "0 4px 6px rgba(139, 69, 19, 0.07)",
      marginBottom: "20px"
    }}>
      <div style={{ 
        textAlign: "center", 
        marginBottom: "25px",
        paddingBottom: "15px",
        borderBottom: "2px solid #F5DEB3"
      }}>
        <h3 style={{ 
          color: "#8B4513", 
          margin: "0 0 8px 0",
          fontSize: "24px",
          fontWeight: "bold"
        }}>
          📝 Submit New Complaint
        </h3>
        <p style={{ 
          color: "#666", 
          margin: 0,
          fontSize: "14px"
        }}>
          Please fill out all required fields to submit your complaint
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Customer Information Section */}
        <div style={{ marginBottom: "30px" }}>
          <h4 style={{ 
            marginBottom: "18px", 
            color: "#8B4513",
            fontSize: "18px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            paddingBottom: "8px",
            borderBottom: "2px solid #B8764F"
          }}>
            👤 Customer Information
          </h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#666",
                fontSize: "14px"
              }}>
                Full Name * {loggedInName && <span style={{ color: "#28a745", fontSize: "12px" }}>✓ Auto-filled</span>}
              </label>
              <input
                name="customerName"
                type="text"
                placeholder="Enter your full name"
                value={form.customerName}
                onChange={handleChange}
                required
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "15px",
                  transition: "all 0.3s",
                  outline: "none",
                  fontFamily: "inherit",
                  backgroundColor: loggedInName ? "#FFF9F0" : "white"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#B8764F";
                  e.target.style.boxShadow = "0 0 0 3px rgba(184, 118, 79, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8D4C0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#666",
                fontSize: "14px"
              }}>
                Email Address * {loggedInEmail && <span style={{ color: "#28a745", fontSize: "12px" }}>✓ Auto-filled</span>}
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                readOnly
                disabled
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #28a745",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontFamily: "inherit",
                  backgroundColor: "#FFF9F0",
                  color: "#666",
                  cursor: "not-allowed"
                }}
              />
              <div style={{ 
                fontSize: "12px", 
                color: "#28a745", 
                marginTop: "4px",
                fontWeight: "600"
              }}>
                🔒 This is your logged-in email and cannot be changed
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Details Section */}
        <div style={{ marginBottom: "30px" }}>
          <h4 style={{ 
            marginBottom: "18px", 
            color: "#8B4513",
            fontSize: "18px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            paddingBottom: "8px",
            borderBottom: "2px solid #B8764F"
          }}>
            📋 Complaint Details
          </h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#666",
                fontSize: "14px"
              }}>
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "15px",
                  transition: "all 0.3s",
                  outline: "none",
                  backgroundColor: "white",
                  fontFamily: "inherit",
                  cursor: "pointer"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#B8764F";
                  e.target.style.boxShadow = "0 0 0 3px rgba(184, 118, 79, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8D4C0";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="">Select a category</option>
                <option value="product-quality">🏺 Product Quality</option>
                <option value="shipping">📦 Shipping & Delivery</option>
                <option value="customer-service">🎧 Customer Service</option>
                <option value="billing">💳 Billing & Payment</option>
                <option value="website">🌐 Website Issues</option>
                <option value="refund-exchange">🔄 Refund/Exchange</option>
                <option value="general">📝 General</option>
                <option value="other">❓ Other</option>
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#666",
                fontSize: "14px"
              }}>
                Priority Level *
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "15px",
                  transition: "all 0.3s",
                  outline: "none",
                  backgroundColor: "white",
                  fontFamily: "inherit",
                  cursor: "pointer"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#B8764F";
                  e.target.style.boxShadow = "0 0 0 3px rgba(184, 118, 79, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8D4C0";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="low">🟢 Low - General inquiry</option>
                <option value="medium">🟡 Medium - Standard issue</option>
                <option value="high">🟠 High - Important matter</option>
                <option value="urgent">🔴 Urgent - Needs immediate attention</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              color: "#666",
              fontSize: "14px"
            }}>
              Issue Description *
            </label>
            <textarea
              name="issue"
              placeholder="Please describe your issue in detail. Include any relevant order numbers, product names, dates, or specific problems you encountered. The more details you provide, the better we can assist you."
              value={form.issue}
              onChange={handleChange}
              required
              rows="6"
              maxLength="1000"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #E8D4C0",
                borderRadius: "8px",
                fontSize: "15px",
                transition: "all 0.3s",
                outline: "none",
                resize: "vertical",
                minHeight: "140px",
                fontFamily: "inherit",
                lineHeight: "1.5"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#B8764F";
                e.target.style.boxShadow = "0 0 0 3px rgba(184, 118, 79, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E8D4C0";
                e.target.style.boxShadow = "none";
              }}
            />
            <div style={{ 
              fontSize: "13px", 
              color: form.issue.length > 950 ? "#dc3545" : "#6c757d", 
              marginTop: "6px",
              textAlign: "right",
              fontWeight: form.issue.length > 950 ? "600" : "normal"
            }}>
              {form.issue.length}/1000 characters
              {form.issue.length < 10 && form.issue.length > 0 && (
                <span style={{ color: "#ffc107", marginLeft: "10px" }}>
                  ⚠️ Please provide more details
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div style={{ marginBottom: "25px" }}>
          <label style={{ 
            display: "flex", 
            alignItems: "flex-start", 
            fontSize: "14px", 
            color: "#666",
            cursor: "pointer",
            padding: "15px",
            backgroundColor: "#F5DEB3",
            border: "1px solid #E8D4C0",
            borderRadius: "8px",
            lineHeight: "1.5"
          }}>
            <input 
              type="checkbox" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required 
              style={{ 
                marginRight: "12px", 
                marginTop: "4px",
                transform: "scale(1.3)",
                cursor: "pointer"
              }} 
            />
            <span>
              I confirm that the information provided is accurate and complete. I consent to the 
              processing of my personal data for the purpose of resolving this complaint in 
              accordance with our <strong>privacy policy</strong>. I understand that I will receive 
              email updates regarding the status of my complaint. *
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button 
            type="submit" 
            disabled={isSubmitting || !termsAccepted}
            style={{
              backgroundColor: (isSubmitting || !termsAccepted) ? "#6c757d" : "#B8764F",
              color: "white",
              border: "none",
              padding: "16px 50px",
              borderRadius: "30px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: (isSubmitting || !termsAccepted) ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              boxShadow: (isSubmitting || !termsAccepted) ? "none" : "0 4px 12px rgba(184, 118, 79, 0.3)",
              minWidth: "220px",
              transform: "translateY(0)",
              fontFamily: "inherit"
            }}
            onMouseOver={(e) => {
              if (!isSubmitting && termsAccepted) {
                e.target.style.backgroundColor = "#8B4513";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(139, 69, 19, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting && termsAccepted) {
                e.target.style.backgroundColor = "#B8764F";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(184, 118, 79, 0.3)";
              }
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{ 
                  display: "inline-block", 
                  marginRight: "8px"
                }}>
                  ⏳
                </span>
                Submitting...
              </>
            ) : (
              <>
                📤 Submit Complaint
              </>
            )}
          </button>
          
          {!termsAccepted && (
            <div style={{ 
              marginTop: "10px", 
              fontSize: "13px", 
              color: "#dc3545",
              fontStyle: "italic"
            }}>
              Please accept the terms and conditions to continue
            </div>
          )}
        </div>

        {/* Info Note */}
        <div style={{
          marginTop: "25px",
          padding: "20px",
          backgroundColor: "#FFF9F0",
          border: "1px solid #E8D4C0",
          borderRadius: "10px",
          fontSize: "14px",
          color: "#8B4513",
          lineHeight: "1.6"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "15px" }}>
            📋 What happens next?
          </div>
          <ul style={{ margin: "0", paddingLeft: "20px" }}>
            <li>You'll receive a unique <strong>ticket number</strong> immediately after submission</li>
            <li>Our team will review your complaint within <strong>24-48 hours</strong></li>
            <li>You'll receive email updates as your complaint progresses</li>
            <li>You can reference your ticket number for any follow-up inquiries</li>
            <li><strong>Only YOU can see your complaints - other customers cannot view them</strong></li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;