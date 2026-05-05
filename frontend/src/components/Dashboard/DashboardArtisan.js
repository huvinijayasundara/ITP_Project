import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function DashboardArtisan() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role !== "artisan") {
      alert("Access denied! Only artisans can access this page.");
      navigate("/profile");
    }
  }, [navigate]);

  const userName = localStorage.getItem("name") || localStorage.getItem("userName") || "artisan";

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
            Welcome, {userName}! 🎨
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#666' }}>Manage your products and sales</p>
        </div>

        <div className="row justify-content-center g-4">
          {/* Products Management Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg rounded-4 h-100 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513'
                  }}>
                    🎨
                  </div>
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>My Products</h4>
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
                    📦 View All Products
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#8B4513',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/addproduct")}
                  >
                    ➕ Add New Product
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#666',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/admin/products")}
                  >
                    ⚙️ Manage Products
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Card */}
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
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>Orders</h4>
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
                    📋 View Orders
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#8B4513',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/display-Transactions")}
                  >
                    💳 View Transactions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Feedback Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg rounded-4 h-100 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513'
                  }}>
                    💬
                  </div>
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>Customer Feedback</h4>
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
                    onClick={() => navigate("/feedback")}
                  >
                    💬 View Feedback
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#8B4513',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/ratings")}
                  >
                    ⭐ Product Ratings
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

        {/* Artisan Tips */}
        <div className="row justify-content-center mt-4">
          <div className="col-lg-10">
            <div className="card shadow-lg rounded-4 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold text-center mb-4" style={{ color: '#8B4513' }}>ℹ️ Artisan Tips</h5>
                <div className="row text-center g-3">
                  <div className="col-md-3">
                    <div style={{ fontSize: '32px' }}>🎨</div>
                    <p className="mb-0" style={{ color: '#666' }}><small>Keep your products updated with quality images</small></p>
                  </div>
                  <div className="col-md-3">
                    <div style={{ fontSize: '32px' }}>📊</div>
                    <p className="mb-0" style={{ color: '#666' }}><small>Monitor customer ratings and feedback</small></p>
                  </div>
                  <div className="col-md-3">
                    <div style={{ fontSize: '32px' }}>💰</div>
                    <p className="mb-0" style={{ color: '#666' }}><small>Track your sales and transactions</small></p>
                  </div>
                  <div className="col-md-3">
                    <div style={{ fontSize: '32px' }}>📦</div>
                    <p className="mb-0" style={{ color: '#666' }}><small>Manage inventory effectively</small></p>
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

export default DashboardArtisan;