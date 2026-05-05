import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./MyPayments.css";

const MyPayments = () => {
  const { userId } = useParams(); // Get userId from URL
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdowns, setCountdowns] = useState({}); // New: countdowns by paymentId

  const isWithinRefundPeriod = (paymentDate) => {
    const refundWindow = 7; // days
    const payment = new Date(paymentDate);
    const now = new Date();
    const diffInMs = now - payment;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays <= refundWindow;
  };

  const fetchUserPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`http://localhost:5000/payments/user/${userId}`);
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
      setError("Could not fetch payment history.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserPayments();
  }, [fetchUserPayments]);

  // Update countdowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newCountdowns = {};

      payments.forEach((p) => {
        const refundWindowMs = 7 * 24 * 60 * 60 * 1000;
        const expiry = new Date(p.createdAt).getTime() + refundWindowMs;
        const diffMs = expiry - now;

        if (diffMs > 0) {
          const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
          const seconds = Math.floor((diffMs / 1000) % 60);
          newCountdowns[p._id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
          newCountdowns[p._id] = null;
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [payments]);

  const handleRefundRequest = async (paymentId) => {
    const reason = window.prompt("Please provide a reason for your refund request (minimum 10 characters):");
    if (!reason || reason.trim().length < 10) {
      alert("Please provide a valid reason (at least 10 characters).");
      return;
    }

    try {
      // Optimistically update UI
      setPayments((prev) =>
        prev.map((p) =>
          p._id === paymentId ? { ...p, status: "RefundRequested" } : p
        )
      );

      await axios.post("http://localhost:5000/payments/refund/request", {
        paymentId,
        reason,
      });

      alert("Refund request submitted successfully!");
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || "Failed to submit refund request."}`);
      // Rollback UI if request fails
      setPayments((prev) =>
        prev.map((p) =>
          p._id === paymentId ? { ...p, status: "Completed" } : p
        )
      );
    }
  };

  if (loading) return <p>Loading your payments...</p>;

  return (
    <div className="my-payments-container">
      <h2>Payment History</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="table-wrapper">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((p) => {
                const isRefundable = p.status === "Completed" && isWithinRefundPeriod(p.createdAt);
                const isExpired = p.status === "Completed" && !isWithinRefundPeriod(p.createdAt);
                const countdown = countdowns[p._id];

                return (
                  <tr key={p._id}>
                    <td>{p.orderId}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      {p.amount.toLocaleString("en-LK", {
                        style: "currency",
                        currency: "LKR",
                      })}
                    </td>
                    <td>{p.method}</td>
                    <td>
                      <span
                        className={`status-badge ${p.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      {p.status === "RefundRequested" ? (
                        <span className="refund-status">Refund Requested</span>
                      ) : p.status === "RefundRejected" ? (
                        <span className="refund-status">Refund Rejected</span>
                      ) : p.status === "RefundApproved" ? (
                        <span className="refund-status">Refund Approved</span>
                      ) : p.status === "Refunded" ? (
                        <span className="refund-status">Refunded</span>
                      ) : isRefundable ? (
                        <div className="refund-action-wrapper">
                          <button
                            onClick={() => handleRefundRequest(p._id)}
                            className="refund-btn"
                          >
                            Request Refund
                          </button>
                          {countdown && (
                            <p className="countdown-text">
                              Refund window: {countdown}
                            </p>
                          )}
                        </div>
                      ) : isExpired ? (
                        <div className="refund-action-wrapper">
                          <button
                            className="refund-btn disabled"
                            disabled
                            title="Refund period (7 days) expired"
                          >
                            Request Refund
                          </button>
                          <p className="countdown-text expired">
                            Refund period expired
                          </p>
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6">No payments found for this user.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyPayments;
