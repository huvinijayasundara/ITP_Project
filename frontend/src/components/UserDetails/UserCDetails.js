import { useState, useEffect, useRef, useCallback } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

const URL = "http://localhost:5000/api/userc";

function UserCDetails() {
  const [userc, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const componentRef = useRef();

  // ✅ Fetch all users with authentication
  const fetchHandler = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("You must be logged in to view users");
        navigate("/login");
        return [];
      }

      const res = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return res.data.userc || [];
    } catch (err) {
      console.error("Fetch error:", err);
      
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        alert("You don't have permission to view this page");
        navigate("/");
      } else {
        alert("Failed to load users. Please try again.");
      }
      
      return [];
    }
  }, [navigate]);

  useEffect(() => {
    fetchHandler().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, [fetchHandler]);

  // Download PDF
  const downloadPDF = () => {
    if (!Array.isArray(userc) || userc.length === 0) {
      alert("No user data to generate PDF");
      return;
    }

    const pdf = new jsPDF("l", "mm", "a4");

    const logo = require("../logo.png");
    pdf.addImage(logo, "PNG", 10, 10, 40, 20);

    pdf.setFontSize(16);
    pdf.text("Articraft", 60, 15);
    pdf.setFontSize(10);
    pdf.text("123, Galle Rd, Galle, Sri Lanka", 60, 22);
    pdf.text("Phone: +0112345678 | Email: info@company.com", 60, 28);

    pdf.setFontSize(14);
    pdf.text("Customer Report", 14, 40);

    autoTable(pdf, {
      head: [["ID", "Name", "Gmail", "Phone Number", "Role"]],
      body: userc.map(u => [u._id, u.name, u.gmail, u.phoneNumber, u.role || 'user']),
      startY: 45,
    });

    pdf.save("Customers_Report.pdf");
  };

  // Search function
  const handleSearch = async (query) => {
    const data = await fetchHandler();
    const filteredUsers = data.filter((userc) =>
      Object.entries(userc).some(([key, value]) =>
        key !== "password" && key !== "conPassword" &&
        String(value).toLowerCase().includes(query.toLowerCase())
      )
    );
    setUsers(filteredUsers);
    setNoResults(filteredUsers.length === 0);
  };

  // Delete user
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          alert("You must be logged in");
          navigate("/login");
          return;
        }

        await axios.delete(`${URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUsers(userc.filter(userc => userc._id !== id));
        alert("User deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err);
        
        if (err.response?.status === 403) {
          alert("You don't have permission to delete users");
        } else {
          alert("Failed to delete user. Please try again.");
        }
      }
    }
  };

  // Navigate to update page
  const handleUpdate = (id) => {
    navigate(`/usercdetails/${id}`);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Customer Management</h1>

      {/* Search and Download Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Search Input */}
        <div className="flex-grow-1 me-2" style={{ maxWidth: '300px' }}>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search Customers"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </div>

        {/* Download Report Button */}
        <button className="btn btn-success btn-sm" onClick={downloadPDF}>
          📄 Download Report
        </button>
      </div>

      {noResults ? (
        <div className="alert alert-info">
          No customers found matching your search.
        </div>
      ) : userc.length === 0 ? (
        <div className="alert alert-warning">
          No customers registered yet.
        </div>
      ) : (
        <div ref={componentRef} style={{ marginTop: "20px", overflowX: 'auto' }}>
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(userc) && userc.map((user, i) => {
                const { password, conPassword, ...safeUser } = user;
                return (
                  <tr key={i}>
                    <td>{safeUser._id}</td>
                    <td>{safeUser.name}</td>
                    <td>{safeUser.gmail}</td>
                    <td>{safeUser.phoneNumber}</td>
                    <td>
                      <span className={`badge ${
                        safeUser.role === 'admin' ? 'bg-danger' : 
                        safeUser.role === 'delivery' ? 'bg-warning' : 
                        'bg-primary'
                      }`}>
                        {safeUser.role?.toUpperCase() || 'USER'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleUpdate(safeUser._id)}
                      >
                        ✏️ Update
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(safeUser._id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserCDetails;