import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role !== "admin") {
      alert("Access denied! Only admins can access this page.");
      navigate("/profile");
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
      <div className="container mt-5 mb-5" style={{ flex: 1 }}>
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold" style={{ color: '#8B4513' }}>👨‍💼 Admin Dashboard</h1>
          <p style={{ fontSize: '1.25rem', color: '#666' }}>Manage all aspects of your handicraft store</p>
        </div>

        <div className="row justify-content-center g-4">
          {/* User Management Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg rounded-4 h-100 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513'
                  }}>
                    👥
                  </div>
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>User Management</h4>
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
                    onClick={() => navigate("/userdetails")}
                  >
                    👨‍🎨 Manage Artisans
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#8B4513',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/usercdetails")}
                  >
                    👤 Manage Customers
                  </button>
                </div>
              </div>
            </div>
          </div>

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
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>Products</h4>
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
                    onClick={() => navigate("/admin/products")}
                  >
                    📦 Manage Products
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
                    ➕ Add Product
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Orders & Deliveries Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg rounded-4 h-100 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513'
                  }}>
                    🚚
                  </div>
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>Orders & Deliveries</h4>
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
                    📦 Manage Orders
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#8B4513',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/admin/deliveries")}
                  >
                    🚚 Delivery Management
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Management Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg rounded-4 h-100 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513'
                  }}>
                    💰
                  </div>
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>Financial</h4>
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
                    onClick={() => navigate("/display-Transactions")}
                  >
                    💳 Manage Transactions
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#8B4513',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/manage-refund")}
                  >
                    🔄 Manage Refunds
                  </button>
                   <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#666',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/generate-bill")}
                  >
                    🧾 Generate Bill
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg rounded-4 h-100 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <div style={{ 
                    fontSize: '48px',
                    color: '#8B4513'
                  }}>
                    📢
                  </div>
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>Marketing</h4>
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
                    onClick={() => navigate("/promotions")}
                  >
                    📣 Promotions
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#8B4513',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                    onClick={() => navigate("/discounts")}
                  >
                    🎫 Discounts
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Service Card */}
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
                  <h4 className="fw-bold mt-2" style={{ color: '#333' }}>Customer Service</h4>
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

          {/* Profile Card */}
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

        {/* Admin Info Panel */}
        <div className="row justify-content-center mt-4">
          <div className="col-lg-10">
            <div className="card shadow-lg rounded-4 border-0" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold text-center mb-4" style={{ color: '#8B4513' }}>ℹ️ Admin Responsibilities</h5>
                <div className="row text-center g-3">
                  <div className="col-md-3">
                    <div style={{ fontSize: '32px' }}>📊</div>
                    <p className="mb-0" style={{ color: '#666' }}><small>Monitor all transactions and payments</small></p>
                  </div>
                  <div className="col-md-3">
                    <div style={{ fontSize: '32px' }}>🔄</div>
                    <p className="mb-0" style={{ color: '#666' }}><small>Review and process refund requests</small></p>
                  </div>
                  <div className="col-md-3">
                    <div style={{ fontSize: '32px' }}>🚚</div>
                    <p className="mb-0" style={{ color: '#666' }}><small>Manage deliveries and track orders</small></p>
                  </div>
                  <div className="col-md-3">
                    <div style={{ fontSize: '32px' }}>📦</div>
                    <p className="mb-0" style={{ color: '#666' }}><small>Oversee product inventory</small></p>
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

export default Dashboard;