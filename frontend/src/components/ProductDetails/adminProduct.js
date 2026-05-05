import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const URL = "http://localhost:5000/products";

function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const componentRef = useRef();

  useEffect(() => {
    axios
      .get(URL)
      .then((res) => setProducts(res.data.products || res.data))
      .catch(() => setError("Failed to fetch products"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios.delete(`${URL}/${id}`).then(() => {
        alert("Product deleted successfully!");
        setProducts(products.filter((p) => p._id !== id));
      });
    }
  };

  const handleUpdate = (id) => navigate(`/Updateproduct/${id}`);
  const handleAdd = () => navigate("/addproduct");

  const downloadPDF = async () => {
    const input = componentRef.current;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("Product_Report.pdf");
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>No products available</p>
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    p.Category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '30px',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Product Management
        </h1>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={handleAdd}
            style={{
              padding: '12px 28px',
              background:"linear-gradient(45deg, #8B4513, #B8764F)",
              color: '#8B4513',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            + Add Product
          </button>
          
          <input
            type="text"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1',
              maxWidth: '400px',
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          />
        </div>

        <div ref={componentRef}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '30px'
          }}>
            {filteredProducts.map((p) => (
              <div 
                key={p._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }}
              >
                {p.imageUrl && (
                  <div style={{ height: '200px', backgroundColor: '#f5f5f5' }}>
                    <img
                      src={`http://localhost:5000/uploads/${p.imageUrl}`}
                      alt={p.product_name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  </div>
                )}
                
                <div style={{ 
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{
                      backgroundColor: '#F5DEB3',
                      color: '#8B4513',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {p.Category}
                    </span>
                  </div>

                  <h5 style={{ 
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    {p.product_name}
                  </h5>
                  
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#666',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {p.Description}
                  </p>
                  
                  <p style={{ 
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    <strong>Quantity:</strong> {p.Quantity}
                  </p>
                  
                  <p style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#8B4513',
                    marginBottom: '16px'
                  }}>
                    Rs. {p.Price}
                  </p>
                  
                  <div style={{ 
                    marginTop: 'auto',
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <button
                      onClick={() => handleUpdate(p._id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#8B4513',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{ 
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <p style={{ 
                fontSize: '1.2rem',
                color: '#999'
              }}>
                No matching products found
              </p>
            </div>
          )}
        </div>

        <button 
          onClick={downloadPDF}
          style={{
            padding: '12px 28px',
            backgroundColor: 'white',
            color: '#28a745',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          📥 Download PDF Report
        </button>
      </div>
    </div>
  );
}

export default Product;