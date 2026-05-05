import React, { useState, useEffect, useCallback } from "react";
import { getComplaints, updateComplaintStatus } from "../api/complaintApi";
import ComplaintForm from "../components/Complaints/ComplaintForm";
import ComplaintList from "../components/Complaints/ComplaintList";

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredComplaints, setFilteredComplaints] = useState([]);

  // ✅ CRITICAL FIX: Get user info from multiple sources
  const getUserInfo = () => {
    // Get role
    const role = (localStorage.getItem('role') || localStorage.getItem('userRole') || 'customer').toLowerCase().trim();
    
    // ✅ Get email from user object (since your login saves it as JSON)
    let email = '';
    let name = '';
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        email = (user.gmail || user.email || '').toLowerCase().trim();
        name = user.name || '';
      }
    } catch (e) {
      console.warn("Could not parse user object:", e);
    }
    
    // Fallback to userName
    if (!name) {
      name = localStorage.getItem('userName') || localStorage.getItem('name') || '';
    }
    
    // If email still empty, try direct keys (won't exist in your current login, but just in case)
    if (!email) {
      email = (localStorage.getItem('gmail') || localStorage.getItem('email') || '').toLowerCase().trim();
    }

    console.log("🔍 User Authentication Info:", {
      role,
      email,
      name,
      userObject: localStorage.getItem('user') ? 'Found' : 'Not found',
      allKeys: Object.keys(localStorage)
    });

    return { role, email, name };
  };

  const { role: userRole, email: userEmail, name: userName } = getUserInfo();

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📡 Fetching complaints from server...");
      const res = await getComplaints();
      
      console.log("📋 Raw API response:", res.data);
      
      // Extract complaints array from response
      let complaintsData = [];
      
      if (res.data) {
        if (Array.isArray(res.data)) {
          complaintsData = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          complaintsData = res.data.data;
        } else if (res.data.success && Array.isArray(res.data.data)) {
          complaintsData = res.data.data;
        } else {
          console.error("❌ Unexpected response format:", res.data);
          throw new Error("Invalid response format from server");
        }
      }
      
      console.log(`📊 Total complaints from server: ${complaintsData.length}`);
      
      // ✅ CRITICAL FIX: Proper role-based filtering
      const isAdmin = userRole === 'admin';
      const isCustomer = ['customer', 'user'].includes(userRole);
      
      if (isAdmin) {
        // ✅ ADMIN: Show ALL complaints
        console.log(`👨‍💼 Admin view: Showing all ${complaintsData.length} complaints`);
        setComplaints(complaintsData);
        setFilteredComplaints(complaintsData);
        return;
      }
      
      if (isCustomer) {
        // ✅ CUSTOMER: Show ONLY their own complaints
        
        // ✅ CRITICAL: Check if user email exists
        if (!userEmail || userEmail.trim() === '') {
          console.error("❌ CRITICAL: No user email found!");
          console.log("📦 localStorage contents:");
          console.log("  - user object:", localStorage.getItem('user'));
          console.log("  - role:", localStorage.getItem('role'));
          console.log("  - userName:", localStorage.getItem('userName'));
          
          setError("Unable to identify your email. Please log in again to submit and view complaints.");
          setComplaints([]);
          setFilteredComplaints([]);
          return;
        }

        const normalizedUserEmail = userEmail.toLowerCase().trim();
        console.log(`🔐 Filtering complaints for user: "${normalizedUserEmail}"`);

        // ✅ STRICT EMAIL MATCHING
        const userComplaints = complaintsData.filter(complaint => {
          if (!complaint) {
            console.warn("⚠️ Null/undefined complaint found");
            return false;
          }

          if (!complaint.email) {
            console.warn(`⚠️ Complaint ${complaint.ticketRef} has no email`);
            return false;
          }

          const complaintEmail = complaint.email.toLowerCase().trim();
          const matches = complaintEmail === normalizedUserEmail;
          
          console.log(`${matches ? '✅' : '❌'} Ticket ${complaint.ticketRef}: "${complaintEmail}" ${matches ? '===' : '!=='} "${normalizedUserEmail}"`);
          
          return matches;
        });

        console.log(`\n🎯 FILTER RESULT: Found ${userComplaints.length} complaints for "${normalizedUserEmail}"`);
        
        if (userComplaints.length === 0) {
          console.log("ℹ️ No complaints found for this user - this is normal if they haven't submitted any");
        } else {
          console.log("✅ User complaints:", userComplaints.map(c => ({
            ticket: c.ticketRef,
            email: c.email,
            status: c.status
          })));
        }

        setComplaints(userComplaints);
        setFilteredComplaints(userComplaints);
        return;
      }

      // Unknown role
      console.warn(`⚠️ Unknown user role: "${userRole}"`);
      setError("Invalid user role. Please contact support.");
      setComplaints([]);
      setFilteredComplaints([]);
      
    } catch (err) {
      console.error("❌ Error fetching complaints:", err);
      setError(`Failed to load complaints: ${err.message || "Please check if the server is running."}`);
      setComplaints([]);
      setFilteredComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [userRole, userEmail]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredComplaints(complaints);
      return;
    }

    const filtered = complaints.filter(complaint => 
      complaint.ticketRef && 
      complaint.ticketRef.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredComplaints(filtered);
  };

  const handleStatusChange = async (id, status) => {
    try {
      console.log("🔄 Updating status:", id, status);
      
      if (status === 'DELETE') {
        const complaint = complaints.find(c => (c._id || c.id) === id);
        
        // ✅ VALIDATION: Check ownership and permissions
        if (userRole === 'customer' || userRole === 'user') {
          if (!complaint) {
            alert("❌ Complaint not found");
            return;
          }
          
          // ✅ STRICT: Customer can only delete their OWN complaints
          if (complaint.email.toLowerCase().trim() !== userEmail.toLowerCase().trim()) {
            alert("❌ You can only delete your own complaints");
            return;
          }
          
          if (complaint.status !== "open") {
            alert("❌ You can only delete complaints that are still open");
            return;
          }
        } else if (userRole === 'admin') {
          if (complaint && complaint.status !== "resolved") {
            alert("❌ Only resolved complaints can be deleted");
            return;
          }
        } else {
          alert("❌ You don't have permission to delete complaints");
          return;
        }
        
        if (!window.confirm(`Are you sure you want to delete complaint ${complaint.ticketRef}?`)) {
          return;
        }
        
        const response = await fetch(`http://localhost:5000/api/complaints/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete complaint');
        }
        
        console.log("✅ Complaint deleted successfully");
        alert("✅ Complaint deleted successfully");
        fetchComplaints();
        return;
      }

      await updateComplaintStatus(id, status);
      console.log("✅ Status updated successfully");
      alert("✅ Status updated successfully");
      fetchComplaints();
      
    } catch (err) {
      console.error("❌ Error:", err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleEdit = async (id, updatedData) => {
    try {
      console.log("📝 Editing complaint:", id, updatedData);
      
      const response = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update complaint');
      }
      
      console.log("✅ Complaint updated successfully");
      alert("✅ Complaint updated successfully");
      fetchComplaints();
      
    } catch (err) {
      console.error("❌ Error updating complaint:", err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#F5F5F5",
      padding: "40px 20px" 
    }}>
      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(139, 69, 19, 0.2)"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              border: "6px solid #F5DEB3",
              borderTop: "6px solid #B8764F",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }} />
            <p style={{ fontSize: "18px", color: "#8B4513", fontWeight: "bold", margin: 0 }}>
              Loading Complaints...
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "40px",
        marginBottom: "30px",
        boxShadow: "0 4px 12px rgba(139, 69, 19, 0.1)",
        border: "2px solid #E8D4C0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
            <span style={{ fontSize: "48px" }}>📝</span>
            <h1 style={{ 
              fontSize: "36px", 
              fontWeight: "bold", 
              color: "#8B4513",
              margin: 0 
            }}>
              Complaints Management
            </h1>
          </div>
          <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
            {userRole === "admin" 
              ? "View and manage all customer complaints system-wide"
              : "Submit and track your personal complaints"}
          </p>
        </div>
        <div style={{
          padding: "12px 20px",
          backgroundColor: userRole === "admin" ? "#28a745" : "#B8764F",
          color: "white",
          borderRadius: "30px",
          fontSize: "15px",
          fontWeight: "bold",
          boxShadow: "0 4px 8px rgba(0,0,0,0.15)"
        }}>
          {userRole === "admin" ? "👨‍💼 Admin Panel" : `👤 ${userName || userEmail || 'Customer Portal'}`}
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div style={{ 
          color: "#721c24", 
          padding: "15px 20px", 
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "8px",
          marginBottom: "25px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <strong>⚠️ Error:</strong> {error}
          </div>
          <button 
            onClick={fetchComplaints}
            style={{ 
              padding: "8px 16px",
              backgroundColor: "#721c24",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px"
            }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* Admin Search Bar */}
      {userRole === "admin" && (
        <div style={{ 
          marginBottom: "30px",
          padding: "25px",
          backgroundColor: "#ffffff",
          border: "2px solid #E8D4C0",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(139, 69, 19, 0.07)"
        }}>
          <h4 style={{ 
            margin: "0 0 15px 0", 
            color: "#8B4513",
            fontSize: "18px",
            fontWeight: "600"
          }}>
            🔍 Search Complaints
          </h4>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Enter Ticket Number (e.g., CMP-20250925-ABC12)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "15px 20px",
                border: "2px solid #E8D4C0",
                borderRadius: "30px",
                fontSize: "16px",
                outline: "none",
                transition: "all 0.3s",
                boxShadow: "0 2px 4px rgba(139, 69, 19, 0.05)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#B8764F";
                e.target.style.boxShadow = "0 0 0 3px rgba(184, 118, 79, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E8D4C0";
                e.target.style.boxShadow = "0 2px 4px rgba(139, 69, 19, 0.05)";
              }}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "8px 12px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "15px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                ✖ Clear
              </button>
            )}
          </div>
          {searchQuery && (
            <div style={{ 
              marginTop: "12px", 
              fontSize: "14px", 
              color: "#666",
              fontWeight: "500"
            }}>
              📊 Found <strong>{filteredComplaints.length}</strong> complaint(s) matching "<strong>{searchQuery}</strong>"
            </div>
          )}
        </div>
      )}
      
      {/* Customer Complaint Form */}
      {(userRole === "customer" || userRole === "user") && (
        <div style={{ marginBottom: "40px" }}>
          <ComplaintForm onAdded={fetchComplaints} userEmail={userEmail} userName={userName} />
        </div>
      )}

      {/* Role Information */}
      {userRole === "admin" && (
        <div style={{
          padding: "20px",
          backgroundColor: "#FFF9F0",
          border: "1px solid #E8D4C0",
          borderRadius: "10px",
          marginBottom: "30px",
          fontSize: "15px",
          lineHeight: "1.6"
        }}>
          <div style={{ fontWeight: "bold", color: "#8B4513", marginBottom: "8px" }}>
            🛡️ Administrator Functions:
          </div>
          <ul style={{ 
            margin: 0, 
            paddingLeft: "20px",
            color: "#666"
          }}>
            <li>View and manage all customer complaints system-wide</li>
            <li>Search complaints by ticket number across all users</li>
            <li>Change complaint status and assign to team members</li>
            <li>Edit any complaint details and add resolutions</li>
            <li>Delete resolved complaints when necessary</li>
          </ul>
        </div>
      )}

      {(userRole === "customer" || userRole === "user") && (
        <div style={{
          padding: "20px",
          backgroundColor: "#FFF9F0",
          border: "1px solid #E8D4C0",
          borderRadius: "10px",
          marginBottom: "30px",
          fontSize: "15px",
          lineHeight: "1.6"
        }}>
          <div style={{ fontWeight: "bold", color: "#8B4513", marginBottom: "8px" }}>
            ℹ️ Customer Portal Information:
          </div>
          <ul style={{ 
            margin: 0, 
            paddingLeft: "20px",
            color: "#666"
          }}>
            <li>Submit new complaints with detailed descriptions</li>
            <li><strong>View ONLY YOUR submitted complaints (not other customers' complaints)</strong></li>
            <li>Edit your own open complaints before they're processed</li>
            <li>Delete your own open complaints if no longer needed</li>
            <li>Track complaint progress with unique ticket numbers</li>
          </ul>
        </div>
      )}
      
      {/* Complaints Count Summary */}
      <div style={{
        padding: "15px 20px",
        background: "linear-gradient(135deg, #B8764F 0%, #8B4513 100%)",
        borderRadius: "10px",
        marginBottom: "20px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 8px rgba(139, 69, 19, 0.15)"
      }}>
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
          📋 {userRole === 'admin' ? 'Total Complaints' : 'My Complaints'}
        </div>
        <div style={{ 
          fontSize: "24px", 
          fontWeight: "bold",
          background: "rgba(255,255,255,0.2)",
          padding: "5px 20px",
          borderRadius: "20px"
        }}>
          {filteredComplaints.length}
        </div>
      </div>
      
      {/* Complaints List */}
      <ComplaintList 
        complaints={filteredComplaints} 
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
        userRole={userRole}
        userEmail={userEmail}
      />
    </div>
  );
};

export default ComplaintsPage;