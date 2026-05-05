import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

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
            ✨ About CraftLink
          </h1>
          <p style={{
            fontSize: '1.5rem',
            opacity: '0.95',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            Connecting Artisans with the World
          </p>
        </div>

        {/* Main Content Card */}
        <div style={{
          background: 'white',
          borderRadius: '25px',
          padding: '50px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
          marginBottom: '40px'
        }}>
          
          {/* Our Story Section */}
          <div style={{ marginBottom: '50px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '3rem',
                marginRight: '15px'
              }}>🎨</div>
              <h2 style={{
                color: '#8B4513',
                fontSize: '2.5rem',
                margin: '0'
              }}>
                Our Story
              </h2>
            </div>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.8',
              color: '#555',
              marginBottom: '20px'
            }}>
              CraftLink was born from a passion for preserving traditional craftsmanship and empowering local artisans. 
              We believe that every handcrafted item tells a unique story – a story of skill, dedication, and cultural heritage.
            </p>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.8',
              color: '#555'
            }}>
              Our platform serves as a bridge between talented craftspeople and customers who appreciate authentic, 
              handmade products. We're not just a marketplace; we're a community that celebrates creativity and supports 
              sustainable livelihoods.
            </p>
          </div>

          {/* What We Do Section */}
          <div style={{ marginBottom: '50px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '3rem',
                marginRight: '15px'
              }}>🛍️</div>
              <h2 style={{
                color: '#8B4513',
                fontSize: '2.5rem',
                margin: '0'
              }}>
                What We Do
              </h2>
            </div>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.8',
              color: '#555',
              marginBottom: '30px'
            }}>
              We specialize in buying and selling authentic handcrafted items from skilled artisans across Sri Lanka. 
              Our carefully curated collection includes:
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {[
                { icon: '🏺', title: 'Pottery & Ceramics', desc: 'Traditional and modern designs' },
                { icon: '🧵', title: 'Textiles & Fabrics', desc: 'Handwoven and embroidered' },
                { icon: '💎', title: 'Jewelry & Accessories', desc: 'Unique handcrafted pieces' },
                { icon: '🪵', title: 'Wood Crafts', desc: 'Carved and sculpted items' },
                { icon: '🎨', title: 'Art & Paintings', desc: 'Original artwork' },
                { icon: '🏠', title: 'Home Decor', desc: 'Beautiful decorative items' }
              ].map((item, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(135deg, #F5DEB3, #E8D4C0)',
                  padding: '25px',
                  borderRadius: '15px',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{item.icon}</div>
                  <h3 style={{ color: '#8B4513', marginBottom: '8px', fontSize: '1.2rem' }}>{item.title}</h3>
                  <p style={{ color: '#666', margin: '0', fontSize: '0.95rem' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Our Values Section */}
          <div style={{ marginBottom: '50px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '3rem',
                marginRight: '15px'
              }}>⭐</div>
              <h2 style={{
                color: '#8B4513',
                fontSize: '2.5rem',
                margin: '0'
              }}>
                Our Values
              </h2>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '25px'
            }}>
              {[
                {
                  icon: '🤝',
                  title: 'Fair Trade',
                  description: 'We ensure artisans receive fair compensation for their exceptional work'
                },
                {
                  icon: '🌱',
                  title: 'Sustainability',
                  description: 'Promoting eco-friendly practices and sustainable materials'
                },
                {
                  icon: '✨',
                  title: 'Quality',
                  description: 'Every item is carefully selected for its craftsmanship and authenticity'
                },
                {
                  icon: '❤️',
                  title: 'Customer Care',
                  description: 'Providing excellent service and ensuring customer satisfaction'
                }
              ].map((value, index) => (
                <div key={index} style={{
                  background: 'white',
                  border: '3px solid #E8D4C0',
                  padding: '30px',
                  borderRadius: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{value.icon}</div>
                  <h3 style={{ 
                    color: '#8B4513', 
                    marginBottom: '12px',
                    fontSize: '1.4rem',
                    fontWeight: 'bold'
                  }}>
                    {value.title}
                  </h3>
                  <p style={{ 
                    color: '#666', 
                    margin: '0',
                    fontSize: '1rem',
                    lineHeight: '1.6'
                  }}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Service Section */}
          <div style={{
            background: 'linear-gradient(135deg, #8B4513, #B8764F)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            color: 'white',
            marginBottom: '30px'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🌟</div>
            <h2 style={{ 
              fontSize: '2.2rem', 
              marginBottom: '15px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}>
              Exceptional Customer Service
            </h2>
            <p style={{ 
              fontSize: '1.2rem', 
              lineHeight: '1.8',
              maxWidth: '800px',
              margin: '0 auto',
              opacity: '0.95'
            }}>
              Our dedicated customer service team is here to assist you every step of the way. 
              From product inquiries to order tracking, we're committed to providing you with 
              a seamless and enjoyable shopping experience. Your satisfaction is our priority!
            </p>
          </div>

          {/* CTA Section */}
          <div style={{
            textAlign: 'center',
            marginTop: '40px'
          }}>
            <h3 style={{ 
              color: '#8B4513', 
              fontSize: '1.8rem',
              marginBottom: '25px'
            }}>
              Ready to Explore Our Collection?
            </h3>
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => navigate('/products')}
                style={{
                  padding: '18px 40px',
                  background: 'linear-gradient(45deg, #8B4513, #B8764F)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(139, 69, 19, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(139, 69, 19, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(139, 69, 19, 0.3)';
                }}
              >
                🛍️ Shop Now
              </button>
              
              <button
                onClick={() => navigate('/contact')}
                style={{
                  padding: '18px 40px',
                  background: 'white',
                  color: '#8B4513',
                  border: '3px solid #8B4513',
                  borderRadius: '12px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.background = '#8B4513';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'white';
                  e.target.style.color = '#8B4513';
                }}
              >
                📧 Contact Us
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;