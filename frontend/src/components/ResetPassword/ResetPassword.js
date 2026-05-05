import React, { useState } from "react";
import axios from "axios";
import Nav from "../Nav/Nav"; // Optional: Add navbar if you want
import {useNavigate,useParams } from "react-router-dom";

function ResetPassword() {
   const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const {id,token} = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/reset-password/${id}/${token}`, { password });

      if (res.data.status === "Ok") {  
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/log"), 2000); // redirect after 2 sec
      } else {
        setMessage(res.data.message || "Error resetting password");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };
  return (
    <>
      <Nav /> {/* Optional navbar */}
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow" style={{ backgroundColor: "#f8f9fa" }}>
              <div className="card-body">
                <h2 className="text-center mb-4">Reset Password</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">
                    Update
                    </button>
                  </div>
                </form>
                {message && <p className="mt-3 text-center text-success">{message}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default ResetPassword;
