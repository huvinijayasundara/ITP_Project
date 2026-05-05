import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddTransaction() {
  const navigate = useNavigate();

  const generateTransactionID = () => {
    const randomNum = Math.floor(100000 * Math.random());
    return `TD${String(randomNum).padStart(6, '0')}`;
  };

  const [inputs, setInputs] = useState({
    transaction_ID: '',
    order_ID: '',
    user_type: 'Customer',
    amount: '',
    date: '',
    status: 'Pending',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setInputs((prev) => ({
      ...prev,
      transaction_ID: generateTransactionID(),
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const validateInputs = () => {
    const { transaction_ID, order_ID, amount, date } = inputs;
    const today = new Date().toISOString().split('T')[0];

    const transactionIdRegex = /^TD\d{1,6}$/;
    const orderIdRegex = /^OD\d{1,6}$/;

    if (!transactionIdRegex.test(transaction_ID)) {
      return 'Transaction ID must start with "TD" followed by up to 6 digits.';
    }

    if (!orderIdRegex.test(order_ID)) {
      return 'Order ID must start with "OD" followed by up to 6 digits.';
    }

    if (!amount || Number(amount) <= 0) {
      return 'Amount must be a positive number.';
    }

    if (!date) {
      return 'Date is required.';
    }

    if (date > today) {
      return 'Date cannot be in the future.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      setMessage('');
      return;
    }

    try {
      await axios.post('http://localhost:5000/transactions', {
        ...inputs,
        amount: Number(inputs.amount),
      });

      setMessage('Transaction added successfully.');
      setError('');

      setInputs({
        transaction_ID: generateTransactionID(),
        order_ID: '',
        user_type: 'Customer',
        amount: '',
        date: '',
        status: 'Pending',
      });
    } catch (err) {
      console.error(err);
      setMessage('');
      setError('Failed to add transaction. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F5F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '2.5rem',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '48px', color: '#8B4513', marginBottom: '1rem' }}>💳</div>
          <h2 style={{ 
            color: '#8B4513',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            fontSize: '1.875rem'
          }}>
            Add New Transaction
          </h2>
          <p style={{ color: '#666', fontSize: '1rem' }}>
            Create a new transaction record
          </p>
        </div>

        {message && (
          <div style={{
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #A5D6A7'
          }}>
            {message}
          </div>
        )}
        
        {error && (
          <div style={{
            backgroundColor: '#FFEBEE',
            color: '#C62828',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #EF9A9A'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              Transaction ID
            </label>
            <input
              type="text"
              name="transaction_ID"
              value={inputs.transaction_ID}
              disabled
              readOnly
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid #E8D4C0',
                backgroundColor: '#F5F5F5',
                color: '#666',
                fontSize: '1rem',
                cursor: 'not-allowed'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              Order ID
            </label>
            <input
              type="text"
              name="order_ID"
              value={inputs.order_ID}
              onChange={handleChange}
              required
              placeholder="e.g. OD123456"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid #E8D4C0',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8764F'}
              onBlur={(e) => e.target.style.borderColor = '#E8D4C0'}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              User Type
            </label>
            <select
              name="user_type"
              value={inputs.user_type}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid #E8D4C0',
                fontSize: '1rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8764F'}
              onBlur={(e) => e.target.style.borderColor = '#E8D4C0'}
            >
              <option value="Artisan">Artisan</option>
              <option value="Customer">Customer</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              Amount
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8B4513',
                fontWeight: '600',
                fontSize: '1rem'
              }}>
                LKR
              </span>
              <input
                type="number"
                name="amount"
                value={inputs.amount}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 4rem',
                  borderRadius: '8px',
                  border: '2px solid #E8D4C0',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#B8764F'}
                onBlur={(e) => e.target.style.borderColor = '#E8D4C0'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              Date
            </label>
            <input
              type="date"
              name="date"
              value={inputs.date}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid #E8D4C0',
                fontSize: '1rem',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8764F'}
              onBlur={(e) => e.target.style.borderColor = '#E8D4C0'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              Status
            </label>
            <select
              name="status"
              value={inputs.status}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid #E8D4C0',
                fontSize: '1rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8764F'}
              onBlur={(e) => e.target.style.borderColor = '#E8D4C0'}
            >
              <option value="Pending">Pending</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Refund">Refund</option>
            </select>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            <button 
              type="submit"
              style={{
                padding: '0.875rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#B8764F',
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#8B4513'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#B8764F'}
            >
              Submit
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              style={{
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #8B4513',
                backgroundColor: 'white',
                color: '#8B4513',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#8B4513';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#8B4513';
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

export default AddTransaction;