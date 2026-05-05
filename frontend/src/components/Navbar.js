import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, User, Home, Package, Tag, Mail, Info, LayoutDashboard, Crown, Palette, UserCircle } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isArtisan, setIsArtisan] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    
    if (userData || role) {
      let userObj = userData ? JSON.parse(userData) : {};
      if (role) userObj.role = role;
      if (name) userObj.name = name;
      
      setUser(userObj);
      setIsAdmin(userObj.role === "admin");
      setIsArtisan(userObj.role === "artisan");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    setUser(null);
    setIsAdmin(false);
    setIsArtisan(false);
    setIsProfileMenuOpen(false);
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (isAdmin) return "/admin/dashboard";
    if (isArtisan) return "/artisan/dashboard";
    return "/user/dashboard";
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return {
        icon: Crown,
        text: "Admin",
        bgColor: "#DC2626",
        textColor: "#FFFFFF"
      };
    }
    if (isArtisan) {
      return {
        icon: Palette,
        text: "Artisan",
        bgColor: "#059669",
        textColor: "#FFFFFF"
      };
    }
    return {
      icon: UserCircle,
      text: "Customer",
      bgColor: "#2563EB",
      textColor: "#FFFFFF"
    };
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Products", path: "/products", icon: Package },
    { name: "Promotions", path: "/promotions", icon: Tag },
    { name: "About Us", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Mail },
  ];

  const roleBadge = user ? getRoleBadge() : null;

  return (
    <nav style={{ 
      backgroundColor: 'white', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '64px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          textDecoration: 'none'
        }}>
          <Package style={{ height: '32px', width: '32px', color: '#8B4513' }} />
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#8B4513'
          }}>
            Craftlink
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ 
          display: 'none',
          alignItems: 'center',
          gap: '2rem'
        }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                backgroundColor: isActive(link.path) ? '#F5DEB3' : 'transparent',
                color: isActive(link.path) ? '#8B4513' : '#4B5563',
                transition: 'all 0.2s'
              }}
            >
              <link.icon style={{ height: '16px', width: '16px' }} />
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

        {/* Desktop User Menu */}
        <div style={{ 
          display: 'none',
          alignItems: 'center',
          gap: '1rem'
        }} className="desktop-user">
          {user ? (
            <>
              {/* Cart Icon for non-admin users */}
              {!isAdmin && !isArtisan && (
                <Link 
                  to="/cart" 
                  style={{ 
                    color: '#4B5563', 
                    textDecoration: 'none',
                    position: 'relative',
                    padding: '0.5rem'
                  }}
                  title="Shopping Cart"
                >
                  <ShoppingCart style={{ height: '24px', width: '24px' }} />
                </Link>
              )}

              {/* User Profile Section */}
              <div style={{ position: 'relative' }} ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: roleBadge.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      color: '#1F2937',
                      lineHeight: '1.2'
                    }}>
                      {user.name || 'User'}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#6B7280',
                      lineHeight: '1.2'
                    }}>
                      View Profile
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu with Role Badge */}
                {isProfileMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '240px',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    padding: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                    border: '1px solid #E5E7EB'
                  }}>
                    {/* Role Badge in Dropdown */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      backgroundColor: roleBadge.bgColor,
                      color: roleBadge.textColor,
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '0.5rem'
                    }}>
                      <roleBadge.icon style={{ height: '14px', width: '14px' }} />
                      <span>{roleBadge.text} Account</span>
                    </div>

                    {/* Dashboard Link */}
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setIsProfileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s',
                        backgroundColor: 'transparent',
                        marginBottom: '0.25rem'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <LayoutDashboard style={{ height: '18px', width: '18px', color: roleBadge.bgColor }} />
                      <span style={{ fontWeight: '600' }}>Dashboard</span>
                    </Link>

                    {/* Divider */}
                    <div style={{
                      height: '1px',
                      backgroundColor: '#E5E7EB',
                      margin: '0.5rem 0'
                    }}></div>

                    {/* Profile Link */}
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <User style={{ height: '18px', width: '18px' }} />
                      <span>My Profile</span>
                    </Link>

                    {/* Additional Links for Customers */}
                    {!isAdmin && !isArtisan && (
                      <Link
                        to={`/payments/user/${localStorage.getItem('userId')}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          fontSize: '0.875rem',
                          color: '#374151',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <Package style={{ height: '18px', width: '18px' }} />
                        <span>Payment History</span>
                      </Link>
                    )}

                    {/* Divider */}
                    <div style={{
                      height: '1px',
                      backgroundColor: '#E5E7EB',
                      margin: '0.5rem 0'
                    }}></div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#DC2626',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#FEF2F2'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <X style={{ height: '18px', width: '18px' }} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                style={{
                  color: '#4B5563',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  padding: '0.5rem 1rem'
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  backgroundColor: '#8B4513',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(139, 69, 19, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#654321';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 6px rgba(139, 69, 19, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#8B4513';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(139, 69, 19, 0.2)';
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-btn">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#4B5563'
            }}
          >
            {isOpen ? <X style={{ height: '24px', width: '24px' }} /> : <Menu style={{ height: '24px', width: '24px' }} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{ 
          backgroundColor: '#F9FAFB',
          padding: '1rem',
          borderTop: '1px solid #E5E7EB'
        }} className="mobile-menu">
          {/* Mobile User Info */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              marginBottom: '1rem',
              border: '2px solid #E5E7EB'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: roleBadge.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: '0.25rem'
                }}>
                  {user.name || 'User'}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  backgroundColor: roleBadge.bgColor,
                  color: roleBadge.textColor,
                  padding: '0.25rem 0.625rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  <roleBadge.icon style={{ height: '12px', width: '12px' }} />
                  <span>{roleBadge.text}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                textDecoration: 'none',
                backgroundColor: isActive(link.path) ? '#F5DEB3' : 'white',
                color: isActive(link.path) ? '#8B4513' : '#4B5563',
                marginBottom: '0.5rem',
                border: '1px solid #E5E7EB'
              }}
            >
              <link.icon style={{ height: '20px', width: '20px' }} />
              <span>{link.name}</span>
            </Link>
          ))}

          {user ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  backgroundColor: roleBadge.bgColor,
                  color: 'white',
                  marginTop: '0.5rem',
                  marginBottom: '0.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <LayoutDashboard style={{ height: '20px', width: '20px' }} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  color: '#4B5563',
                  backgroundColor: 'white',
                  marginBottom: '0.5rem',
                  border: '1px solid #E5E7EB'
                }}
              >
                <User style={{ height: '20px', width: '20px' }} />
                <span>My Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#DC2626',
                  backgroundColor: 'white',
                  border: '1px solid #FCA5A5',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                <X style={{ height: '20px', width: '20px' }} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  color: '#4B5563',
                  backgroundColor: 'white',
                  marginTop: '0.5rem',
                  marginBottom: '0.5rem',
                  textAlign: 'center',
                  border: '1px solid #E5E7EB'
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  backgroundColor: '#8B4513',
                  color: 'white',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(139, 69, 19, 0.2)'
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-user {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;