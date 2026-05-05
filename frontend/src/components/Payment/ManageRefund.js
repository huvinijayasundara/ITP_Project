import React, { useEffect, useState } from "react";
import "./ManageRefund.css";

const ManageRefund = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all payments with refund requests
 const fetchRefundRequests = async () => {
  try {
    setLoading(true);
    setError(null);
    console.log("Fetching refund requests from: http://localhost:5000/payments/refunds/all");

    const res = await fetch("http://localhost:5000/payments/refunds/all", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // If your server uses cookies/sessions, uncomment next line:
      // credentials: 'include',
    });

    console.log("Response status:", res.status, res.statusText);
    // log response headers (helpful)
    for (const [k, v] of res.headers.entries()) {
      console.log("Header:", k, v);
    }

    // If not ok, try to read text and JSON safely to print backend error
    if (!res.ok) {
      let bodyText;
      try {
        bodyText = await res.text();
        console.error("Server error body:", bodyText);
      } catch (e) {
        console.error("Failed to read error body:", e);
      }
      throw new Error(`Failed to fetch refund requests (Status: ${res.status} ${res.statusText})`);
    }

    // Try parse JSON safely
    let data;
    try {
      data = await res.json();
    } catch (e) {
      const txt = await res.text();
      console.warn("Response not valid JSON, body:", txt);
      throw new Error("Invalid JSON received from server");
    }

    console.log("Received data:", data);
    if (data.refundRequests) {
      setRefunds(data.refundRequests);
    } else if (Array.isArray(data)) {
      setRefunds(data);
    } else {
      console.warn("Unexpected data structure:", data);
      setRefunds([]);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    setError(err.message || "Unknown error fetching refunds");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  // Update refund status (Approved/Rejected)
  const handleUpdateStatus = async (paymentId, action) => {
    const adminNotes = window.prompt(
      `Please provide notes for ${action.toLowerCase()}ing this refund (minimum 5 characters):`
    );
    if (!adminNotes || adminNotes.trim().length < 5) {
      alert("Please provide valid notes (at least 5 characters).");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${action.toLowerCase()} this refund?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch("http://localhost:5000/payments/refund/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          action,
          adminNotes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update refund status");
      }

      const result = await res.json();
      alert(result.message || "Refund status updated successfully.");
      fetchRefundRequests(); // Refresh list after update
    } catch (err) {
      alert(err.message);
    }
  };

  // Format dates nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "—" : date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="manage-refund-container">
        <h2>Manage Refunds</h2>
        <p>Loading refund requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-refund-container">
        <h2>Manage Refunds</h2>
        <div className="error-msg">
          <p><strong>Error:</strong> {error}</p>
          <p>Please check:</p>
          <ul>
            <li>Backend server is running on port 5000</li>
            <li>The route /payments/refunds/all exists</li>
            <li>CORS is properly configured</li>
          </ul>
          <button onClick={fetchRefundRequests}>Retry</button>
        </div>
      </div>
    );
  }

  const refundRequests = refunds.filter(payment =>
    payment?.refund?.status && 
    ["Requested", "Approved", "Rejected"].includes(payment.refund.status)
  );

  return (
    <div className="manage-refund-container">
      <h2>Manage Refunds</h2>

      {refundRequests.length === 0 ? (
        <div>
          <p>No refund requests available.</p>
          <button onClick={fetchRefundRequests}>Refresh</button>
        </div>
      ) : (
        <table className="refund-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>User</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Requested At</th>
              <th>Responded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {refundRequests.map((payment) => (
              <tr key={payment._id}>
                <td>{payment._id}</td>
                <td>
                  {payment.userId?.name || "N/A"} ({payment.userId?.email || "N/A"})
                </td>
                <td>{payment.refund?.reason || "—"}</td>
                <td>
                  <span
                    className={`status-badge ${payment.refund?.status?.toLowerCase() || ""}`}
                  >
                    {payment.refund?.status === "Requested"
                      ? "Pending"
                      : payment.refund?.status || "—"}
                  </span>
                </td>
                <td>{formatDate(payment.refund?.requestedAt)}</td>
                <td>{formatDate(payment.refund?.respondedAt)}</td>
                <td className="action-buttons">
                  {payment.refund?.status === "Requested" ? (
                    <>
                      <button
                        className="approve-btn"
                        onClick={() => handleUpdateStatus(payment._id, "Approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleUpdateStatus(payment._id, "Reject")}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <em>No actions</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageRefund;