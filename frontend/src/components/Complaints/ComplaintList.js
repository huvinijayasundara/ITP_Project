import React, { useState } from "react";

const ComplaintList = ({ complaints, onStatusChange, onEdit, userRole = "customer", userEmail = "" }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  // ✅ Check if user owns this complaint
  const isOwnComplaint = (complaint) => {
    if (!userEmail || !complaint.email) return false;
    return complaint.email.toLowerCase() === userEmail.toLowerCase();
  };

  // ✅ Check if user can edit this complaint
  const canEdit = (complaint) => {
    if (userRole === "admin") return true;
    if (userRole === "customer" || userRole === "user") {
      return isOwnComplaint(complaint) && complaint.status === "open";
    }
    return false;
  };

  // ✅ Check if user can delete this complaint
  const canDelete = (complaint) => {
    if (userRole === "admin") {
      return complaint.status === "resolved";
    }
    if (userRole === "customer" || userRole === "user") {
      return isOwnComplaint(complaint) && complaint.status === "open";
    }
    return false;
  };

  const handleEditStart = (complaint) => {
    if (!canEdit(complaint)) {
      if (userRole === "customer" || userRole === "user") {
        if (!isOwnComplaint(complaint)) {
          alert("❌ You can only edit your own complaints");
        } else {
          alert("❌ You can only edit complaints that are still open");
        }
      }
      return;
    }
    
    setEditingId(complaint._id || complaint.id);
    setEditForm({
      customerName: complaint.customerName || "",
      email: complaint.email || "",
      issue: complaint.issue || "",
      category: complaint.category || "general",
      priority: complaint.priority || "medium",
      assignedTo: userRole === "admin" ? (complaint.assignedTo || "") : "",
      resolution: userRole === "admin" ? (complaint.resolution || "") : ""
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditSave = async (id) => {
    if (onEdit) {
      await onEdit(id, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = (complaint) => {
    if (!canDelete(complaint)) {
      if (userRole === "admin") {
        alert("❌ Only resolved complaints can be deleted");
      } else {
        if (!isOwnComplaint(complaint)) {
          alert("❌ You can only delete your own complaints");
        } else {
          alert("❌ You can only delete complaints that are still open");
        }
      }
      return;
    }

    if (window.confirm(`Delete complaint ${complaint.ticketRef}?`)) {
      onStatusChange(complaint._id || complaint.id, 'DELETE');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return '#dc3545';
      case 'in-progress': return '#B8764F';
      case 'resolved': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusBadgeStyle = (status) => {
    return {
      padding: "6px 16px",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: "bold",
      color: "white",
      backgroundColor: getStatusColor(status),
      border: "none",
      display: "inline-block"
    };
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#B8764F';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "product-quality": "🏺",
      "shipping": "📦",
      "customer-service": "🎧",
      "billing": "💳",
      "website": "🌐",
      "refund-exchange": "🔄",
      "general": "📝",
      "other": "❓"
    };
    return icons[category] || "📝";
  };

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        padding: "15px 20px",
        background: "#F5DEB3",
        borderRadius: "10px",
        border: "1px solid #E8D4C0"
      }}>
        <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#8B4513" }}>
          {userRole === "admin" ? "All Complaints" : "My Complaints"} ({safeComplaints.length})
        </h3>
        {safeComplaints.length > 0 && (
          <div style={{ fontSize: "13px", color: "#666" }}>
            {userRole === "admin" 
              ? "Showing all customer complaints" 
              : "Showing only your submitted complaints"}
          </div>
        )}
      </div>
      
      {safeComplaints.length === 0 ? (
        <div style={{ 
          padding: "60px 20px", 
          textAlign: "center", 
          backgroundColor: "#FFF9F0", 
          borderRadius: "12px", 
          border: "2px dashed #E8D4C0",
          boxShadow: "0 2px 4px rgba(139, 69, 19, 0.05)"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "15px" }}>📋</div>
          <h4 style={{ color: "#8B4513", marginBottom: "8px" }}>No complaints found</h4>
          <p style={{ color: "#666", margin: 0 }}>
            {userRole === "admin" 
              ? "No complaints have been submitted yet" 
              : "You haven't submitted any complaints yet"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {safeComplaints.map((complaint, index) => {
            if (!complaint || typeof complaint !== 'object') return null;

            const c = complaint;
            const isEditing = editingId === (c._id || c.id);
            const userOwnsThis = isOwnComplaint(c);
            
            return (
              <div key={c._id || c.id || index} style={{ 
                border: "2px solid #E8D4C0", 
                borderRadius: "12px", 
                padding: "25px", 
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(139, 69, 19, 0.08)",
                transition: "all 0.3s"
              }}>
                
                {isEditing ? (
                  // ========== EDIT MODE ==========
                  <div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                      paddingBottom: "15px",
                      borderBottom: "2px solid #F5DEB3"
                    }}>
                      <h4 style={{ margin: 0, color: "#8B4513", fontSize: "20px" }}>
                        ✏️ Edit Complaint
                      </h4>
                      <span style={getStatusBadgeStyle(c.status)}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div style={{ display: "grid", gap: "15px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#666" }}>
                          <strong>Customer Name:</strong>
                        </label>
                        <input 
                          type="text" 
                          value={editForm.customerName} 
                          onChange={(e) => handleEditChange('customerName', e.target.value)} 
                          style={{ 
                            width: "100%", 
                            padding: "12px", 
                            border: "2px solid #E8D4C0",
                            borderRadius: "8px",
                            fontSize: "15px"
                          }} 
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#666" }}>
                          <strong>Email:</strong>
                        </label>
                        <input 
                          type="email" 
                          value={editForm.email} 
                          onChange={(e) => handleEditChange('email', e.target.value)} 
                          style={{ 
                            width: "100%", 
                            padding: "12px", 
                            border: "2px solid #E8D4C0",
                            borderRadius: "8px",
                            fontSize: "15px"
                          }} 
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#666" }}>
                            <strong>Category:</strong>
                          </label>
                          <select 
                            value={editForm.category} 
                            onChange={(e) => handleEditChange('category', e.target.value)}
                            style={{ 
                              width: "100%", 
                              padding: "12px", 
                              border: "2px solid #E8D4C0",
                              borderRadius: "8px",
                              fontSize: "15px"
                            }}
                          >
                            <option value="product-quality">🏺 Product Quality</option>
                            <option value="shipping">📦 Shipping</option>
                            <option value="customer-service">🎧 Customer Service</option>
                            <option value="billing">💳 Billing</option>
                            <option value="website">🌐 Website</option>
                            <option value="refund-exchange">🔄 Refund/Exchange</option>
                            <option value="general">📝 General</option>
                            <option value="other">❓ Other</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#666" }}>
                            <strong>Priority:</strong>
                          </label>
                          <select 
                            value={editForm.priority} 
                            onChange={(e) => handleEditChange('priority', e.target.value)}
                            style={{ 
                              width: "100%", 
                              padding: "12px", 
                              border: "2px solid #E8D4C0",
                              borderRadius: "8px",
                              fontSize: "15px"
                            }}
                          >
                            <option value="low">🟢 Low</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="high">🟠 High</option>
                            <option value="urgent">🔴 Urgent</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#666" }}>
                          <strong>Issue Description:</strong>
                        </label>
                        <textarea 
                          value={editForm.issue} 
                          onChange={(e) => handleEditChange('issue', e.target.value)} 
                          style={{ 
                            width: "100%", 
                            padding: "12px", 
                            border: "2px solid #E8D4C0",
                            borderRadius: "8px",
                            minHeight: "120px",
                            fontSize: "15px",
                            resize: "vertical"
                          }} 
                        />
                      </div>
                      
                      {/* ADMIN ONLY FIELDS */}
                      {userRole === "admin" && (
                        <>
                          <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#666" }}>
                              <strong>👨‍💼 Assigned To (Admin Name):</strong>
                            </label>
                            <input 
                              type="text" 
                              value={editForm.assignedTo} 
                              onChange={(e) => handleEditChange('assignedTo', e.target.value)} 
                              placeholder="Enter admin name"
                              style={{ 
                                width: "100%", 
                                padding: "12px", 
                                border: "2px solid #E8D4C0",
                                borderRadius: "8px",
                                fontSize: "15px"
                              }} 
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#666" }}>
                              <strong>✅ Resolution/Solution:</strong>
                            </label>
                            <textarea 
                              value={editForm.resolution} 
                              onChange={(e) => handleEditChange('resolution', e.target.value)} 
                              placeholder="Enter resolution details"
                              style={{ 
                                width: "100%", 
                                padding: "12px", 
                                border: "2px solid #E8D4C0",
                                borderRadius: "8px",
                                minHeight: "80px",
                                fontSize: "15px",
                                resize: "vertical"
                              }} 
                            />
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                      <button 
                        onClick={() => handleEditSave(c._id || c.id)} 
                        style={{ 
                          backgroundColor: "#28a745", 
                          color: "white", 
                          padding: "12px 24px", 
                          border: "none", 
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "15px"
                        }}
                      >
                        ✅ Save Changes
                      </button>
                      <button 
                        onClick={handleEditCancel} 
                        style={{ 
                          backgroundColor: "#6c757d", 
                          color: "white", 
                          padding: "12px 24px", 
                          border: "none", 
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "15px"
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // ========== VIEW MODE ==========
                  <div>
                    {/* Header Row */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "20px",
                      paddingBottom: "15px",
                      borderBottom: "2px solid #F5DEB3"
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                          <span style={{ fontSize: "24px" }}>{getCategoryIcon(c.category)}</span>
                          <h4 style={{ margin: 0, color: "#8B4513", fontSize: "18px" }}>
                            Ticket: <strong>{c.ticketRef || "N/A"}</strong>
                          </h4>
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <span style={getStatusBadgeStyle(c.status)}>
                            {c.status.toUpperCase()}
                          </span>
                          <span style={{
                            padding: "6px 16px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "bold",
                            color: "white",
                            backgroundColor: getPriorityColor(c.priority),
                            display: "inline-block"
                          }}>
                            {c.priority ? c.priority.toUpperCase() : "MEDIUM"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Ownership Badge for Customers */}
                      {(userRole === "customer" || userRole === "user") && userOwnsThis && (
                        <div style={{
                          padding: "8px 16px",
                          background: "linear-gradient(135deg, #B8764F 0%, #8B4513 100%)",
                          color: "white",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}>
                          👤 Your Complaint
                        </div>
                      )}
                    </div>

                    {/* Complaint Details Grid */}
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "20px",
                      marginBottom: "20px"
                    }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "4px", fontWeight: "600" }}>
                          CUSTOMER NAME
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: "600", color: "#666" }}>
                          {c.customerName || "N/A"}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "4px", fontWeight: "600" }}>
                          EMAIL
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: "600", color: "#666" }}>
                          {c.email || "N/A"}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "4px", fontWeight: "600" }}>
                          SUBMITTED ON
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: "600", color: "#666" }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : "N/A"}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "4px", fontWeight: "600" }}>
                          CATEGORY
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: "600", color: "#666" }}>
                          {getCategoryIcon(c.category)} {c.category ? c.category.replace('-', ' ').toUpperCase() : "GENERAL"}
                        </div>
                      </div>
                    </div>

                    {/* Issue Description */}
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "8px", fontWeight: "600" }}>
                        ISSUE DESCRIPTION
                      </div>
                      <div style={{ 
                        fontSize: "15px", 
                        color: "#666", 
                        lineHeight: "1.6",
                        padding: "15px",
                        backgroundColor: "#F5DEB3",
                        borderRadius: "8px",
                        border: "1px solid #E8D4C0"
                      }}>
                        {c.issue || "N/A"}
                      </div>
                    </div>
                    
                    {/* ADMIN ONLY - Resolution & Assigned To */}
                    {userRole === "admin" && (
                      <div style={{ 
                        display: "grid", 
                        gap: "15px",
                        marginBottom: "20px",
                        padding: "15px",
                        backgroundColor: "#FFF9F0",
                        borderRadius: "8px",
                        border: "1px solid #E8D4C0"
                      }}>
                        {c.assignedTo && (
                          <div>
                            <div style={{ fontSize: "12px", color: "#8B4513", marginBottom: "4px", fontWeight: "600" }}>
                              👨‍💼 ASSIGNED TO
                            </div>
                            <div style={{ fontSize: "15px", fontWeight: "600", color: "#8B4513" }}>
                              {c.assignedTo}
                            </div>
                          </div>
                        )}
                        
                        {c.resolution && (
                          <div>
                            <div style={{ fontSize: "12px", color: "#8B4513", marginBottom: "4px", fontWeight: "600" }}>
                              ✅ RESOLUTION
                            </div>
                            <div style={{ fontSize: "15px", color: "#8B4513", lineHeight: "1.6" }}>
                              {c.resolution}
                            </div>
                          </div>
                        )}
                        
                        {c.resolvedAt && (
                          <div>
                            <div style={{ fontSize: "12px", color: "#8B4513", marginBottom: "4px", fontWeight: "600" }}>
                              🕐 RESOLVED AT
                            </div>
                            <div style={{ fontSize: "15px", fontWeight: "600", color: "#8B4513" }}>
                              {new Date(c.resolvedAt).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action Buttons Row */}
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "20px",
                      paddingTop: "15px",
                      borderTop: "2px solid #F5DEB3"
                    }}>
                      {/* STATUS DISPLAY/CHANGE */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <strong style={{ fontSize: "14px", color: "#666" }}>Status:</strong>
                        {userRole === "admin" ? (
                          // ADMIN - Dropdown to change status
                          <select 
                            value={c.status || "open"} 
                            onChange={(e) => onStatusChange(c._id || c.id, e.target.value)} 
                            style={{ 
                              padding: "8px 12px",
                              border: "2px solid #E8D4C0",
                              borderRadius: "6px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        ) : (
                          // CUSTOMER - Read-only badge
                          <span style={getStatusBadgeStyle(c.status)}>
                            {c.status || "open"}
                          </span>
                        )}
                      </div>
                      
                      {/* EDIT & DELETE BUTTONS */}
                      <div style={{ display: "flex", gap: "10px" }}>
                        {canEdit(c) && (
                          <button 
                            onClick={() => handleEditStart(c)} 
                            style={{ 
                              backgroundColor: "#B8764F", 
                              color: "white", 
                              padding: "10px 20px", 
                              border: "none", 
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "14px"
                            }}
                          >
                            ✏️ Edit
                          </button>
                        )}
                        
                        {canDelete(c) && (
                          <button 
                            onClick={() => handleDelete(c)}
                            style={{ 
                              backgroundColor: "#dc3545", 
                              color: "white", 
                              padding: "10px 20px", 
                              border: "none", 
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "14px"
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                        
                        {/* Show disabled buttons with tooltip for non-editable items */}
                        {(userRole === "customer" || userRole === "user") && !canEdit(c) && userOwnsThis && (
                          <div style={{
                            padding: "10px 20px",
                            backgroundColor: "#e9ecef",
                            color: "#6c757d",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600"
                          }}>
                            ℹ️ {c.status === "open" ? "Cannot edit" : "Only open complaints can be edited"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComplaintList;