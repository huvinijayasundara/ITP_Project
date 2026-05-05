import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const URL = "http://localhost:5000/products";

function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    product_name: "",
    Description: "",
    Category: "",
    Quantity: "",
    Price: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${URL}/${id}`)
      .then((res) => {
        const product = res.data.products;
        setInputs({
          product_name: product.product_name,
          Description: product.Description,
          Category: product.Category,
          Quantity: product.Quantity,
          Price: product.Price,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load product data");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (inputs.Quantity <= 0 || inputs.Price <= 0) {
      setError("Quantity and Price must be greater than 0");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("product_name", inputs.product_name);
    formData.append("Description", inputs.Description);
    formData.append("Category", inputs.Category);
    formData.append("Quantity", inputs.Quantity);
    formData.append("Price", inputs.Price);
    if (image) formData.append("image", image);

    axios
      .put(`${URL}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        alert("Product updated successfully!");
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
        setError("Error updating product. Please try again.");
      });
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

  if (error && !inputs.product_name) {
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#8B4513',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          Update Product
        </h2>

        {error && (
          <div style={{ 
            padding: '12px 16px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c33',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Product Name
            </label>
            <input
              type="text"
              name="product_name"
              value={inputs.product_name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E8D4C0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8764F'}
              onBlur={(e) => e.target.style.borderColor = '#E8D4C0'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Description
            </label>
            <textarea
              name="Description"
              value={inputs.Description}
              onChange={handleChange}
              required
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E8D4C0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8764F'}
              onBlur={(e) => e.target.style.borderColor = '#E8D4C0'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Category
            </label>
            <input
              type="text"
              name="Category"
              value={inputs.Category}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E8D4C0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8764F'}
              onBlur={(e) => e.target.style.borderColor = '#E8D4C0'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                Quantity
              </label>
              <input
                type="number"
                name="Quantity"
                value={inputs.Quantity}
                onChange={handleChange}
                required
                min="1"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E8D4C0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#B8764F'}
                onBlur={(e) => e.target.style.borderColor = '#E8D4C0'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                Price (Rs)
              </label>
              <input
                type="number"
                name="Price"
                value={inputs.Price}
                onChange={handleChange}
                required
                min="1"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E8D4C0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#B8764F'}
                onBlur={(e) => e.target.style.borderColor = '#E8D4C0'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Update Product Image (Optional)
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E8D4C0',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            />
            <p style={{
              fontSize: '0.85rem',
              color: '#666',
              marginTop: '8px'
            }}>
              Leave empty to keep the current image
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="submit"
              style={{
                flex: 1,
                padding: '14px 32px',
                backgroundColor: '#8B4513',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              Update Product
            </button>

            <button 
              type="button"
              onClick={() => navigate('/')}
              style={{
                padding: '14px 32px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProduct;