import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    gmail: "",
    phoneNumber: "",
    password: "",
    conPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation: only allow digits and max 10 characters
    if (name === "phoneNumber") {
      const numericValue = value.replace(/\D/g, ""); // Remove non-digits
      if (numericValue.length <= 10) {
        setForm({ ...form, [name]: numericValue });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) newErrors.name = "Name is required";

    // Gmail validation
    if (!form.gmail) {
      newErrors.gmail = "Email is required";
    } else {
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailRegex.test(form.gmail)) {
        newErrors.gmail = "Email must be lowercase and in valid format";
      }
    }

    // Phone number validation
    if (!form.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6 || form.password.length > 12) {
      newErrors.password = "Password must be 6-12 characters";
    }

    // Confirm password
    if (form.password !== form.conPassword) {
      newErrors.conPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validateForm()) {
      setLoading(true);
      try {
        const res = await axios.post("http://localhost:5000/register", {
          name: form.name,
          gmail: form.gmail.toLowerCase(),
          phoneNumber: form.phoneNumber,
          password: form.password,
          conPassword: form.conPassword
        });

        if (res.data.status === "Ok") {
          alert("Registration successful!");
          navigate("/login");
        } else {
          alert(res.data.message || "Registration failed");
        }
      } catch (err) {
        console.error("Registration error:", err);
        
        if (err.response) {
          alert(err.response.data.message || "Registration failed");
        } else if (err.request) {
          alert("Cannot connect to server. Please make sure the backend server is running on port 5000.");
        } else {
          alert("An error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#B8764F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div 
              className="card shadow" 
              style={{ 
                backgroundColor: 'white',
                borderRadius: '12px',
                border: 'none'
              }}
            >
              <div className="card-body" style={{ padding: '2.5rem' }}>
                <h2 
                  className="text-center mb-4" 
                  style={{ 
                    color: '#8B4513',
                    fontWeight: 'bold',
                    fontSize: '2rem'
                  }}
                >
                  Create Account
                </h2>
                <p 
                  className="text-center mb-4" 
                  style={{ 
                    color: '#666',
                    fontSize: '1rem'
                  }}
                >
                  Join our handicraft community today
                </p>
                
                <form onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="mb-3">
                    <label 
                      style={{ 
                        color: '#333',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        display: 'block'
                      }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        borderColor: errors.name ? '#dc3545' : '#E8D4C0',
                        padding: '12px',
                        fontSize: '1rem',
                        borderRadius: '8px'
                      }}
                    />
                    {errors.name && (
                      <small className="text-danger" style={{ display: 'block', marginTop: '0.5rem' }}>
                        {errors.name}
                      </small>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label 
                      style={{ 
                        color: '#333',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        display: 'block'
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="gmail"
                      className="form-control"
                      placeholder="Enter your email"
                      value={form.gmail}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        borderColor: errors.gmail ? '#dc3545' : '#E8D4C0',
                        padding: '12px',
                        fontSize: '1rem',
                        borderRadius: '8px'
                      }}
                    />
                    {errors.gmail && (
                      <small className="text-danger" style={{ display: 'block', marginTop: '0.5rem' }}>
                        {errors.gmail}
                      </small>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="mb-3">
                    <label 
                      style={{ 
                        color: '#333',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        display: 'block'
                      }}
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      className="form-control"
                      placeholder="Enter 10 digit phone number"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        borderColor: errors.phoneNumber ? '#dc3545' : '#E8D4C0',
                        padding: '12px',
                        fontSize: '1rem',
                        borderRadius: '8px'
                      }}
                    />
                    {errors.phoneNumber && (
                      <small className="text-danger" style={{ display: 'block', marginTop: '0.5rem' }}>
                        {errors.phoneNumber}
                      </small>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label 
                      style={{ 
                        color: '#333',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        display: 'block'
                      }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="6-12 characters"
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        borderColor: errors.password ? '#dc3545' : '#E8D4C0',
                        padding: '12px',
                        fontSize: '1rem',
                        borderRadius: '8px'
                      }}
                    />
                    {errors.password && (
                      <small className="text-danger" style={{ display: 'block', marginTop: '0.5rem' }}>
                        {errors.password}
                      </small>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label 
                      style={{ 
                        color: '#333',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        display: 'block'
                      }}
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="conPassword"
                      className="form-control"
                      placeholder="Re-enter your password"
                      value={form.conPassword}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        borderColor: errors.conPassword ? '#dc3545' : '#E8D4C0',
                        padding: '12px',
                        fontSize: '1rem',
                        borderRadius: '8px'
                      }}
                    />
                    {errors.conPassword && (
                      <small className="text-danger" style={{ display: 'block', marginTop: '0.5rem' }}>
                        {errors.conPassword}
                      </small>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="w-100"
                    disabled={loading}
                    style={{
                      backgroundColor: '#8B4513',
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
                  >
                    {loading ? "Registering..." : "Create Account"}
                  </button>

                  <p className="text-center mt-4" style={{ color: '#666' }}>
                    Already have an account?{' '}
                    <Link 
                      to="/login"
                      style={{
                        color: '#8B4513',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      Login
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;