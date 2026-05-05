import React from "react";
import "./OrderSummary.css";

const OrderSummary = ({ 
  items = [], 
  subtotal = 0,
  discountAmount = 0,
  discountCode = null,
  tax = 0,
  shippingFee = 300,
  total = 0 
}) => {
  
  // Calculate subtotal from items if not provided
  const calculatedSubtotal = subtotal || items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  return (
    <div className="order-summary">
      <h3 className="summary-title">📋 Order Summary</h3>
      
      {/* Items List */}
      <div className="order-items">
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-quantity">Qty: {item.quantity}</div>
              </div>
              <div className="item-price">
                Rs. {(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#999',
            fontSize: '14px'
          }}>
            No items in order
          </div>
        )}
      </div>

      {/* Pricing Breakdown */}
      <div className="order-totals">
        <div className="total-row">
          <span>Subtotal ({items.length} items)</span>
          <span>Rs. {calculatedSubtotal.toFixed(2)}</span>
        </div>

        {/* Discount Row */}
        {discountAmount > 0 && (
          <div className="total-row discount-row">
            <span style={{ 
              color: '#10b981', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🎉 Discount
              {discountCode && (
                <span style={{ 
                  fontSize: '12px',
                  background: '#d1fae5',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  color: '#065f46'
                }}>
                  {discountCode}
                </span>
              )}
            </span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>
              - Rs. {discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="total-row">
          <span>Tax (10%)</span>
          <span>Rs. {tax.toFixed(2)}</span>
        </div>

        <div className="total-row">
          <span>Shipping Fee</span>
          <span style={{ color: '#28a745' }}>Rs. {shippingFee.toFixed(2)}</span>
        </div>

        <div className="total-row grand-total">
          <span>Total Amount</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>

        {/* Savings Display */}
        {discountAmount > 0 && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
            borderRadius: '8px',
            border: '2px solid #10b981',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '13px', 
              color: '#065f46',
              fontWeight: 'bold',
              marginBottom: '4px'
            }}>
              🎊 You're Saving
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold',
              color: '#047857'
            }}>
              Rs. {discountAmount.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Security Badges */}
      <div className="security-badges">
        <div className="badge">✓ Secure Payment</div>
        <div className="badge">✓ Fast Delivery</div>
        <div className="badge">✓ 7-Day Return</div>
      </div>
    </div>
  );
};

export default OrderSummary;