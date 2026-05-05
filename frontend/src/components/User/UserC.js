import React, { useState } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserC({ userc, onDelete }) {
  const { _id, name, gmail, phoneNumber } = userc;
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
        `http://localhost:5000/api/userc/${_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete response:", response.data);

      if (response.data.status === "Ok") {
        alert("Customer deleted successfully!");
        
        // Call parent's onDelete callback
        if (onDelete) {
          onDelete(_id);
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      
      if (error.response) {
        if (error.response.status === 403) {
          alert("You don't have permission to delete this user");
        } else {
          alert(error.response.data.message || "Failed to delete customer");
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
    <tr>
      <td>{_id}</td>
      <td>{name}</td>
      <td>{gmail}</td>
      <td>{phoneNumber}</td>
      <td>
        <Link 
          to={`/usercdetails/${_id}`} 
          className="btn btn-primary btn-sm me-2"
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
      </td>
    </tr>
  );
}

export default UserC;