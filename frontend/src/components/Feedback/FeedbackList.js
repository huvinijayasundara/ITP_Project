import React, { useState } from "react";
import { updateFeedback, deleteFeedback, addHelpfulVote, removeHelpfulVote, reportFeedback } from "../../api/feedbackApi";

const FeedbackList = ({ feedbacks, onUpdate, userRole = "customer", isLoggedIn = false }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [votingLoading, setVotingLoading] = useState({});

  // ✅ FIX: Get current user info from localStorage with multiple fallbacks
  const currentUserEmail = (
    localStorage.getItem('gmail') || 
    localStorage.getItem('email') || 
    ''
  ).toLowerCase().trim();
  
  const currentUserId = (
    localStorage.getItem('userId') || 
    localStorage.getItem('id') || 
    localStorage.getItem('user_id') ||
    ''
  ).trim();

  // ✅ DEBUG: Log user info on component mount
  React.useEffect(() => {
    console.log("=== FeedbackList Debug Info ===");
    console.log("👤 Current user email:", currentUserEmail);
    console.log("🆔 Current user ID:", currentUserId);
    console.log("🔒 Is logged in:", isLoggedIn);
    console.log("👥 User role:", userRole);
    console.log("📊 Total feedbacks:", feedbacks.length);
    console.log("===============================");
  }, [currentUserEmail, currentUserId, isLoggedIn, userRole, feedbacks.length]);

  const categories = [
    { value: "product", label: "Product" },
    { value: "service", label: "Service" },
    { value: "delivery", label: "Delivery" },
    { value: "website", label: "Website" },
    { value: "general", label: "General" }
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? "#B8764F" : "#ccc", fontSize: "18px" }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const getBorderColor = (rating) => {
    if (rating >= 4) return "3px solid #28a745";
    if (rating === 3) return "3px solid #B8764F";
    return "3px solid #dc3545";
  };

  // ✅ IMPROVED: Check if current user owns this feedback
  const isOwnFeedback = (feedback) => {
    if (!feedback) {
      console.log("⚠️ No feedback provided to isOwnFeedback");
      return false;
    }
    
    // Admin can edit/delete any feedback
    if (userRole === "admin") {
      return true;
    }

    console.log("🔍 Checking ownership for feedback:", feedback._id);
    console.log("📋 Feedback data:", {
      feedbackId: feedback._id,
      feedbackEmail: feedback.email,
      feedbackUserId: feedback.userId,
      feedbackCreatedBy: feedback.createdBy
    });
    console.log("👤 Current user data:", {
      currentEmail: currentUserEmail,
      currentUserId: currentUserId
    });
    
    // Method 1: Check by email (most reliable for users)
    if (currentUserEmail && feedback.email) {
      const feedbackEmail = feedback.email.toLowerCase().trim();
      const emailMatch = feedbackEmail === currentUserEmail;
      console.log(`📧 Email check: ${feedbackEmail} === ${currentUserEmail} ? ${emailMatch}`);
      
      if (emailMatch) {
        console.log("✅ User owns feedback (by email):", feedback._id);
        return true;
      }
    }
    
    // Method 2: Check by user ID
    if (currentUserId && feedback.userId) {
      const userIdMatch = feedback.userId.toString() === currentUserId.toString();
      console.log(`🆔 User ID check: ${feedback.userId} === ${currentUserId} ? ${userIdMatch}`);
      
      if (userIdMatch) {
        console.log("✅ User owns feedback (by userId):", feedback._id);
        return true;
      }
    }
    
    // Method 3: Check by createdBy field
    if (currentUserId && feedback.createdBy) {
      const createdByMatch = feedback.createdBy.toString() === currentUserId.toString();
      console.log(`👤 CreatedBy check: ${feedback.createdBy} === ${currentUserId} ? ${createdByMatch}`);
      
      if (createdByMatch) {
        console.log("✅ User owns feedback (by createdBy):", feedback._id);
        return true;
      }
    }
    
    console.log("❌ User does NOT own this feedback");
    return false;
  };

  const startEdit = (feedback) => {
    if (!isLoggedIn) {
      alert("⚠️ Please login to edit feedback");
      return;
    }

    // ✅ Check ownership before allowing edit
    if (!isOwnFeedback(feedback)) {
      alert("❌ You can only edit your own feedback");
      console.log("🚫 Edit denied - ownership check failed");
      return;
    }

    console.log("✅ Edit allowed - opening form");
    setEditingId(feedback._id);
    setEditForm({
      customerName: feedback.customerName,
      email: feedback.email,
      message: feedback.message,
      category: feedback.category,
      rating: feedback.rating,
      phoneNumber: feedback.phoneNumber || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? Number(value) : value;
    setEditForm(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const saveEdit = async (feedbackId) => {
    if (!isLoggedIn) {
      alert("⚠️ Please login to edit feedback");
      return;
    }

    const feedback = feedbacks.find(f => f._id === feedbackId);
    
    // ✅ Double-check ownership before saving
    if (!isOwnFeedback(feedback)) {
      alert("❌ You can only edit your own feedback");
      console.log("🚫 Save denied - ownership check failed");
      return;
    }

    // Validate form
    if (!editForm.customerName?.trim() || !editForm.email?.trim() || !editForm.message?.trim()) {
      alert("⚠️ Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      console.log("💾 Saving feedback update:", feedbackId);
      await updateFeedback(feedbackId, editForm);
      setEditingId(null);
      setEditForm({});
      onUpdate();
      alert("✅ Feedback updated successfully!");
      console.log("✅ Feedback saved successfully");
    } catch (error) {
      console.error("❌ Error updating feedback:", error);
      const errorMsg = error.response?.data?.error || error.message || "Unknown error";
      alert("❌ Failed to update feedback: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (feedbackId, customerName) => {
    if (!isLoggedIn) {
      alert("⚠️ Please login to delete feedback");
      return;
    }

    const feedback = feedbacks.find(f => f._id === feedbackId);
    
    // ✅ Check ownership before allowing delete
    if (!isOwnFeedback(feedback)) {
      alert("❌ You can only delete your own feedback");
      console.log("🚫 Delete denied - ownership check failed");
      return;
    }

    const isConfirmed = window.confirm(
      `Are you sure you want to delete the feedback from ${customerName}?\n\nThis action cannot be undone.`
    );

    if (!isConfirmed) return;

    setLoading(true);
    try {
      console.log("🗑️ Deleting feedback:", feedbackId);
      await deleteFeedback(feedbackId);
      onUpdate();
      alert("✅ Feedback deleted successfully!");
      console.log("✅ Feedback deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting feedback:", error);
      const errorMsg = error.response?.data?.error || error.message || "Unknown error";
      alert("❌ Failed to delete feedback: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpfulVote = async (feedbackId, isAdding) => {
    if (!isLoggedIn) {
      alert("⚠️ Please login to vote on feedback");
      return;
    }

    if (!currentUserId && !currentUserEmail) {
      alert("❌ Unable to identify user. Please login again.");
      return;
    }

    // Check if user has already voted (client-side check)
    const feedback = feedbacks.find(f => f._id === feedbackId);
    if (feedback && feedback.helpfulVoters && Array.isArray(feedback.helpfulVoters)) {
      const hasVoted = feedback.helpfulVoters.some(voterId => 
        voterId.toString() === currentUserId.toString() || 
        voterId === currentUserEmail
      );
      
      if (hasVoted && isAdding) {
        alert("⚠️ You have already marked this as helpful");
        return;
      }
      
      if (!hasVoted && !isAdding) {
        alert("⚠️ You haven't voted on this feedback yet");
        return;
      }
    }

    setVotingLoading(prev => ({ ...prev, [feedbackId]: true }));
    try {
      if (isAdding) {
        await addHelpfulVote(feedbackId);
      } else {
        await removeHelpfulVote(feedbackId);
      }
      onUpdate();
    } catch (error) {
      console.error("❌ Error updating helpful vote:", error);
      const errorMsg = error.response?.data?.message || error.message;
      
      if (errorMsg.includes("already voted") || errorMsg.includes("already marked")) {
        alert("⚠️ You have already voted on this feedback");
      } else if (errorMsg.includes("not voted") || errorMsg.includes("haven't voted")) {
        alert("⚠️ You haven't voted on this feedback yet");
      } else {
        alert("❌ Failed to update vote: " + errorMsg);
      }
    } finally {
      setVotingLoading(prev => ({ ...prev, [feedbackId]: false }));
    }
  };

  const handleReport = async (feedbackId, customerName) => {
    if (!isLoggedIn) {
      alert("⚠️ Please login to report feedback");
      return;
    }

    const reason = prompt(
      `Report feedback from ${customerName}?\n\nPlease enter the reason for reporting:`
    );

    if (!reason || reason.trim() === "") return;

    try {
      await reportFeedback(feedbackId, reason.trim());
      alert("✅ Feedback reported successfully!");
      onUpdate();
    } catch (error) {
      console.error("❌ Error reporting feedback:", error);
      alert("❌ Failed to report feedback: " + error.message);
    }
  };

  const renderEditForm = (feedback) => (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#F5DEB3", 
      border: "3px solid #B8764F",
      borderRadius: "12px",
      margin: "10px 0"
    }}>
      <h4 style={{ color: "#8B4513", marginBottom: "15px" }}>✏️ Edit Feedback</h4>
      
      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#8B4513" }}>
          Name: <span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="text"
          name="customerName"
          value={editForm.customerName || ""}
          onChange={handleEditChange}
          disabled={loading}
          style={{
            width: "100%",
            padding: "8px",
            border: "2px solid #E8D4C0",
            borderRadius: "4px",
            fontSize: "14px"
          }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#8B4513" }}>
          Email: <span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="email"
          name="email"
          value={editForm.email || ""}
          onChange={handleEditChange}
          disabled={loading}
          style={{
            width: "100%",
            padding: "8px",
            border: "2px solid #E8D4C0",
            borderRadius: "4px",
            fontSize: "14px"
          }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#8B4513" }}>
          Phone Number:
        </label>
        <input
          type="text"
          name="phoneNumber"
          value={editForm.phoneNumber || ""}
          onChange={handleEditChange}
          disabled={loading}
          style={{
            width: "100%",
            padding: "8px",
            border: "2px solid #E8D4C0",
            borderRadius: "4px",
            fontSize: "14px"
          }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#8B4513" }}>
          Category:
        </label>
        <select
          name="category"
          value={editForm.category || "general"}
          onChange={handleEditChange}
          disabled={loading}
          style={{
            width: "100%",
            padding: "8px",
            border: "2px solid #E8D4C0",
            borderRadius: "4px",
            fontSize: "14px",
            backgroundColor: "white"
          }}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#8B4513" }}>
          Rating:
        </label>
        <select
          name="rating"
          value={editForm.rating || 5}
          onChange={handleEditChange}
          disabled={loading}
          style={{
            width: "100%",
            padding: "8px",
            border: "2px solid #E8D4C0",
            borderRadius: "4px",
            fontSize: "14px",
            backgroundColor: "white"
          }}
        >
          {[5, 4, 3, 2, 1].map((num) => (
            <option key={num} value={num}>
              {num} Star{num !== 1 ? 's' : ''} {'★'.repeat(num)}{'☆'.repeat(5 - num)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#8B4513" }}>
          Message: <span style={{ color: "red" }}>*</span>
        </label>
        <textarea
          name="message"
          value={editForm.message || ""}
          onChange={handleEditChange}
          disabled={loading}
          rows={3}
          style={{
            width: "100%",
            padding: "8px",
            border: "2px solid #E8D4C0",
            borderRadius: "4px",
            fontSize: "14px",
            resize: "vertical"
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => saveEdit(feedback._id)}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: loading ? "#cccccc" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        >
          {loading ? "💾 Saving..." : "💾 Save Changes"}
        </button>
        
        <button
          onClick={cancelEdit}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );

  const renderFeedbackCard = (feedback) => {
    const userOwnsFeedback = isOwnFeedback(feedback);
    
    return (
      <div
        key={feedback._id}
        style={{
          border: getBorderColor(feedback.rating),
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          backgroundColor: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          position: "relative"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <h4 style={{ color: "#8B4513", margin: "0 0 5px 0" }}>
              {feedback.customerName}
              {/* ✅ Show ownership badge for own feedback */}
              {userOwnsFeedback && userRole !== "admin" && (
                <span style={{
                  marginLeft: "10px",
                  padding: "2px 8px",
                  backgroundColor: "#667eea",
                  color: "white",
                  borderRadius: "10px",
                  fontSize: "10px",
                  fontWeight: "bold"
                }}>
                  YOUR FEEDBACK
                </span>
              )}
            </h4>
            {userRole === "admin" ? (
              <p style={{ color: "#666", fontSize: "14px", margin: "0" }}>
                {feedback.email}
              </p>
            ) : (
              <p style={{ color: "#666", fontSize: "14px", margin: "0" }}>
                {feedback.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}
              </p>
            )}
            {userRole === "admin" && feedback.phoneNumber && (
              <p style={{ color: "#666", fontSize: "14px", margin: "0" }}>
                📞 {feedback.phoneNumber}
              </p>
            )}
          </div>
          
          {/* ✅ Edit/Delete buttons - Show for OWN feedback OR admin */}
          {isLoggedIn && userOwnsFeedback && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => startEdit(feedback)}
                disabled={loading || editingId === feedback._id}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#B8764F",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
                title="Edit this feedback"
              >
                ✏️ Edit
              </button>
              
              <button
                onClick={() => handleDelete(feedback._id, feedback.customerName)}
                disabled={loading}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
                title="Delete this feedback"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <span style={{ 
            display: "inline-block", 
            backgroundColor: "#F5DEB3", 
            padding: "4px 8px", 
            borderRadius: "4px", 
            fontSize: "12px",
            fontWeight: "bold",
            marginRight: "10px",
            textTransform: "capitalize",
            color: "#8B4513"
          }}>
            📂 {feedback.category || 'General'}
          </span>
          
          <span style={{ fontSize: "14px" }}>
            Rating: {renderStars(feedback.rating)} ({feedback.rating}/5)
          </span>
        </div>

        <div style={{ 
          backgroundColor: "#F5F5F5", 
          padding: "15px", 
          borderRadius: "8px",
          marginBottom: "10px",
          border: "2px solid #E8D4C0"
        }}>
          <p style={{ 
            margin: "0", 
            fontSize: "14px", 
            lineHeight: "1.5",
            color: "#333"
          }}>
            "{feedback.message}"
          </p>
        </div>

        {/* Interaction buttons - only for logged-in users */}
        {isLoggedIn && (
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            backgroundColor: "#F5DEB3",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "10px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => handleHelpfulVote(feedback._id, true)}
                disabled={votingLoading[feedback._id]}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
                title="Mark as helpful"
              >
                👍 Helpful
              </button>
              
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "#8B4513" }}>
                {feedback.helpfulVotes || 0} helpful votes
              </span>
              
              {feedback.helpfulVotes > 0 && (
                <button
                  onClick={() => handleHelpfulVote(feedback._id, false)}
                  disabled={votingLoading[feedback._id]}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                  title="Remove helpful vote"
                >
                  👎 Undo
                </button>
              )}
            </div>

            <button
              onClick={() => handleReport(feedback._id, feedback.customerName)}
              style={{
                padding: "5px 10px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold"
              }}
              title="Report inappropriate content"
            >
              🚨 Report
            </button>
          </div>
        )}

        {/* Login prompt for non-logged in users */}
        {!isLoggedIn && (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            backgroundColor: "#E8D4C0",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "10px"
          }}>
            <span style={{ fontSize: "14px", color: "#8B4513" }}>
              🔒 Login to vote and interact with feedback
            </span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "12px", color: "#999" }}>
            📅 {new Date(feedback.createdAt).toLocaleDateString()} at {new Date(feedback.createdAt).toLocaleTimeString()}
            {feedback.reportCount > 0 && userRole === "admin" && (
              <span style={{ marginLeft: "10px", color: "#dc3545", fontWeight: "bold" }}>
                🚨 Reports: {feedback.reportCount}
              </span>
            )}
          </div>

          {userRole === "admin" && (
            <div style={{
              backgroundColor: "#8B4513",
              color: "white",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "10px",
              fontWeight: "bold"
            }}>
              👑 ADMIN VIEW
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{
        marginBottom: "20px",
        padding: "15px",
        backgroundColor: userRole === "admin" ? "#F5DEB3" : "#E8D4C0",
        borderRadius: "10px",
        fontSize: "14px",
        border: "2px solid #B8764F"
      }}>
        {userRole === "admin" ? (
          <p style={{ margin: "0", color: "#8B4513" }}>
            <strong>👑 Admin View:</strong> You can view all customer feedback including contact details. You can edit/delete any feedback.
          </p>
        ) : isLoggedIn ? (
          <p style={{ margin: "0", color: "#8B4513" }}>
            <strong>💡 Tip:</strong> You can only edit/delete YOUR OWN feedback. Vote on helpful reviews and report inappropriate content.
          </p>
        ) : (
          <p style={{ margin: "0", color: "#8B4513" }}>
            <strong>👋 Welcome!</strong> Login to submit feedback, vote on reviews, and interact with the community.
          </p>
        )}
      </div>

      {feedbacks.map((feedback) => (
        <div key={feedback._id}>
          {editingId === feedback._id ? renderEditForm(feedback) : renderFeedbackCard(feedback)}
        </div>
      ))}

      {feedbacks.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "40px",
          color: "#8B4513",
          backgroundColor: "#F5DEB3",
          borderRadius: "12px",
          border: "3px solid #E8D4C0"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔭</div>
          <h3>No feedback to display</h3>
          <p>Feedback will appear here once submitted.</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;