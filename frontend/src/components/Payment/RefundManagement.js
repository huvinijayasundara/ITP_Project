import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './RefundManagement.css';
import { Link } from 'react-router-dom';

const PAYMENT_URL = "http://localhost:5000/payments";

function RefundManagement() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [action, setAction] = useState(""); // "approve" or "reject"
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(PAYMENT_URL);
      setPayments(res.data.payments);
      setFilteredPayments(res.data.payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError("Failed to load payments.");
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredPayments(payments);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = payments.filter((payment) =>
      Object.values(payment).some((val) =>
        val?.toString().toLowerCase().includes(lowerQuery)
      )
    );
    setFilteredPayments(filtered);
  };

  const handleReviewClick = (payment, actionType) => {
    setSelectedPayment(payment);
    setAction(actionType);
    setAdminNotes("");
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!adminNotes.trim()) {
      setError("Please provide admin notes.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await axios.post(`${PAYMENT_URL}/refund/review`, {
        paymentId: selectedPayment._id,
        action: action.charAt(0).toUpperCase() + action.slice(1), // "Approve" or "Reject"
        adminNotes,
      });
      
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)}d successfully!`);
      setShowReviewModal(false);
      fetchPayments(); // Refresh the list
    } catch (err) {
      console.error("Error processing refund review:", err);
      setError(`Failed to ${action}: ${err.response?.data?.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (paymentId) => {
    if (window.confirm("Are you sure you want to process this refund? This will create a refund transaction.")) {
      try {
        setLoading(true);
        const res = await axios.post(`${PAYMENT_URL}/refund/process`, {
          paymentId,
          refundAmount: payments.find(p => p._id === paymentId)?.amount || 0,
        });
        
        alert("Refund processed successfully!");
        fetchPayments();
      } catch (err) {
        console.error("Error processing refund:", err);
        alert(`Failed to process refund: ${err.response?.data?.message || "Please try again."}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const logoDataUrl = 'data:image/png;base64,iVErixaFTu7gk1t7hkcz8AeA7BG1'; // Replace with your logo

    doc.addImage(logoDataUrl, 'PNG', 10, 10, 40, 30);
    doc.setFontSize(18);
    doc.setTextColor('#222');
    doc.setFont('helvetica', 'bold');
    doc.text('CraftLink', 60, 20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#555');
    doc.text('123 Main Street, Colombo, Sri Lanka', 60, 27);
    doc.text('Phone: (123) 456-7890 | Email: info@craftlink.com', 60, 34);
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45);
    doc.setFontSize(16);
    doc.text("Refund Requests Report", 14, 56);

    const tableColumn = ["Payment ID", "Order ID", "User", "Amount", "Method", "Status", "Refund Status", "Requested At"];
    const tableRows = [];

    filteredPayments
      .filter(p => p.refund && p.refund.status !== "NotRequested")
      .forEach(payment => {
        const row = [
          payment._id,
          payment.orderId,
          payment.userId,
          `Rs. ${payment.amount}`,
          payment.method,
          payment.status,
          payment.refund.status,
          payment.refund.requestedAt ? new Date(payment.refund.requestedAt).toLocaleDateString() : "N/A"
        ];
        tableRows.push(row);
      });

    if (tableRows.length === 0) {
      alert("No refund requests to download.");
      return;
    }

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 65,
    });

    doc.save("refund_requests_report.pdf");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Requested": return "warning";
      case "Approved": return "info";
      case "Rejected": return "danger";
      case "Processed": return "success";
      default: return "secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Requested": return "Pending Review";
      case "Approved": return "Approved";
      case "Rejected": return "Rejected";
      case "Processed": return "Processed";
      default: return "No Request";
    }
  };

  return (
    <div className="refund-management-container">
      <div className="refund-header">
        <h2>Refund Management</h2>
        <div className="header-actions">
          <Link to="/display-transactions" className="btn back-btn">
            ← Back to Transactions
          </Link>
          <button onClick={handleDownloadPDF} className="btn download-btn" disabled={loading}>
            Download Report (PDF)
          </button>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search payments and refunds..."
          className="search-input"
        />
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="table-wrapper">
        <table className="refunds-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Payment Status</th>
              <th>Refund Status</th>
              <th>Requested Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments
              .filter(payment => payment.refund && payment.refund.status !== "NotRequested")
              .length > 0 ? (
              filteredPayments
                .filter(payment => payment.refund && payment.refund.status !== "NotRequested")
                .map((payment, i) => (
                  <tr key={i} className={`status-${getStatusColor(payment.refund.status)}`}>
                    <td>{payment._id}</td>
                    <td>{payment.orderId}</td>
                    <td>{payment.userId}</td>
                    <td>Rs. {payment.amount.toFixed(2)}</td>
                    <td>{payment.method}</td>
                    <td>
                      <span className={`status-badge payment-${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge refund-${getStatusColor(payment.refund.status)}`}>
                        {getStatusText(payment.refund.status)}
                      </span>
                    </td>
                    <td>
                      {payment.refund.requestedAt 
                        ? new Date(payment.refund.requestedAt).toLocaleDateString() 
                        : "N/A"}
                    </td>
                    <td>
                      {payment.refund.status === "Requested" && (
                        <>
                          <button
                            className="btn approve-btn"
                            onClick={() => handleReviewClick(payment, "approve")}
                            disabled={loading}
                          >
                            Approve
                          </button>
                          <button
                            className="btn reject-btn"
                            onClick={() => handleReviewClick(payment, "reject")}
                            disabled={loading}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {payment.refund.status === "Approved" && (
                        <button
                          className="btn process-btn"
                          onClick={() => handleProcessRefund(payment._id)}
                          disabled={loading}
                        >
                          Process Refund
                        </button>
                      )}
                      {["Rejected", "Processed"].includes(payment.refund.status) && (
                        <span className="status-text">
                          {payment.refund.adminNotes || "Action completed"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  No refund requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{action === "approve" ? "Approve Refund" : "Reject Refund"}</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowReviewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-details">
                <h4>Payment Details</h4>
                <p><strong>Payment ID:</strong> {selectedPayment._id}</p>
                <p><strong>Order ID:</strong> {selectedPayment.orderId}</p>
                <p><strong>Amount:</strong> Rs. {selectedPayment.amount.toFixed(2)}</p>
                <p><strong>Method:</strong> {selectedPayment.method}</p>
                <p><strong>Current Status:</strong> {selectedPayment.status}</p>
                {selectedPayment.refund.reason && (
                  <>
                    <h4>Refund Request Details</h4>
                    <p><strong>Reason:</strong> {selectedPayment.refund.reason}</p>
                    <p><strong>Requested:</strong> {new Date(selectedPayment.refund.requestedAt).toLocaleString()}</p>
                  </>
                )}
              </div>
              
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label htmlFor="adminNotes">Admin Notes (Required)</label>
                  <textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={`Enter notes for ${action === "approve" ? "approval" : "rejection"}...`}
                    required
                    rows="4"
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn cancel-btn"
                    onClick={() => setShowReviewModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`btn ${action}-btn`}
                    disabled={loading || !adminNotes.trim()}
                  >
                    {loading ? "Processing..." : action.charAt(0).toUpperCase() + action.slice(1)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RefundManagement;