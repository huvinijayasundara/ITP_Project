import React, { useState } from "react";
import axios from "axios";
import "./RefundRequestForm.css";

const RefundRequestForm = ({ paymentId, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/payments/refund/request", {
        paymentId,
        reason,
      });
      setMessage("✅ Refund request submitted successfully!");
      setReason("");
      if (onSuccess) onSuccess();
    } catch (error) {
      setMessage(`❌ Failed to submit refund request: ${error.response?.data?.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="refund-request-form">
      <h3>Request a Refund</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reason">Reason for Refund</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for refund"
            required
          />
        </div>
        <button type="submit" className="btn-proceed" disabled={loading}>
          {loading ? "Submitting..." : "Submit Refund Request"}
        </button>
      </form>
      {message && (
        <p className={`message ${message.includes("failed") ? "error" : "success"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default RefundRequestForm;