import { useState, useEffect, useRef, useCallback } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

const URL = "http://localhost:5000/api/users";

function UserDetails() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const navigate = useNavigate();
  const componentRef = useRef();

  // ✅ Fetch all users WITH AUTHENTICATION
  const fetchHandler = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("You must be logged in to view artisans");
        navigate("/login");
        return [];
      }

      const res = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return res.data.users || [];
    } catch (err) {
      console.error("Fetch artisans error:", err);
      
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        alert("You don't have permission to view artisans");
      } else {
        alert("Failed to load artisans");
      }
      
      return [];
    }
  }, [navigate]);

  useEffect(() => {
    fetchHandler().then((data) => setUsers(data));
  }, [fetchHandler]);

  // Download artisan list as PDF
  const downloadPDF = () => {
    if (!Array.isArray(users) || users.length === 0) {
      alert("No user data to generate PDF");
      return;
    }

    const pdf = new jsPDF("l", "mm", "a4");

    // Add  logo (PDF image)
    const logo = require("../logo.png"); // Ensure logo.png is in the public folder
    pdf.addImage(logo, "PNG", 10, 10, 40, 20);

    pdf.setFontSize(16);
    pdf.text("Articraft", 60, 15);
    pdf.setFontSize(10);
    pdf.text("123, Galle Rd, Galle, Sri Lanka", 60, 22);
    pdf.text("Phone: +0112345678 | Email: info@company.com", 60, 28);

    pdf.setFontSize(14);
    pdf.text("Artisan Report", 14, 40);

    autoTable(pdf, {
      head: [["ID", "Name", "Gmail", "Phone Number"]],
      body: users.map(u => [u._id, u.name, u.gmail, u.phoneNumber]),
      startY: 45,
    });

    pdf.save("Artisan_Report.pdf");
  };

  // Search artisans
  const handleSearch = async (query) => {
    const data = await fetchHandler();
    const filteredUsers = data.filter((user) =>
      Object.entries(user).some(([key, value]) =>
        key !== "password" && key !== "conPassword" &&
        String(value).toLowerCase().includes(query.toLowerCase())
      )
    );
    setUsers(filteredUsers);
    setNoResults(filteredUsers.length === 0);
  };

  // ✅ Delete artisan WITH AUTHENTICATION
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this artisan?")) {
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
        
        setUsers(users.filter(user => user._id !== id));
        alert("Artisan deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err);
        
        if (err.response?.status === 403) {
          alert("You don't have permission to delete artisans");
        } else {
          alert("Failed to delete artisan.");
        }
      }
    }
  };

  // ✅ Update artisan
  const handleUpdate = (id) => {
    navigate(`/userdetails/${id}`);
  };

  return (
    <div className="container mt-4">
      
      {/* ✅ Page Header with Add Artisan Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Manage Artisans</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/addUser")}
        >
          ➕ Add Artisan
        </button>
      </div>

      {/* ✅ Search + PDF download */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ maxWidth: "300px" }}
          placeholder="Search Artisans"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
        />

        <button className="btn btn-success btn-sm" onClick={downloadPDF}>
          📄 Download Report
        </button>
      </div>

      {/* ✅ Artisan List Table */}
      {noResults ? (
        <p>No artisans found.</p>
      ) : (
        <div ref={componentRef} style={{ marginTop: "20px", overflowX: "auto" }}>
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gmail</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const { password, conPassword, ...safeUser } = user;
                return (
                  <tr key={i}>
                    <td>{safeUser._id}</td>
                    <td>{safeUser.name}</td>
                    <td>{safeUser.gmail}</td>
                    <td>{safeUser.phoneNumber}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleUpdate(safeUser._id)}
                      >
                        Update
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(safeUser._id)}
                      >
                        Delete
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

export default UserDetails;