import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function ForgotPassword() {
  const [gmail, setGmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = () => {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return emailRegex.test(gmail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!gmail.trim()) {
      setMessage("Please enter your email address");
      setMessageType("error");
      return;
    }

    if (!validateEmail()) {
      setMessage("Please enter a valid email address (lowercase only)");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      console.log("Sending forgot password request for:", gmail);
      
      const res = await axios.post(
        "http://localhost:5000/forgot-password", 
        { gmail: gmail.toLowerCase() },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log("Response:", res.data);

      if (res.data.status === "Ok") {  
        setMessage("✅ Reset link sent! Please check your email inbox (and spam folder).");
        setMessageType("success");
        setGmail("");
        
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } else {
        setMessage(res.data.message || "Error sending reset link");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      
      if (err.response) {
        const errorMsg = err.response.data.message || "Failed to send reset link";
        console.log("Server error:", err.response.status, errorMsg);
        
        if (err.response.status === 404) {
          setMessage("❌ No account found with this email address");
        } else if (err.response.status === 500) {
          setMessage("❌ Email service error. Please contact support.");
        } else {
          setMessage("❌ " + errorMsg);
        }
      } else if (err.request) {
        console.log("Network error:", err.request);
        setMessage("❌ Cannot connect to server. Please check:\n1. Backend is running on port 5000\n2. Your internet connection");
      } else {
        console.log("Error:", err.message);
        setMessage("❌ An unexpected error occurred. Please try again.");
      }
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F5F5F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div 
              className="card shadow-lg" 
              style={{ 
                backgroundColor: 'white',
                borderRadius: '12px',
                border: 'none'
              }}
            >
              <div className="card-body" style={{ padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '48px', color: '#8B4513', marginBottom: '1rem' }}>
                    🔐
                  </div>
                  <h2 style={{ 
                    color: '#8B4513',
                    fontWeight: 'bold',
                    fontSize: '2rem',
                    marginBottom: '0.5rem'
                  }}>
                    Forgot Password?
                  </h2>
                  <p style={{ 
                    color: '#666',
                    fontSize: '1rem'
                  }}>
                    Enter your email to receive a password reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label style={{ 
                      color: '#333',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your registered email"
                      value={gmail}
                      onChange={(e) => {
                        setGmail(e.target.value);
                        setMessage("");
                      }}
                      disabled={loading}
                      style={{
                        padding: '12px',
                        fontSize: '1rem',
                        borderRadius: '8px',
                        borderColor: '#E8D4C0',
                        borderWidth: '2px'
                      }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-100"
                    disabled={loading}
                    style={{
                      backgroundColor: '#B8764F',
                      color: 'white',
                      padding: '14px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? '0.7' : '1',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#8B4513')}
                    onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#B8764F')}
                  >
                    {loading ? "📧 Sending..." : "Send Reset Link"}
                  </button>
                </form>

                {message && (
                  <div 
                    className="mt-3 p-3"
                    style={{
                      backgroundColor: messageType === "success" ? '#E8F5E9' : '#FFEBEE',
                      color: messageType === "success" ? '#2E7D32' : '#C62828',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '0.95rem',
                      whiteSpace: 'pre-line',
                      border: messageType === "success" ? '1px solid #A5D6A7' : '1px solid #EF9A9A'
                    }}
                  >
                    {message}
                  </div>
                )}

                <div className="text-center mt-4">
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                    Remember your password?{' '}
                    <a 
                      href="/login"
                      style={{
                        color: '#8B4513',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      Login
                    </a>
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Don't have an account?{' '}
                    <a 
                      href="/register"
                      style={{
                        color: '#8B4513',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      Register
                    </a>
                  </p>
                </div>

                <div className="mt-4 p-3" style={{ 
                  backgroundColor: '#F5DEB3', 
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#666',
                  border: '1px solid #E8D4C0'
                }}>
                  <strong style={{ color: '#8B4513' }}>📝 Tips:</strong>
                  <ul style={{ marginBottom: 0, paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                    <li>Check your spam/junk folder</li>
                    <li>Email must be registered in the system</li>
                    <li>Use lowercase letters only</li>
                    <li>Link expires in 24 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;