import React from "react";
import "../../App.css";     
import "../../index.css"; 

const DiscountList = ({ discounts, onDelete, onUpdate, userRole = "customer" }) => {
  const isActive = (validFrom, validTo, status) => {
    const now = new Date();
    const start = new Date(validFrom);
    const end = new Date(validTo);
    return start <= now && now <= end && status === "active";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCopyCode = (code, title) => {
    navigator.clipboard.writeText(code).then(() => {
      alert(`Copied: ${code}`);
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`Copied: ${code}`);
    });
  };

  if (!Array.isArray(discounts) || discounts.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4">🎫</div>
        <h3 className="text-xl font-bold mb-2">No discounts available</h3>
        <p className="text-gray-600">
          {userRole === "admin" 
            ? "Create your first discount code to get started" 
            : "Check back later for new discount offers"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {discounts.map((discount) => {
        const active = isActive(discount.validFrom, discount.validTo, discount.status);
        
        return (
          <div
            key={discount._id}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '1.5rem',
              borderLeft: `4px solid ${active ? '#28a745' : '#dc3545'}`,
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
            onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
          >
            
            {/* Status Badge */}
            <div className="flex justify-between items-start mb-4">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#333' }}>
                {discount.title || "Untitled Discount"}
              </h3>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: active ? '#E8F5E9' : '#FFEBEE',
                color: active ? '#2E7D32' : '#C62828'
              }}>
                {active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Discount Value */}
            <div style={{
              textAlign: 'center',
              marginBottom: '1rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
              color: 'white',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                {discount.discountType === 'percentage' 
                  ? `${discount.discountValue}% OFF`
                  : `$${discount.discountValue} OFF`
                }
              </div>
            </div>

            {/* Discount Code */}
            <div style={{
              backgroundColor: '#F5F5F5',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '2px solid #E8D4C0'
            }}>
              <div className="flex justify-between items-center">
                <div>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#666', 
                    textTransform: 'uppercase', 
                    marginBottom: '4px',
                    fontWeight: '600'
                  }}>
                    Code
                  </p>
                  <p style={{ 
                    fontSize: '1.125rem', 
                    fontFamily: 'monospace', 
                    fontWeight: 'bold', 
                    color: '#8B4513',
                    margin: 0
                  }}>
                    {discount.discountCode}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyCode(discount.discountCode, discount.title)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#B8764F',
                    color: 'white',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#8B4513'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#B8764F'}
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Description */}
            {discount.description && (
              <div style={{
                marginBottom: '1rem',
                padding: '12px',
                backgroundColor: '#F5DEB3',
                borderRadius: '8px',
                border: '1px solid #E8D4C0'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#666', fontStyle: 'italic', margin: 0 }}>
                  "{discount.description}"
                </p>
              </div>
            )}

            {/* Full Details */}
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>Type:</span>
                <span style={{ fontWeight: '600', color: '#333' }}>
                  {discount.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                </span>
              </div>
              
              <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>Valid From:</span>
                <span style={{ fontWeight: '600', color: '#333' }}>{formatDate(discount.validFrom)}</span>
              </div>
              
              <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>Valid Until:</span>
                <span style={{ fontWeight: '600', color: '#333' }}>{formatDate(discount.validTo)}</span>
              </div>
              
              <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>Status:</span>
                <span style={{ fontWeight: '600', color: '#333', textTransform: 'capitalize' }}>{discount.status}</span>
              </div>

              {discount.minimumOrderAmount > 0 && (
                <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Min Order:</span>
                  <span style={{ fontWeight: '600', color: '#333' }}>${discount.minimumOrderAmount}</span>
                </div>
              )}

              {discount.usageLimit && (
                <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Usage Limit:</span>
                  <span style={{ fontWeight: '600', color: '#333' }}>
                    {discount.usedCount || 0}/{discount.usageLimit}
                  </span>
                </div>
              )}

              {discount.applicableCategories && discount.applicableCategories.length > 0 && (
                <div style={{ paddingTop: '8px' }}>
                  <span style={{ color: '#666', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>
                    Applicable Categories:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {discount.applicableCategories.map(category => (
                      <span key={category} style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#E8F5E9',
                        color: '#2E7D32',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #A5D6A7'
                      }}>
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {discount.excludedCategories && discount.excludedCategories.length > 0 && (
                <div style={{ paddingTop: '8px' }}>
                  <span style={{ color: '#666', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>
                    Excluded Categories:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {discount.excludedCategories.map(category => (
                      <span key={category} style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#FFEBEE',
                        color: '#C62828',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #EF9A9A'
                      }}>
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ borderTop: '1px solid #E8D4C0', paddingTop: '1rem' }}>
              {userRole === "admin" ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onUpdate && onUpdate(discount._id)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#B8764F',
                      color: 'white',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#8B4513'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#B8764F'}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(discount._id)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                  >
                    Delete
                  </button>
                </div>
              ) : active ? (
                <button
                  onClick={() => handleCopyCode(discount.discountCode, discount.title)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#B8764F',
                    color: 'white',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#8B4513'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#B8764F'}
                >
                  Copy & Use Code
                </button>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px', color: '#666', fontSize: '0.875rem' }}>
                  This discount is no longer available
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DiscountList;