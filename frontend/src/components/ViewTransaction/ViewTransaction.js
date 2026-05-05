import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../AddTransaction/AddTransaction'; 

function ViewTransaction() {
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/transactions/${id}`);
        setTransaction(res.data.transaction);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('Failed to load transaction.');
      }
    };

    fetchTransaction();
  }, [id]);

  const handleBack = () => {
    navigate('/');
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!transaction) return <div>Loading...</div>;

  return (
    <div className="add-transaction-wrapper">
      <div className="form-box">
        <h2 className="form-title">View Transaction</h2>

        <div className="input-group">
          <label>Transaction ID</label>
          <p>{transaction.transaction_ID}</p>
        </div>

        <div className="input-group">
          <label>Order ID</label>
          <p>{transaction.order_ID}</p>
        </div>

        <div className="input-group">
          <label>User Type</label>
          <p>{transaction.user_type}</p>
        </div>

        <div className="input-group">
          <label>Amount</label>
          <p>LKR. {transaction.amount}</p>
        </div>

        <div className="input-group">
          <label>Date</label>
          <p>{new Date(transaction.date).toLocaleDateString()}</p>
        </div>

        <div className="input-group">
          <label>Status</label>
          <p>{transaction.status}</p>
        </div>

        <div className="button-group">
          <button className="cancel-button" onClick={handleBack}>Back</button>
        </div>
      </div>
    </div>
  );
}

export default ViewTransaction;
