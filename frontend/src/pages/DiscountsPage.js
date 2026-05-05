import React, { useState, useEffect, useCallback } from "react";
import { getDiscounts, deleteDiscount } from "../api/discountApi";
import "../App.css";     
import "../index.css";    
import DiscountForm from "../components/Discount/DiscountForm";
import DiscountList from "../components/Discount/DiscountList";

const DiscountsPage = ({ userRole = "customer" }) => {
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching discounts from API...");
      
      const response = await getDiscounts();
      console.log("API Response:", response);
      
      const discountsData = response.data.discounts || response.data || [];
      const validDiscounts = Array.isArray(discountsData) ? discountsData : [];
      
      console.log("Processed discounts:", validDiscounts);
      setDiscounts(validDiscounts);
      applyFiltersAndSearch(validDiscounts, filterBy, sortBy, searchQuery);
      
    } catch (err) {
      console.error("Error fetching discounts:", err);
      setError(`Failed to load discounts: ${err.message}`);
      setDiscounts([]);
      setFilteredDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, [filterBy, sortBy, searchQuery]);

  const applyFiltersAndSearch = (discountsList, filter, sort, search) => {
    let filtered = [...discountsList];
    
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(d => 
        (d.discountCode || '').toLowerCase().includes(searchLower) ||
        (d.title || '').toLowerCase().includes(searchLower) ||
        (d.description || '').toLowerCase().includes(searchLower)
      );
    }
    
    if (filter === 'active') {
      filtered = filtered.filter(d => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const start = new Date(d.validFrom);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d.validTo);
        end.setHours(23, 59, 59, 999);
        return d.status === 'active' && start <= now && now <= end;
      });
    } else if (filter === 'expired') {
      filtered = filtered.filter(d => {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        const end = new Date(d.validTo);
        end.setHours(23, 59, 59, 999);
        return d.status === 'expired' || end < now;
      });
    } else if (filter === 'paused') {
      filtered = filtered.filter(d => d.status === 'paused');
    } else if (filter === 'upcoming') {
      filtered = filtered.filter(d => {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        const start = new Date(d.validFrom);
        start.setHours(0, 0, 0, 0);
        return start > now;
      });
    }
    
    filtered.sort((a, b) => {
      switch(sort) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'discountValue':
          return (b.discountValue || 0) - (a.discountValue || 0);
        case 'validTo':
          return new Date(a.validTo || 0) - new Date(b.validTo || 0);
        case 'validFrom':
          return new Date(a.validFrom || 0) - new Date(b.validFrom || 0);
        case 'code':
          return (a.discountCode || '').localeCompare(b.discountCode || '');
        case 'createdAt':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
    
    setFilteredDiscounts(filtered);
  };

  const handleDelete = async (id) => {
    try {
      console.log("Deleting discount with ID:", id);
      await deleteDiscount(id);
      
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMsg.innerHTML = '<strong>✓ Success!</strong> Discount deleted successfully!';
      document.body.appendChild(successMsg);
      
      setTimeout(() => successMsg.remove(), 3000);
      
      fetchDiscounts();
    } catch (err) {
      console.error("Error deleting discount:", err);
      alert(`❌ Failed to delete discount: ${err.message}`);
    }
  };

  const handleUpdate = (discountId) => {
    console.log("=== Edit button clicked ===");
    console.log("Discount ID to edit:", discountId);
    
    const discountToEdit = discounts.find(d => d._id === discountId);
    console.log("Found discount to edit:", discountToEdit);
    
    if (discountToEdit) {
      console.log("Setting discount for editing");
      setEditingDiscount(discountToEdit);
      setShowAddForm(true);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } else {
      console.error("Discount not found with ID:", discountId);
      alert("❌ Error: Discount not found");
    }
  };

  const handleCancelEdit = () => {
    console.log("Cancelling edit");
    setEditingDiscount(null);
    setShowAddForm(false);
  };

  const handleFormSuccess = () => {
    console.log("Form submitted successfully, refreshing data...");
    setShowAddForm(false);
    setEditingDiscount(null);
    fetchDiscounts();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    applyFiltersAndSearch(discounts, filterBy, sortBy, value);
  };

  const handleFilterChange = (newFilter) => {
    setFilterBy(newFilter);
    applyFiltersAndSearch(discounts, newFilter, sortBy, searchQuery);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    applyFiltersAndSearch(discounts, filterBy, newSort, searchQuery);
  };

  const clearAllFilters = () => {
    setFilterBy('all');
    setSortBy('createdAt');
    setSearchQuery('');
    applyFiltersAndSearch(discounts, 'all', 'createdAt', '');
  };

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const stats = {
    total: discounts.length,
    active: discounts.filter(d => {
      if (d.status !== 'active') return false;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const start = new Date(d.validFrom);
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      
      const end = new Date(d.validTo);
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      
      return startDay <= today && today <= endDay;
    }).length,
    expired: discounts.filter(d => {
      if (d.status === 'expired') return true;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const end = new Date(d.validTo);
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      
      return endDay < today;
    }).length,
    paused: discounts.filter(d => d.status === 'paused').length,
    upcoming: discounts.filter(d => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const start = new Date(d.validFrom);
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      
      return startDay > today;
    }).length
  };

  if (loading && discounts.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'white',
          padding: '60px 40px',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '5px solid #e0e7ff',
            borderTop: '5px solid #B8764F',
            borderRadius: '50%',
            margin: '0 auto 30px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
            Loading Discounts
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Fetching the latest offers for you...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Handcraft Management Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            color: '#1f2937',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            🎨 Handcraft Management
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '0' }}>
            Complete business management solution
          </p>
        </div>

        {/* Main Discount Section Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
            borderRadius: '50%',
            opacity: '0.1'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '50%',
            opacity: '0.1'
          }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <span style={{ fontSize: '48px' }}>🎫</span>
              <h2 style={{
                fontSize: '42px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0
              }}>
                Discounts
              </h2>
            </div>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '20px' }}>
              {userRole === "admin" 
                ? "Create and manage discount codes for your customers" 
                : "Browse available discount codes and save on your purchases"
              }
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 20px',
                borderRadius: '50px',
                fontSize: '14px',
                fontWeight: 'bold',
                background: userRole === "admin" 
                  ? 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)'
                  : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                {userRole === "admin" ? "👑 Admin Access" : "👤 Customer View"}
              </span>
              
              {loading && discounts.length > 0 && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#fef3c7',
                  color: '#92400e',
                  borderRadius: '50px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: '2px solid #fbbf24'
                }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid #92400e',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Updating...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '30px',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '32px', flexShrink: 0 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#991b1b', marginBottom: '8px' }}>
                  Error Loading Discounts
                </h3>
                <p style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>
                <button 
                  onClick={fetchDiscounts}
                  style={{
                    padding: '10px 20px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#dc2626'}
                  onMouseOut={(e) => e.target.style.background = '#ef4444'}
                >
                  🔄 Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Controls */}
        {userRole === "admin" && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: 0
              }}>
                <span style={{ fontSize: '28px' }}>⚙️</span>
                Quick Actions
              </h3>
              <button
                onClick={() => {
                  setEditingDiscount(null);
                  setShowAddForm(!showAddForm);
                }}
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer',
                  border: 'none',
                  background: showAddForm
                    ? '#6b7280'
                    : 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s',
                  transform: 'scale(1)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                {showAddForm ? "✕ Close Form" : "➕ New Discount"}
              </button>
            </div>

            {showAddForm && (
              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '2px solid #e5e7eb'
              }}>
                <DiscountForm 
                  onAdded={handleFormSuccess}
                  editData={editingDiscount}
                  onCancelEdit={handleCancelEdit}
                />
              </div>
            )}
          </div>
        )}

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {[
            { key: 'all', label: 'Total', emoji: '📊', count: stats.total, gradient: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)' },
            { key: 'active', label: 'Active', emoji: '✅', count: stats.active, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
            { key: 'upcoming', label: 'Upcoming', emoji: '🚀', count: stats.upcoming, gradient: 'linear-gradient(135deg, #B8764F 0%, #2563eb 100%)' },
            { key: 'paused', label: 'Paused', emoji: '⏸️', count: stats.paused, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
            { key: 'expired', label: 'Expired', emoji: '❌', count: stats.expired, gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => handleFilterChange(stat.key)}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                border: filterBy === stat.key ? '3px solid' : '3px solid transparent',
                borderImage: filterBy === stat.key ? stat.gradient + ' 1' : 'none',
                boxShadow: filterBy === stat.key
                  ? '0 8px 30px rgba(0,0,0,0.12)'
                  : '0 4px 15px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                transform: 'translateY(0)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{stat.emoji}</div>
              <h4 style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#6b7280',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {stat.label}
              </h4>
              <p style={{
                fontSize: '32px',
                fontWeight: '900',
                background: stat.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0
              }}>
                {stat.count}
              </p>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          {/* Header with Search */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: 0
            }}>
              <span style={{ fontSize: '28px' }}>📋</span>
              {userRole === "admin" ? "All Discounts" : "Available Offers"}
            </h3>
            
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by code, title, or description..."
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 45px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#B8764F'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <span style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px'
              }}>
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    applyFiltersAndSearch(discounts, filterBy, sortBy, '');
                  }}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    padding: '4px 8px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filters and Sort */}
          {userRole === "admin" && (
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #FFF9F0 0%, #F5DEB3 100%)',
              borderRadius: '12px',
              border: '2px solid #E8D4C0',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#4b5563',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Filter:
                  </span>
                  {['all', 'active', 'upcoming', 'paused', 'expired'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => handleFilterChange(filter)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        border: 'none',
                        background: filterBy === filter
                          ? 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)'
                          : 'white',
                        color: filterBy === filter ? 'white' : '#4b5563',
                        boxShadow: filterBy === filter
                          ? '0 4px 12px rgba(184, 118, 79, 0.4)'
                          : '0 2px 6px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s'
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#4b5563',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={{
                      padding: '8px 32px 8px 12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: 'white',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="title">Title</option>
                    <option value="code">Code</option>
                    <option value="discountValue">Value</option>
                    <option value="validFrom">Start Date</option>
                    <option value="validTo">End Date</option>
                  </select>

                  {(filterBy !== 'all' || sortBy !== 'createdAt' || searchQuery) && (
                    <button
                      onClick={clearAllFilters}
                      style={{
                        padding: '8px 16px',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '2px solid #fecaca',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#fecaca'}
                      onMouseOut={(e) => e.target.style.background = '#fee2e2'}
                    >
                      🔄 Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Results Info */}
          {userRole === "admin" && (
            <div style={{
              padding: '16px',
              background: '#FFF9F0',
              borderLeft: '4px solid #B8764F',
              borderRadius: '12px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#8B4513',
                fontWeight: '600',
                margin: 0
              }}>
                📊 Showing <strong style={{ fontSize: '18px' }}>{filteredDiscounts.length}</strong> of{' '}
                <strong style={{ fontSize: '18px' }}>{discounts.length}</strong> discounts
                {filterBy !== 'all' && ` (filtered by: ${filterBy})`}
                {searchQuery && ` (search: "${searchQuery}")`}
              </p>
            </div>
          )}
          
          {/* Discounts List */}
          <DiscountList 
            discounts={filteredDiscounts} 
            onDelete={userRole === "admin" ? handleDelete : null}
            onUpdate={userRole === "admin" ? handleUpdate : null}
            userRole={userRole}
          />
        </div>

        {/* Floating Action Button (Admin Only) */}
        {userRole === "admin" && !showAddForm && (
          <button
            onClick={() => {
              setEditingDiscount(null);
              setShowAddForm(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 28px',
              background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              boxShadow: '0 8px 30px rgba(184, 118, 79, 0.4)',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              zIndex: 1000,
              transition: 'all 0.3s',
              transform: 'scale(1)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 12px 40px rgba(184, 118, 79, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 8px 30px rgba(184, 118, 79, 0.4)';
            }}
            title="Add New Discount"
          >
            <span style={{
              fontSize: '24px',
              fontWeight: '900',
              transition: 'transform 0.3s'
            }}>
              +
            </span>
            <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>
              Add Discount
            </span>
          </button>
        )}
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          /* Responsive adjustments */
        }
      `}</style>
    </div>
  );
};

export default DiscountsPage;