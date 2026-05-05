import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function AddUser() {
  const history = useNavigate();
  const [inputs, setInputs] = useState({
    name: "",
    gmail: "",
    phoneNumber: "",
    password: "",
    conPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name
    if (!inputs.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(inputs.name)) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email
    if (!inputs.gmail.trim()) {
      newErrors.gmail = "Email is required";
    } else {
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailRegex.test(inputs.gmail)) {
        newErrors.gmail = "Email must be lowercase and in valid format";
      }
    }

    // Phone number
    if (!inputs.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(inputs.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    // Password
    if (!inputs.password) {
      newErrors.password = "Password is required";
    } else if (inputs.password.length < 6 || inputs.password.length > 12) {
      newErrors.password = "Password must be 6-12 characters long";
    }

    // Confirm Password
    if (!inputs.conPassword) {
      newErrors.conPassword = "Confirm password is required";
    } else if (inputs.password !== inputs.conPassword) {
      newErrors.conPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("You must be logged in to add users");
        history("/login");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/users",
        {
          name: String(inputs.name),
          gmail: String(inputs.gmail.toLowerCase()),
          phoneNumber: String(inputs.phoneNumber),
          password: String(inputs.password),
          conPassword: String(inputs.conPassword),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response:", response.data);
      
      if (response.data.status === "Ok") {
        alert("Artisan added successfully!");
        history("/userdetails");
      }
    } catch (error) {
      console.error("Add user error:", error);
      
      if (error.response) {
        alert(error.response.data.message || "Failed to add artisan");
      } else if (error.request) {
        alert("Cannot connect to server. Please check if backend is running.");
      } else {
        alert("An error occurred. Please try again.");
      }
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
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg border-0" style={{ 
              backgroundColor: 'white',
              borderRadius: '12px'
            }}>
              <div className="card-body" style={{ padding: '2.5rem' }}>
                <div className="text-center mb-4">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513',
                    marginBottom: '1rem'
                  }}>
                    👨‍🎨
                  </div>
                  <h2 style={{ 
                    color: '#8B4513',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>
                    Add Artisan
                  </h2>
                  <p style={{ color: '#666' }}>Register a new artisan to the platform</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {/* Name Input */}
                  <div className="mb-3">
                    <label className="form-label" style={{ color: '#333', fontWeight: '600' }}>Name</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="Name"
                      value={inputs.name}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        borderColor: errors.name ? '#dc3545' : '#E8D4C0',
                        padding: '0.75rem'
                      }}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  {/* Email Input */}
                  <div className="mb-3">
                    <label className="form-label" style={{ color: '#333', fontWeight: '600' }}>Email</label>
                    <input
                      type="email"
                      name="gmail"
                      className={`form-control ${errors.gmail ? 'is-invalid' : ''}`}
                      placeholder="Email (lowercase letters only)"
                      value={inputs.gmail}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        borderColor: errors.gmail ? '#dc3545' : '#E8D4C0',
                        padding: '0.75rem'
                      }}
                    />
                    {errors.gmail && <div className="invalid-feedback">{errors.gmail}</div>}
                  </div>

                  {/* Phone Number Input */}
                  <div className="mb-3">
                    <label className="form-label" style={{ color: '#333', fontWeight: '600' }}>Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                      placeholder="Phone Number"
                      value={inputs.phoneNumber}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength="10"
                      style={{
                        borderColor: errors.phoneNumber ? '#dc3545' : '#E8D4C0',
                        padding: '0.75rem'
                      }}
                    />
                    {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                  </div>

                  {/* Password Input */}
                  <div className="mb-3">
                    <label className="form-label" style={{ color: '#333', fontWeight: '600' }}>Password</label>
                    <input
                      type="password"
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Password"
                      value={inputs.password}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        borderColor: errors.password ? '#dc3545' : '#E8D4C0',
                        padding: '0.75rem'
                      }}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  {/* Confirm Password Input */}
                  <div className="mb-4">
                    <label className="form-label" style={{ color: '#333', fontWeight: '600' }}>Confirm Password</label>
                    <input
                      type="password"
                      name="conPassword"
                      className={`form-control ${errors.conPassword ? 'is-invalid' : ''}`}
                      placeholder="Confirm Password"
                      value={inputs.conPassword}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        borderColor: errors.conPassword ? '#dc3545' : '#E8D4C0',
                        padding: '0.75rem'
                      }}
                    />
                    {errors.conPassword && <div className="invalid-feedback">{errors.conPassword}</div>}
                  </div>

                  <button 
                    type="submit" 
                    className="btn w-100"
                    disabled={loading}
                    style={{
                      backgroundColor: '#B8764F',
                      color: 'white',
                      border: 'none',
                      padding: '0.875rem',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      borderRadius: '8px',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#8B4513'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#B8764F'}
                  >
                    {loading ? "Adding..." : "Add Artisan"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddUser;