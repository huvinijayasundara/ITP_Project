import React, { useState } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function User({ user = {}, onDelete }) {
  const { _id, name, gmail, phoneNumber } = user;
  const [deleting, setDeleting] = useState(false);
  const history = useNavigate();

  const deleteHandler = async () => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    setDeleting(true);

    try {
      // ✅ FIXED: Correct API endpoint with token
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("You must be logged in to delete users");
        history("/login");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/users/${_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete response:", response.data);

      if (response.data.status === "Ok") {
        alert("User deleted successfully!");
        
        // Call parent's onDelete if provided
        if (onDelete) {
          onDelete(_id);
        } else {
          // Reload if no parent handler
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      
      if (error.response) {
        if (error.response.status === 403) {
          alert("You don't have permission to delete this user");
        } else {
          alert(error.response.data.message || "Failed to delete user");
        }
      } else if (error.request) {
        alert("Cannot connect to server. Please check if backend is running.");
      } else {
        alert("An error occurred. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">
          <span className="badge bg-secondary">Artisan</span>
        </h5>
        <p className="card-text">
          <strong>Name:</strong> {name}<br />
          <strong>Email:</strong> {gmail}<br />
          <strong>Phone:</strong> {phoneNumber}<br />
          <small className="text-muted">ID: {_id}</small>
        </p>
        <div className="d-flex gap-2">
          <Link 
            to={`/userdetails/${_id}`} 
            className="btn btn-primary btn-sm"
          >
            ✏️ Update
          </Link>
          <button 
            onClick={deleteHandler} 
            className="btn btn-danger btn-sm"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "🗑️ Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default User;