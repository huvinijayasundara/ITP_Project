import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function UpdateUser() {
  const [inputs, setInputs] = useState({
    name: '',
    gmail: '',
    phoneNumber: '',
    password: '',
    conPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch user data by ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          alert("You must be logged in");
          navigate("/login");
          return;
        }

        // ✅ FIXED: Correct API endpoint with token
        const res = await axios.get(
          `http://localhost:5000/api/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.user) {
          setInputs({
            name: res.data.user.name || '',
            gmail: res.data.user.gmail || '',
            phoneNumber: res.data.user.phoneNumber || '',
            password: '',
            conPassword: ''
          });
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        alert("Failed to load user data");
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  // Validation function
  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!inputs.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(inputs.name)) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email validation
    if (!inputs.gmail.trim()) {
      newErrors.gmail = "Email is required";
    } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(inputs.gmail)) {
      newErrors.gmail = "Invalid email format (lowercase only)";
    }

    // Phone number validation
    if (!inputs.phoneNumber.toString().trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(inputs.phoneNumber.toString())) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    // Password validation (only if provided)
    if (inputs.password || inputs.conPassword) {
      if (!inputs.password) {
        newErrors.password = "Password is required";
      } else if (inputs.password.length < 6 || inputs.password.length > 12) {
        newErrors.password = "Password must be 6-12 characters";
      }

      if (!inputs.conPassword) {
        newErrors.conPassword = "Confirm password is required";
      } else if (inputs.password !== inputs.conPassword) {
        newErrors.conPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("You must be logged in");
        navigate("/login");
        return;
      }

      // Prepare update data
      const updateData = {
        name: inputs.name,
        gmail: inputs.gmail.toLowerCase(),
        phoneNumber: inputs.phoneNumber
      };

      // Only include password if provided
      if (inputs.password) {
        updateData.password = inputs.password;
        updateData.conPassword = inputs.conPassword;
      }

      // ✅ FIXED: Correct API endpoint with token
      const response = await axios.put(
        `http://localhost:5000/api/users/${id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Update response:", response.data);

      if (response.data.status === "Ok") {
        alert('Artisan updated successfully!');
        navigate('/userdetails');
      }
    } catch (error) {
      console.error('Update error:', error);
      
      if (error.response) {
        alert(error.response.data.message || 'Failed to update artisan');
      } else if (error.request) {
        alert("Cannot connect to server. Please check if backend is running.");
      } else {
        alert('An error occurred. Please try again.');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="card-body">
              <h2 className="text-center mb-4">Update Artisan</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name:</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={inputs.name}
                    onChange={handleChange}
                    disabled={updating}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Email:</label>
                  <input
                    type="email"
                    name="gmail"
                    className={`form-control ${errors.gmail ? 'is-invalid' : ''}`}
                    value={inputs.gmail}
                    onChange={handleChange}
                    disabled={updating}
                  />
                  {errors.gmail && <div className="invalid-feedback">{errors.gmail}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number:</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                    value={inputs.phoneNumber}
                    onChange={handleChange}
                    disabled={updating}
                    maxLength="10"
                  />
                  {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                </div>

                <hr />
                <p className="text-muted small">Leave password fields empty to keep current password</p>

                <div className="mb-3">
                  <label className="form-label">New Password (optional):</label>
                  <input
                    type="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    value={inputs.password}
                    onChange={handleChange}
                    disabled={updating}
                    placeholder="Enter new password (6-12 characters)"
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirm New Password:</label>
                  <input
                    type="password"
                    name="conPassword"
                    className={`form-control ${errors.conPassword ? 'is-invalid' : ''}`}
                    value={inputs.conPassword}
                    onChange={handleChange}
                    disabled={updating}
                    placeholder="Confirm new password"
                  />
                  {errors.conPassword && <div className="invalid-feedback">{errors.conPassword}</div>}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mt-3"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update Artisan"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateUser;