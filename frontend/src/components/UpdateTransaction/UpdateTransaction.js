import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../AddTransaction/AddTransaction.css'; // ✅ make sure path is correct

function UpdateTransaction() {
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
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch transaction by ID
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/transactions/${id}`);
        const data = res.data.transaction;

        setInputs({
          transaction_ID: data.transaction_ID,
          order_ID: data.order_ID,
          user_type: data.user_type,
          amount: data.amount.toFixed(2),
          date: data.date,
          status: data.status,
        });
      } catch (err) {
        console.error('Failed to fetch transaction:', err);
        setError('Failed to fetch transaction.');
      }
    };

    fetchTransaction();
  }, [id]);

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
      await axios.put(`http://localhost:5000/transactions/${id}`, {
        ...inputs,
        amount: Number(inputs.amount),
      });

      setMessage('Transaction updated successfully!');
      setError('');
    } catch (err) {
      console.error('Error updating transaction:', err);
      setMessage('');
      setError('Failed to update transaction.');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="add-transaction-wrapper">
      <div className="form-box">
        <h2 className="form-title">Update Transaction</h2>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="transaction_ID">Transaction ID</label>
            <input
              type="text"
              name="transaction_ID"
              value={inputs.transaction_ID}
              disabled
              readOnly
            />
          </div>

          <div className="input-group">
            <label htmlFor="order_ID">Order ID</label>
            <input
              type="text"
              name="order_ID"
              value={inputs.order_ID}
              onChange={handleChange}
              required
              placeholder="e.g. OD123456"
            />
          </div>

          <div className="input-group">
            <label htmlFor="user_type">User Type</label>
            <select
              name="user_type"
              value={inputs.user_type}
              onChange={handleChange}
              required
            >
              <option value="Artisan">Artisan</option>
              <option value="Customer">Customer</option>
            </select>
          </div>

          <div className="input-group amount-field">
            <label htmlFor="amount">Amount</label>
            <div className="currency-input">
              <span className="currency-prefix">LKR</span>
              <input
                type="number"
                name="amount"
                value={inputs.amount}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              name="date"
              value={inputs.date ? inputs.date.slice(0, 10) : ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="status">Status</label>
            <select
              name="status"
              value={inputs.status}
              onChange={handleChange}
              required
            >
              <option value="Pending">Pending</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Refund">Refund</option>
            </select>
          </div>

          <div className="button-group">
            <button type="submit">Update</button>
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateTransaction;

