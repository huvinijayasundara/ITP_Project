// components/Cart/Cart.js - COMPLETE FIXED VERSION
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // ✅ Fetch cart using authenticated route
  const fetchCart = useCallback(async () => {
    if (!token) {
      console.log("❌ No token found");
      setLoading(false);
      return;
    }

    try {
      console.log("🛒 Fetching cart with token...");
      
      const response = await axios.get('http://localhost:5000/cart/my-cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("✅ Cart response:", response.data);
      
      if (response.data && response.data.cart) {
        setCart(response.data.cart);
      } else {
        setCart({
          userId: userId,
          items: [],
          total: 0
        });
      }
    } catch (error) {
      console.error("❌ Error loading cart:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        alert('⚠️ Session expired. Please login again.');
        localStorage.clear();
        navigate('/login');
        return;
      }
      
      setCart({
        userId: userId,
        items: [],
        total: 0
      });
    } finally {
      setLoading(false);
    }
  }, [token, userId, navigate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Update quantity in cart
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    try {
      console.log("🔄 Updating quantity:", { productId, newQuantity });
      
      await axios.put('http://localhost:5000/cart/update', {
        productId,
        quantity: newQuantity
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      fetchCart();
    } catch (error) {
      console.error("❌ Error updating quantity:", error.response?.data || error.message);
      alert('⚠️ Error updating cart: ' + (error.response?.data?.message || 'Please try again'));
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      console.log("🗑️ Removing item:", productId);
      
      await axios.post('http://localhost:5000/cart/remove', {
        productId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      fetchCart();
      alert('✅ Item removed!');
    } catch (error) {
      console.error("❌ Error removing item:", error.response?.data || error.message);
      alert('⚠️ Error removing item: ' + (error.response?.data?.message || 'Please try again'));
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!window.confirm('Clear your cart?')) return;

    try {
      console.log("🧹 Clearing cart...");
      
      await axios.post('http://localhost:5000/cart/clear', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setCart({
        userId: userId,
        items: [],
        total: 0
      });
      setAppliedDiscount(null);
      setPromoCode("");
      setPromoError("");
      setPromoSuccess("");
      alert('✅ Cart cleared!');
    } catch (error) {
      console.error("❌ Error clearing cart:", error.response?.data || error.message);
      alert('⚠️ Error clearing cart: ' + (error.response?.data?.message || 'Please try again'));
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => {
      const price = item.productId?.Price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  };

  // Calculate discount amount
  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    const subtotal = calculateSubtotal();
    
    if (appliedDiscount.discountType === 'percentage') {
      return (subtotal * appliedDiscount.discountValue) / 100;
    }
    
    return Math.min(appliedDiscount.discountValue, subtotal);
  };

  // Calculate tax (10% on subtotal after discount)
  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const taxableAmount = subtotal - discount;
    return taxableAmount * 0.1;
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    const shipping = 300;
    return subtotal - discount + tax + shipping;
  };

  // ✅ Apply promo code with proper backend validation
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      setPromoSuccess("");
      return;
    }

    setCheckingPromo(true);
    setPromoError("");
    setPromoSuccess("");

    try {
      const codeToCheck = promoCode.trim().toUpperCase();
      const subtotal = calculateSubtotal();
      
      // Get cart categories for validation
      const categories = cart?.items
        ?.map(item => item.productId?.category)
        .filter(Boolean) || [];

      console.log("🎫 Validating promo code:", codeToCheck);
      console.log("📊 Cart total:", subtotal);
      console.log("📦 Categories:", categories);
      
      // ✅ Call the BACKEND validation endpoint
      const response = await axios.post(
        'http://localhost:5000/api/discounts/validate',
        {
          code: codeToCheck,
          cartTotal: subtotal,
          categories: categories
        }
      );

      console.log("✅ Validation response:", response.data);

      if (response.data.success && response.data.discount) {
        const discount = response.data.discount;
        
        // Apply the validated discount
        setAppliedDiscount({
          _id: discount._id,
          discountCode: discount.discountCode,
          title: discount.title,
          description: discount.description,
          discountValue: discount.discountValue,
          discountType: discount.discountType,
          validFrom: discount.validFrom,
          validTo: discount.validTo
        });

        // Calculate and show savings
        const savingsAmount = discount.discountType === 'percentage'
          ? (subtotal * discount.discountValue) / 100
          : Math.min(discount.discountValue, subtotal);

        setPromoSuccess(`✅ ${discount.title} applied! You save Rs. ${savingsAmount.toFixed(2)}`);
        setPromoError("");
        
        console.log("✅ Discount applied successfully:", discount.discountCode);
        
      } else {
        setPromoError("❌ Invalid discount code");
        setPromoSuccess("");
        setAppliedDiscount(null);
      }

    } catch (error) {
      console.error("❌ Error validating promo code:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to validate discount code";
      
      setPromoError(`❌ ${errorMessage}`);
      setPromoSuccess("");
      setAppliedDiscount(null);
      
    } finally {
      setCheckingPromo(false);
    }
  };

  // Remove discount
  const removeDiscount = () => {
    setAppliedDiscount(null);
    setPromoCode("");
    setPromoError("");
    setPromoSuccess("");
    console.log("🗑️ Discount removed");
  };

  // ✅ Handle checkout with discount info transfer
  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert('❌ Your cart is empty!');
      return;
    }

    try {
      setCheckoutLoading(true);

      const subtotal = calculateSubtotal();
      const discountAmount = calculateDiscount();
      const tax = calculateTax();
      const shippingFee = 300;
      const totalAmount = subtotal - discountAmount + tax + shippingFee;

      // ✅ Store discount info in localStorage for PaymentForm
      if (appliedDiscount) {
        localStorage.setItem('appliedDiscount', JSON.stringify({
          code: appliedDiscount.discountCode,
          type: appliedDiscount.discountType,
          value: appliedDiscount.discountValue,
          amount: discountAmount
        }));
      } else {
        localStorage.removeItem('appliedDiscount');
      }

      // ✅ Store checkout summary for PaymentForm
      localStorage.setItem('checkoutSummary', JSON.stringify({
        subtotal,
        discountAmount,
        discountCode: appliedDiscount?.discountCode || null,
        tax,
        shippingFee,
        totalAmount
      }));

      console.log("✅ Checkout data saved to localStorage:", {
        discountAmount,
        discountCode: appliedDiscount?.discountCode,
        totalAmount
      });

      // Navigate to payment form
      navigate('/paymentform');

    } catch (error) {
      console.error('❌ Checkout error:', error.response?.data || error.message);
      alert('❌ Checkout failed: ' + (error.response?.data?.message || 'Please try again'));
    } finally {
      setCheckoutLoading(false);
    }
  };

  // If user not logged in
  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '60px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Login Required</h3>
          <p style={{ margin: '0 0 20px 0', color: '#666' }}>Please login to view your cart</p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '24px'
      }}>
        ⏳ Loading cart...
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const itemCount = cartItems.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '32px' }}>
              🛒 My Shopping Cart
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
            </p>
          </div>
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
            ← Continue Shopping
          </button>
        </div>

        {itemCount === 0 ? (
          <div style={{
            background: 'white',
            padding: '60px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Your cart is empty</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>Start shopping to add items</p>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              🎨 Browse Products
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 350px',
            gap: '20px',
            alignItems: 'start'
          }}>
            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {cartItems.map((item) => {
                const product = item.productId;
                const productId = product._id || product;
                
                return (
                  <div
                    key={productId}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Product Image */}
                    <div
                      onClick={() => navigate(`/products/${productId}`)}
                      style={{
                        width: '120px',
                        height: '120px',
                        background: product.imageUrl
                          ? `url(http://localhost:5000/uploads/${product.imageUrl})`
                          : 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '8px',
                        flexShrink: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        color: 'white'
                      }}
                    >
                      {!product.imageUrl && '🎨'}
                    </div>

                    {/* Product Details */}
                    <div style={{ flex: 1 }}>
                      <h3 
                        style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px', cursor: 'pointer' }}
                        onClick={() => navigate(`/products/${productId}`)}
                      >
                        {product.product_name}
                      </h3>
                      
                      <p style={{
                        color: '#666',
                        fontSize: '14px',
                        margin: '0 0 12px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.Description}
                      </p>

                      <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#FF6B35',
                        marginBottom: '12px'
                      }}>
                        Rs. {product.Price?.toFixed(2) || '0.00'}
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <span style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>Quantity:</span>
                        <button
                          onClick={() => updateQuantity(productId, item.quantity - 1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            background: '#f0f0f0',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold'
                          }}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(productId, parseInt(e.target.value) || 1)}
                          min="1"
                          max={product.Quantity}
                          style={{
                            width: '60px',
                            height: '32px',
                            textAlign: 'center',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        />
                        <button
                          onClick={() => updateQuantity(productId, item.quantity + 1)}
                          disabled={item.quantity >= product.Quantity}
                          style={{
                            width: '32px',
                            height: '32px',
                            background: item.quantity >= product.Quantity ? '#e0e0e0' : '#f0f0f0',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: item.quantity >= product.Quantity ? 'not-allowed' : 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            opacity: item.quantity >= product.Quantity ? 0.5 : 1
                          }}
                        >
                          +
                        </button>
                        <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                          ({product.Quantity} available)
                        </span>
                      </div>

                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                        Subtotal: Rs. {((product.Price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(productId)}
                      style={{
                        padding: '10px 16px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                );
              })}

              {/* Clear Cart Button */}
              {itemCount > 0 && (
                <button
                  onClick={clearCart}
                  style={{
                    padding: '12px',
                    background: 'white',
                    color: '#dc3545',
                    border: '2px solid #dc3545',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Clear Cart
                </button>
              )}
            </div>

            {/* Order Summary */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '20px'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
                📋 Order Summary
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '15px',
                  color: '#666'
                }}>
                  <span>Subtotal ({itemCount} items)</span>
                  <span style={{ fontWeight: '600' }}>Rs. {calculateSubtotal().toFixed(2)}</span>
                </div>

                {appliedDiscount && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    fontSize: '15px',
                    color: '#10b981',
                    fontWeight: '600'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🎉 Discount ({appliedDiscount.discountCode})
                      <button
                        onClick={removeDiscount}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '2px 6px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✕
                      </button>
                    </span>
                    <span>- Rs. {calculateDiscount().toFixed(2)}</span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '15px',
                  color: '#666'
                }}>
                  <span>Tax (10%)</span>
                  <span style={{ fontWeight: '600' }}>Rs. {calculateTax().toFixed(2)}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '15px',
                  color: '#666'
                }}>
                  <span>Shipping</span>
                  <span style={{ fontWeight: '600', color: '#28a745' }}>Rs. 300.00</span>
                </div>
              </div>

              {/* Promo Code Section */}
              {!appliedDiscount && (
                <div style={{
                  marginBottom: '20px',
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '2px dashed #e0e0e0'
                }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '10px'
                  }}>
                    🎫 Have a promo code?
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError("");
                        setPromoSuccess("");
                      }}
                      placeholder="Enter code (e.g. X10)"
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: promoError ? '2px solid #ef4444' : '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                      disabled={checkingPromo}
                    />
                    <button
                      onClick={applyPromoCode}
                      disabled={checkingPromo || !promoCode.trim()}
                      style={{
                        padding: '10px 16px',
                        background: checkingPromo || !promoCode.trim() ? '#9ca3af' : '#884d2a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: checkingPromo || !promoCode.trim() ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}
                    >
                      {checkingPromo ? '⏳' : 'Apply'}
                    </button>
                  </div>
                  {promoError && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#ef4444', fontWeight: '500' }}>
                      {promoError}
                    </p>
                  )}
                  {promoSuccess && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
                      {promoSuccess}
                    </p>
                  )}
                </div>
              )}

              {/* Applied Discount Display */}
              {appliedDiscount && (
                <div style={{
                  marginBottom: '20px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
                  borderRadius: '12px',
                  border: '2px solid #10b981'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#065f46',
                        marginBottom: '6px'
                      }}>
                        🎉 Discount Applied!
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#047857', marginBottom: '4px' }}>
                        {appliedDiscount.discountCode}
                      </div>
                      <div style={{ fontSize: '12px', color: '#065f46' }}>
                        {appliedDiscount.title}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#047857', marginTop: '8px' }}>
                        You save: Rs. {calculateDiscount().toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={removeDiscount}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Total */}
              <div style={{
                borderTop: '2px solid #f0f0f0',
                paddingTop: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  <span>Total</span>
                  <span style={{ color: '#FF6B35' }}>
                    Rs. {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: checkoutLoading ? '#9ca3af' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '12px'
                }}
              >
                {checkoutLoading ? '⏳ Processing...' : '💳 Proceed to Checkout'}
              </button>

              <button
                onClick={() => navigate('/products')}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                ← Continue Shopping
              </button>

              {/* Security Badges */}
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '8px' }}>
                  ✓ Secure Payment
                </div>
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '8px' }}>
                  ✓ Free Shipping on all orders
                </div>
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  ✓ 30-Day Return Policy
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;