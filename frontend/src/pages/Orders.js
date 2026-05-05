import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Clock, CheckCircle, XCircle, Truck, Eye, Trash2, RefreshCw } from 'lucide-react';

const BRAND_BROWN = '#8B4513';
const BRAND_TAN = '#B8764F';

// ✅ Helper function to safely format numbers
const formatPrice = (value) => {
  const num = Number(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

function StatusBadge({ status }) {
  const badges = {
    paid: { bg: '#28a745', icon: CheckCircle, label: 'Paid' },
    pending: { bg: '#ffc107', icon: Clock, label: 'Pending' },
    cancelled: { bg: '#dc3545', icon: XCircle, label: 'Cancelled' },
    processing: { bg: '#17a2b8', icon: Truck, label: 'Processing' },
    shipped: { bg: '#6c757d', icon: Package, label: 'Shipped' },
    delivered: { bg: '#28a745', icon: CheckCircle, label: 'Delivered' }
  };
  
  const config = badges[status?.toLowerCase()] || badges.pending;
  const Icon = config.icon;
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600',
      backgroundColor: config.bg + '20',
      color: config.bg,
      border: `1px solid ${config.bg}40`
    }}>
      <Icon size={14} />
      {config.label}
    </span>
  );
}

function OrderDetailsModal({ order, onClose, onUpdateStatus, isAdmin }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const handleUpdate = async () => {
    if (newStatus === order.status) {
      alert('Status is already ' + newStatus);
      return;
    }

    setUpdating(true);
    try {
      await onUpdateStatus(order._id, newStatus);
      alert('✅ Order status updated successfully!');
      onClose();
    } catch (error) {
      alert('❌ Failed to update order: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '2rem',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#999'
          }}
        >
          ×
        </button>

        <h2 style={{ marginBottom: '1.5rem', color: BRAND_BROWN }}>
          Order Details #{order._id?.slice(-8)}
        </h2>

        {/* Customer Info */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Customer Information</h3>
          <p><strong>Name:</strong> {order.userId?.name || 'N/A'}</p>
          <p><strong>Email:</strong> {order.userId?.gmail || 'N/A'}</p>
          <p><strong>Phone:</strong> {order.userId?.phoneNumber || 'N/A'}</p>
        </div>

        {/* Order Items */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Order Items</h3>
          {order.items?.map((item, idx) => (
            <div key={idx} style={{
              padding: '0.75rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '6px',
              marginBottom: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: '600' }}>{item.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  Quantity: {item.quantity} × Rs. {formatPrice(item.price)}
                </div>
              </div>
              <div style={{ fontWeight: '600', color: BRAND_BROWN }}>
                Rs. {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal:</span>
            <span>Rs. {formatPrice(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#10b981' }}>
              <span>Discount ({order.discountCode}):</span>
              <span>- Rs. {formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Tax:</span>
            <span>Rs. {formatPrice(order.tax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Shipping:</span>
            <span>Rs. {formatPrice(order.shippingFee)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            paddingTop: '0.5rem', 
            borderTop: '2px solid #ddd',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            color: BRAND_BROWN
          }}>
            <span>Total:</span>
            <span>Rs. {formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Status Update - Only for Admin */}
        {isAdmin && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Update Status</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem'
                }}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                onClick={handleUpdate}
                disabled={updating || newStatus === order.status}
                style={{
                  backgroundColor: newStatus === order.status ? '#ccc' : BRAND_BROWN,
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: newStatus === order.status ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Current Status: <StatusBadge status={order.status} />
            </div>
          </div>
        )}

        {/* Order Info */}
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Last Updated:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, isAdmin, onView, onDelete }) {
  const navigate = useNavigate();
  
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s',
      cursor: 'pointer',
      border: '1px solid #f0f0f0'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}
    onClick={() => navigate(`/track/${order._id}`)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
            Order #{order._id?.slice(-8)}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>{formattedDate}</p>
          {isAdmin && order.userId && (
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '4px' }}>
              Customer: {order.userId?.name || 'N/A'}
            </p>
          )}
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '8px' }}>
          <strong>Items:</strong>
        </div>
        {order.items?.slice(0, 3).map((item, idx) => (
          <div key={idx} style={{ 
            fontSize: '0.875rem', 
            color: '#444',
            padding: '8px',
            backgroundColor: '#f9f9f9',
            borderRadius: '6px',
            marginBottom: '4px'
          }}>
            {item.name} × {item.quantity} = Rs. {formatPrice(item.price * item.quantity)}
          </div>
        ))}
        {order.items?.length > 3 && (
          <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>
            + {order.items.length - 3} more items
          </div>
        )}
      </div>

      {order.discountAmount > 0 && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          borderRadius: '6px',
          padding: '8px 12px',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          color: '#065f46'
        }}>
          🎉 Discount ({order.discountCode}): - Rs. {formatPrice(order.discountAmount)}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '1px solid #f0f0f0'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '4px' }}>Total Amount</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: BRAND_BROWN }}>
            Rs. {formatPrice(order.totalAmount)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isAdmin && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(order);
                }}
                style={{
                  backgroundColor: BRAND_TAN,
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = BRAND_BROWN}
                onMouseLeave={(e) => e.target.style.backgroundColor = BRAND_TAN}
              >
                <Eye size={14} />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(order._id);
                }}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          {!isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/track/${order._id}`);
              }}
              style={{
                backgroundColor: BRAND_TAN,
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = BRAND_BROWN}
              onMouseLeave={(e) => e.target.style.backgroundColor = BRAND_TAN}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || localStorage.getItem('role');
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (!token) {
      alert('⚠️ Please login to view orders');
      navigate('/login');
      return;
    }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      console.log(isAdmin ? "📋 Fetching all orders (Admin)" : "📋 Fetching user orders");
      
      // Admin: fetch all orders, User: fetch only their orders
      const endpoint = isAdmin 
        ? 'http://localhost:5000/api/orders'
        : `http://localhost:5000/api/orders/user/${userId}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      console.log("📦 Server response:", data);
      
      if (response.ok && data.success) {
        const orderList = data.orders || [];
        console.log(`✅ Orders fetched: ${orderList.length}`);
        setOrders(orderList);
        setFilteredOrders(orderList);
        setError('');
      } else {
        const errorMsg = data.message || 'Failed to fetch orders';
        console.error("❌ Error:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setError('Failed to connect to server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to ${newStatus}`);
      
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Order updated successfully');
        await fetchOrders();
        return data.order;
      } else {
        throw new Error(data.message || 'Failed to update order');
      }
    } catch (err) {
      console.error('❌ Update error:', err);
      throw err;
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('✅ Order deleted successfully');
        await fetchOrders();
      } else {
        alert('❌ Failed to delete order: ' + data.message);
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert('❌ Failed to delete order');
    }
  };

  useEffect(() => {
    let filtered = orders;

    if (filter !== 'all') {
      filtered = filtered.filter(order =>
        order.status?.toLowerCase() === filter.toLowerCase()
      );
    }

    if (search) {
      filtered = filtered.filter(order =>
        order._id?.toLowerCase().includes(search.toLowerCase()) ||
        order.items?.some(item =>
          item.name?.toLowerCase().includes(search.toLowerCase())
        ) ||
        (isAdmin && order.userId?.name?.toLowerCase().includes(search.toLowerCase())) ||
        (isAdmin && order.userId?.gmail?.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredOrders(filtered);
  }, [orders, filter, search, isAdmin]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status?.toLowerCase() === 'pending').length,
    processing: orders.filter(o => o.status?.toLowerCase() === 'processing').length,
    shipped: orders.filter(o => o.status?.toLowerCase() === 'shipped').length,
    delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
    cancelled: orders.filter(o => o.status?.toLowerCase() === 'cancelled').length,
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #f3f3f3',
            borderTop: `4px solid ${BRAND_TAN}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#666', fontSize: '1.125rem' }}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <section style={{ backgroundColor: BRAND_TAN, padding: '60px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                {isAdmin ? '👨‍💼 Order Management' : '📦 My Orders'}
              </h1>
              <p style={{ fontSize: '1.125rem', color: 'white', opacity: 0.9 }}>
                {isAdmin ? 'Manage all customer orders' : `${stats.total} orders total`}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {isAdmin && (
                <button
                  onClick={fetchOrders}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'white',
                    color: BRAND_BROWN,
                    padding: '14px 28px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  <RefreshCw size={20} />
                  Refresh
                </button>
              )}
              {!isAdmin && (
                <button
                  onClick={() => navigate('/products')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'white',
                    color: BRAND_BROWN,
                    padding: '14px 28px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <Plus size={20} />
                  Shop More
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Orders', value: stats.total, color: '#6c757d', icon: Package },
            { label: 'Pending', value: stats.pending, color: '#ffc107', icon: Clock },
            { label: 'Processing', value: stats.processing, color: '#17a2b8', icon: Truck },
            ...(isAdmin ? [
              { label: 'Shipped', value: stats.shipped, color: '#6c757d', icon: Package },
              { label: 'Delivered', value: stats.delivered, color: '#28a745', icon: CheckCircle },
              { label: 'Cancelled', value: stats.cancelled, color: '#dc3545', icon: XCircle }
            ] : [
              { label: 'Delivered', value: stats.delivered, color: '#28a745', icon: CheckCircle }
            ])
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Icon size={24} color={stat.color} />
                  <span style={{ fontSize: '0.875rem', color: '#666', fontWeight: '500' }}>
                    {stat.label}
                  </span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '200px', flexWrap: 'wrap' }}>
              {(isAdmin 
                ? ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']
                : ['all', 'pending', 'processing', 'delivered']
              ).map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: filter === status ? BRAND_BROWN : '#f5f5f5',
                    color: filter === status ? 'white' : '#666',
                    transition: 'all 0.3s'
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', flex: 2, minWidth: '300px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={20} />
              <input
                type="text"
                placeholder={isAdmin ? "Search by order ID, customer, or product..." : "Search orders by ID or product name..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#c33'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Package size={64} color="#ccc" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
              {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
            </h3>
            <p style={{ fontSize: '1rem', color: '#999', marginBottom: '1.5rem' }}>
              {orders.length === 0 
                ? (isAdmin ? 'Orders will appear here once customers make purchases' : 'Start shopping to create your first order!')
                : 'Try adjusting your search or filters'}
            </p>
            {orders.length === 0 && !isAdmin && (
              <button
                onClick={() => navigate('/products')}
                style={{
                  backgroundColor: BRAND_BROWN,
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = BRAND_TAN}
                onMouseLeave={(e) => e.target.style.backgroundColor = BRAND_BROWN}
              >
                Browse Products
              </button>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {filteredOrders.map(order => (
              <OrderCard 
                key={order._id} 
                order={order}
                isAdmin={isAdmin}
                onView={setSelectedOrder}
                onDelete={deleteOrder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
          isAdmin={isAdmin}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}