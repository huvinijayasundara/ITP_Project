import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function DashboardUser() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role !== "user") {
      alert("Access denied! Only customers can access this page.");
      navigate("/profile");
    }
  }, [navigate]);

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("name") || localStorage.getItem("userName") || "user";

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#F5F5F5'
    }}>
      <div className="container mt-5 mb-5" style={{ flex: 1 }}>
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold" style={{ color: '#8B4513' }}>
            Welcome, {userName}! 👋
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#666' }}>Manage your account and activities</p>
        </div>

        <div className="row justify-content-center g-4">
          {/* Shopping Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg rounded-4 h-100 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513'
                  }}>
                    🛍️
                  </div>
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>Shopping</h4>
                </div>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#B8764F',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/products")}
                  >
                    🎨 Browse Products
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#8B4513',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/cart")}
                  >
                    🛒 My Cart
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#666',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/promotions")}
                  >
                    📣 View Promotions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Orders & Tracking Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg rounded-4 h-100 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513'
                  }}>
                    📦
                  </div>
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>My Orders</h4>
                </div>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#B8764F',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/orders")}
                  >
                    📋 View All Orders
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#8B4513',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/products")}
                  >
                    ➕ Create New Order
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg rounded-4 h-100 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513'
                  }}>
                    💳
                  </div>
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>Payments</h4>
                </div>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#B8764F',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate(`/payments/user/${userId}`)}
                  >
                    💳 Payment History
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Support Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg rounded-4 h-100 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513'
                  }}>
                    🎧
                  </div>
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>Support</h4>
                </div>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#B8764F',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/complaints")}
                  >
                    📝 Complaints
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#8B4513',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/feedback")}
                  >
                    💬 Feedback
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#666',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/ratings")}
                  >
                    ⭐ Ratings
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg rounded-4 h-100 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513'
                  }}>
                    👤
                  </div>
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>Account</h4>
                </div>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#333',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/profile")}
                  >
                    🔍 My Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="row justify-content-center mt-4">
          <div className="col-lg-10">
            <div className="card shadow-lg rounded-4 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold text-center mb-4" style={{ color: '#8B4513' }}>ℹ️ Quick Tips</h5>
                <div className="row text-center g-3">
                  <div className="col-md-4">
                    <div style={{ fontSize: '32px' }}>🎁</div>
                    <p className="mb-0" style={{ color: '#666' }}><small>Check promotions for exclusive discounts</small></p>
                  </div>
                  <div className="col-md-4">
                    <div style={{ fontSize: '32px' }}>📦</div>
                    <p className="mb-0" style={{ color: '#666' }}><small>Track your orders in real-time</small></p>
                  </div>
                  <div className="col-md-4">
                    <div style={{ fontSize: '32px' }}>🔄</div>
                    <p className="mb-0" style={{ color: '#666' }}><small>Request refunds within 7 days via Payment History</small></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardUser;