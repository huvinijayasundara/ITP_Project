import React from 'react';

const Contact = () => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 50%, #B8764F 100%)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '4rem',
            margin: '0 0 20px 0',
            textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
            fontWeight: 'bold'
          }}>
            📧 Contact Us
          </h1>
          <p style={{
            fontSize: '1.5rem',
            opacity: '0.95',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            We'd Love to Hear From You!
          </p>
        </div>

        {/* Contact Information Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '50px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
          marginBottom: '40px',
          maxWidth: '800px',
          margin: '0 auto 40px auto'
        }}>
            <h2 style={{
              color: '#8B4513',
              fontSize: '2rem',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              📍 Get In Touch
            </h2>

            {/* Email */}
            <div style={{
              marginBottom: '30px',
              padding: '20px',
              background: 'linear-gradient(135deg, #F5DEB3, #E8D4C0)',
              borderRadius: '15px',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  marginRight: '15px' 
                }}>📧</div>
                <div>
                  <h3 style={{ 
                    color: '#8B4513', 
                    margin: '0 0 5px 0',
                    fontSize: '1.3rem'
                  }}>
                    Email Us
                  </h3>
                  <a 
                    href="mailto:info@craftlink.com"
                    style={{
                      color: '#555',
                      fontSize: '1.1rem',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}
                  >
                    info@craftlink.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Numbers */}
            <div style={{
              marginBottom: '30px',
              padding: '20px',
              background: 'linear-gradient(135deg, #F5DEB3, #E8D4C0)',
              borderRadius: '15px',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '10px'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  marginRight: '15px' 
                }}>📞</div>
                <div>
                  <h3 style={{ 
                    color: '#8B4513', 
                    margin: '0 0 10px 0',
                    fontSize: '1.3rem'
                  }}>
                    Call Us
                  </h3>
                  <div style={{ marginBottom: '8px' }}>
                    <a 
                      href="tel:+94112345678"
                      style={{
                        color: '#555',
                        fontSize: '1.1rem',
                        textDecoration: 'none',
                        fontWeight: '500',
                        display: 'block'
                      }}
                    >
                      +94 11 234 5678
                    </a>
                  </div>
                  <div>
                    <a 
                      href="tel:+94718942287"
                      style={{
                        color: '#555',
                        fontSize: '1.1rem',
                        textDecoration: 'none',
                        fontWeight: '500',
                        display: 'block'
                      }}
                    >
                      +94 71 894 2287
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #F5DEB3, #E8D4C0)',
              borderRadius: '15px',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  marginRight: '15px' 
                }}>📍</div>
                <div>
                  <h3 style={{ 
                    color: '#8B4513', 
                    margin: '0 0 10px 0',
                    fontSize: '1.3rem'
                  }}>
                    Visit Us
                  </h3>
                  <p style={{
                    color: '#555',
                    fontSize: '1.1rem',
                    margin: '0',
                    lineHeight: '1.6',
                    fontWeight: '500'
                  }}>
                    123 Artisan Street,<br />
                    Colombo,<br />
                    Sri Lanka
                  </p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: 'linear-gradient(135deg, #8B4513, #B8764F)',
              borderRadius: '15px',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                margin: '0 0 15px 0',
                fontSize: '1.3rem'
              }}>
                ⏰ Business Hours
              </h3>
              <p style={{ 
                margin: '5px 0',
                fontSize: '1rem',
                opacity: '0.95'
              }}>
                Monday - Friday: 9:00 AM - 6:00 PM
              </p>
              <p style={{ 
                margin: '5px 0',
                fontSize: '1rem',
                opacity: '0.95'
              }}>
                Saturday: 10:00 AM - 4:00 PM
              </p>
              <p style={{ 
                margin: '5px 0',
                fontSize: '1rem',
                opacity: '0.95'
              }}>
                Sunday: Closed
              </p>
            </div>

            {/* Need More Help Section */}
            <div style={{
              marginTop: '40px',
              padding: '30px',
              background: 'linear-gradient(135deg, #F5DEB3, #E8D4C0)',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <h3 style={{
                color: '#8B4513',
                fontSize: '1.5rem',
                marginBottom: '15px'
              }}>
                💬 Need More Help?
              </h3>
              <p style={{
                color: '#555',
                fontSize: '1.1rem',
                marginBottom: '20px',
                lineHeight: '1.6'
              }}>
                For feedback or to file a complaint, please visit our dedicated pages
              </p>
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => window.location.href = '/feedback'}
                  style={{
                    padding: '12px 30px',
                    background: 'linear-gradient(45deg, #8B4513, #B8764F)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(139, 69, 19, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(139, 69, 19, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(139, 69, 19, 0.3)';
                  }}
                >
                  💭 Submit Feedback
                </button>
                <button
                  onClick={() => window.location.href = '/complaints'}
                  style={{
                    padding: '12px 30px',
                    background: 'white',
                    color: '#8B4513',
                    border: '3px solid #8B4513',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#8B4513';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#8B4513';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  📋 File a Complaint
                </button>
              </div>
            </div>
          </div>

        {/* Social Media & Quick Links */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <h3 style={{
            color: '#8B4513',
            fontSize: '1.8rem',
            marginBottom: '25px'
          }}>
            🌐 Connect With Us
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '25px',
            flexWrap: 'wrap'
          }}>
            {[
              { icon: '📘', name: 'Facebook', color: '#4267B2' },
              { icon: '📷', name: 'Instagram', color: '#E1306C' },
              { icon: '🐦', name: 'Twitter', color: '#1DA1F2' },
              { icon: '💼', name: 'LinkedIn', color: '#0077B5' }
            ].map((social, index) => (
              <div
                key={index}
                style={{
                  width: '120px',
                  padding: '20px',
                  background: social.color,
                  color: 'white',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{social.icon}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{social.name}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;