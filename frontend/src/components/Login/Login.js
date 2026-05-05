import React, { useState, useContext } from "react";
import axios from "axios"; 
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); 
  const [form, setForm] = useState({ gmail: "", password: "" }); 
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.gmail) {
      newErrors.gmail = "Email is required";
    } else {
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailRegex.test(form.gmail)) {
        newErrors.gmail = "Email must be lowercase and in valid format";
      }
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/login", {
        gmail: form.gmail.toLowerCase(),
        password: form.password
      });

      console.log("✅ Login response:", res.data);

      if (res.data.status === "Ok" && res.data.token) {
        const token = res.data.token;
        localStorage.setItem("token", token);
        console.log("✅ Token saved:", token);

        const user = res.data.user;
        
        const userId = user._id || user.id;
        if (!userId) {
          console.error("❌ CRITICAL: No user ID found in response!");
          alert("Login error: User ID missing. Please contact support.");
          setLoading(false);
          return;
        }
        
        localStorage.setItem("userId", userId);
        console.log("✅ User ID saved:", userId);

        localStorage.setItem("user", JSON.stringify(user));
        console.log("✅ User data saved:", user.name);

        const role = user.role || 'user';
        localStorage.setItem("role", role);
        localStorage.setItem("userRole", role);
        console.log("✅ Role saved:", role);

        localStorage.setItem("userName", user.name);
        localStorage.setItem("name", user.name);

        login(token, user);

        alert(`✅ Login successful! Welcome ${user.name}`);

        console.log("📊 Verification:");
        console.log("  - Token:", localStorage.getItem("token") ? "✅ Saved" : "❌ Missing");
        console.log("  - User ID:", localStorage.getItem("userId"));
        console.log("  - Role:", localStorage.getItem("role"));
        console.log("  - Name:", localStorage.getItem("userName"));

        setTimeout(() => {
          if (role === "admin") {
            navigate("/admin/dashboard");
          } else if (role === "artisan") {
            navigate("/artisan/dashboard");
          } else {
            navigate("/user/dashboard");
          }
        }, 500);

      } else {
        alert(res.data.message || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      
      if (err.response) {
        alert(err.response.data.message || "Login failed. Please check your credentials.");
      } else if (err.request) {
        alert("Cannot connect to server. Please make sure the backend server is running on port 5000.");
      } else {
        alert("An error occurred. Please try again.");
      }
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
                    🎨
                  </div>
                  <h2 style={{ 
                    color: '#8B4513',
                    fontWeight: 'bold',
                    fontSize: '2rem',
                    marginBottom: '0.5rem'
                  }}>
                    Welcome Back
                  </h2>
                  <p style={{ 
                    color: '#666',
                    fontSize: '1rem'
                  }}>
                    Login to continue your handicraft journey
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
                        borderRadius: '8px',
                        borderWidth: '2px'
                      }}
                    />
                    {errors.gmail && (
                      <small className="text-danger" style={{ display: 'block', marginTop: '0.5rem' }}>
                        {errors.gmail}
                      </small>
                    )}
                  </div>

                  <div className="mb-4">
                    <label style={{ 
                      color: '#333',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        borderColor: errors.password ? '#dc3545' : '#E8D4C0',
                        padding: '12px',
                        fontSize: '1rem',
                        borderRadius: '8px',
                        borderWidth: '2px'
                      }}
                    />
                    {errors.password && (
                      <small className="text-danger" style={{ display: 'block', marginTop: '0.5rem' }}>
                        {errors.password}
                      </small>
                    )}
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
                    {loading ? "Logging in..." : "Login"}
                  </button>

                  <p className="mt-3 text-center" style={{ marginBottom: '0.5rem' }}>
                    <Link 
                      to="/forgot-password"
                      style={{
                        color: '#8B4513',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </p>
                  <p className="text-center" style={{ color: '#666' }}>
                    Don't have an account?{' '}
                    <Link 
                      to="/register"
                      style={{
                        color: '#8B4513',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      Register
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

export default Login;