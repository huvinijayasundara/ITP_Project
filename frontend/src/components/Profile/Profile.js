import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({
    name: "",
    gmail: "",
    phoneNumber: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (!token) {
        navigate("/login");
        return;
      }

      // If user data exists in localStorage, use it first
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setProfileForm({
            name: parsedUser.name || "",
            gmail: parsedUser.gmail || parsedUser.email || "",
            phoneNumber: parsedUser.phoneNumber || "",
          });
          setLoading(false);
        } catch (err) {
          console.error("Error parsing stored user:", err);
        }
      }

      // Then try to fetch fresh data from API
      try {
        const res = await axios.get("http://localhost:5000/api/userc/me/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "Ok") {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setProfileForm({
            name: res.data.user.name || "",
            gmail: res.data.user.gmail || "",
            phoneNumber: res.data.user.phoneNumber || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        // Don't redirect if we already have user data from localStorage
        if (!storedUser) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error for this field
    if (profileErrors[e.target.name]) {
      setProfileErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validateProfileForm = () => {
    const errors = {};

    // Name validation
    if (!profileForm.name.trim()) {
      errors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(profileForm.name)) {
      errors.name = "Name can only contain letters and spaces";
    }

    // Email validation
    if (!profileForm.gmail.trim()) {
      errors.gmail = "Email is required";
    } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(profileForm.gmail)) {
      errors.gmail = "Invalid email format (use lowercase)";
    }

    // Phone number validation - EXACTLY 10 DIGITS
    if (!profileForm.phoneNumber.toString().trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(profileForm.phoneNumber.toString())) {
      errors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async () => {
    if (!validateProfileForm()) {
      return;
    }

    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.put(
        "http://localhost:5000/api/userc/me/profile", 
        {
          name: profileForm.name,
          gmail: profileForm.gmail.toLowerCase(),
          phoneNumber: profileForm.phoneNumber.toString()
        }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === "Ok") {
        alert("✅ Profile updated successfully!");
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setProfileErrors({});
      }
    } catch (err) {
      console.error("Profile update error:", err);
      if (err.response) {
        alert("❌ " + (err.response.data.message || "Profile update failed"));
      } else {
        alert("❌ Cannot connect to server");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error for this field
    if (passwordErrors[e.target.name]) {
      setPasswordErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    } else if (passwordForm.newPassword.length > 12) {
      errors.newPassword = "New password must not exceed 12 characters";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordUpdate = async () => {
    if (!validatePasswordForm()) return;

    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.put(
        "http://localhost:5000/api/userc/me/change-password",
        passwordForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === "Ok") {
        alert("✅ " + res.data.message);
        setPasswordForm({ currentPassword: "", newPassword: "" });
        setPasswordErrors({});
      } else {
        alert("❌ " + (res.data.message || "Password update failed"));
      }
    } catch (err) {
      console.error("Password update error:", err);
      if (err.response) {
        alert("❌ " + (err.response.data.message || "Password update failed"));
      } else {
        alert("❌ Cannot connect to server");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("⚠️ Are you sure you want to delete your account? This action cannot be undone!")) {
      return;
    }

    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.delete("http://localhost:5000/api/userc/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "Ok") {
        alert("✅ Profile deleted successfully!");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        navigate("/login");
      }
    } catch (err) {
      console.error("Delete error:", err);
      if (err.response) {
        alert("❌ " + (err.response.data.message || "Delete failed"));
      } else {
        alert("❌ Cannot connect to server");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      navigate("/login");
    }
  };

  const handleDashboardRedirect = () => {
    const role = user?.role || localStorage.getItem("role");
    
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (role === "artisan") {
      navigate("/artisan/dashboard");
    } else if (role === "user") {
      navigate("/user/dashboard");
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
        <div className="text-center">
          <div className="spinner-border" style={{ color: '#8B4513' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="mt-3" style={{ color: '#8B4513' }}>Loading your profile...</h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
        <div className="text-center">
          <h2 style={{ color: '#8B4513' }}>No user data found</h2>
          <button 
            className="btn mt-3" 
            style={{ backgroundColor: '#B8764F', color: 'white', border: 'none', fontWeight: '600' }}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5', paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg rounded-4 border-0">
              <div className="card-header" style={{ backgroundColor: '#8B4513', color: 'white', padding: '20px' }}>
                <h2 className="mb-0">👤 My Profile</h2>
              </div>
              <div className="card-body p-4">
                {/* User Info */}
                <div className="mb-4 p-3" style={{ backgroundColor: '#F5DEB3', borderRadius: '8px', border: '1px solid #E8D4C0' }}>
                  <h3 style={{ color: '#8B4513' }}>Welcome, {user.name}! 👋</h3>
                  <p className="mb-1"><strong>Email:</strong> {user.gmail || user.email}</p>
                  <p className="mb-1"><strong>User ID:</strong> {user._id || user.id}</p>
                  <p className="mb-1">
                    <strong>Role:</strong>{' '}
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      backgroundColor: user.role === 'admin' ? '#dc3545' : user.role === 'artisan' ? '#28a745' : '#B8764F',
                      color: 'white'
                    }}>
                      {user.role?.toUpperCase()}
                    </span>
                  </p>
                  <button 
                    className="btn btn-sm mt-2"
                    style={{ backgroundColor: '#B8764F', color: 'white', border: 'none', fontWeight: '600' }}
                    onClick={handleDashboardRedirect}
                  >
                    🏠 Go to Dashboard
                  </button>
                </div>

                {/* Profile Update Form */}
                <div className="mb-4">
                  <h4 className="mb-3" style={{ color: '#8B4513' }}>📝 Update Profile</h4>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: '600', color: '#666' }}>Name</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control ${profileErrors.name ? 'is-invalid' : ''}`}
                      placeholder="Name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      disabled={updating}
                      style={{ borderColor: '#E8D4C0' }}
                    />
                    {profileErrors.name && (
                      <div className="invalid-feedback">{profileErrors.name}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: '600', color: '#666' }}>Email</label>
                    <input
                      type="email"
                      name="gmail"
                      className={`form-control ${profileErrors.gmail ? 'is-invalid' : ''}`}
                      placeholder="Email (lowercase)"
                      value={profileForm.gmail}
                      onChange={handleProfileChange}
                      disabled={updating}
                      style={{ borderColor: '#E8D4C0' }}
                    />
                    {profileErrors.gmail && (
                      <div className="invalid-feedback">{profileErrors.gmail}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: '600', color: '#666' }}>Phone Number (10 digits)</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      className={`form-control ${profileErrors.phoneNumber ? 'is-invalid' : ''}`}
                      placeholder="Phone Number (10 digits)"
                      value={profileForm.phoneNumber}
                      onChange={handleProfileChange}
                      disabled={updating}
                      maxLength="10"
                      style={{ borderColor: '#E8D4C0' }}
                    />
                    {profileErrors.phoneNumber && (
                      <div className="invalid-feedback">{profileErrors.phoneNumber}</div>
                    )}
                    <small className="text-muted">Must be exactly 10 digits</small>
                  </div>

                  <button 
                    className="btn w-100" 
                    style={{ backgroundColor: '#B8764F', color: 'white', border: 'none', fontWeight: '600', padding: '12px' }}
                    onClick={handleProfileUpdate}
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "💾 Update Profile"}
                  </button>
                </div>

                <hr style={{ borderColor: '#E8D4C0' }} />

                {/* Password Update Form */}
                <div className="mb-4">
                  <h4 className="mb-3" style={{ color: '#8B4513' }}>🔒 Change Password</h4>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: '600', color: '#666' }}>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      className={`form-control ${passwordErrors.currentPassword ? 'is-invalid' : ''}`}
                      placeholder="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      disabled={updating}
                      style={{ borderColor: '#E8D4C0' }}
                    />
                    {passwordErrors.currentPassword && (
                      <div className="invalid-feedback">{passwordErrors.currentPassword}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: '600', color: '#666' }}>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                      placeholder="New Password (6-12 characters)"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      disabled={updating}
                      style={{ borderColor: '#E8D4C0' }}
                    />
                    {passwordErrors.newPassword && (
                      <div className="invalid-feedback">{passwordErrors.newPassword}</div>
                    )}
                    <small className="text-muted">Must be 6-12 characters</small>
                  </div>

                  <button 
                    className="btn w-100" 
                    style={{ backgroundColor: '#B8764F', color: 'white', border: 'none', fontWeight: '600', padding: '12px' }}
                    onClick={handlePasswordUpdate}
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "🔐 Change Password"}
                  </button>
                </div>

                <hr style={{ borderColor: '#E8D4C0' }} />

                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <button 
                    className="btn" 
                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', fontWeight: '600', padding: '12px' }}
                    onClick={handleDelete}
                    disabled={updating}
                  >
                    {updating ? "Processing..." : "🗑️ Delete Account"}
                  </button>
                  <button 
                    className="btn" 
                    style={{ backgroundColor: '#666', color: 'white', border: 'none', fontWeight: '600', padding: '12px' }}
                    onClick={handleLogout}
                    disabled={updating}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;