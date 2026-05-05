import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PaymentForm from "./PaymentForm";

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        console.error("❌ No order ID provided");
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log("📦 Fetching order with ID:", orderId);
        const response = await axios.get(`http://localhost:5000/orders/${orderId}`);
        
        console.log("✅ Order response:", response.data);
        
        if (response.data && response.data.order) {
          console.log("✅ Order loaded successfully");
          setOrder(response.data.order);
        } else {
          console.error("❌ Order not found in response");
          setError("Order not found");
        }
      } catch (err) {
        console.error("❌ Error fetching order:", err);
        console.error("Error details:", err.response?.data);
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <div>Loading order details...</div>
          <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
            Order ID: {orderId}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
          <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>{error}</h2>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            Order ID: {orderId}
          </p>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            The order you're looking for doesn't exist or couldn't be loaded.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '12px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              ← Back to Products
            </button>
            <button
              onClick={() => navigate('/cart')}
              style={{
                padding: '12px 24px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              🛒 View Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
          <h2 style={{ color: '#333', marginBottom: '15px' }}>Order Not Found</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            We couldn't find the order you're looking for.
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  return <PaymentForm order={order} />;
};

export default PaymentPage;