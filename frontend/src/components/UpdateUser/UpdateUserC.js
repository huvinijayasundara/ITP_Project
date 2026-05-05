import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from "../Navbar";
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function UpdateUserC() {
  const [inputs, setInputs] = useState({
    name: '',
    gmail: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch user data by ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/userc/${id}`);
        if (res.data.userc) {
          setInputs({
            name: res.data.userc.name || '',
            gmail: res.data.userc.gmail || '',
            phoneNumber: res.data.userc.phoneNumber || ''
          });
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // Validation function
  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!inputs.name.trim()) newErrors.name = "Name is required";
    else if (!/^[A-Za-z\s]+$/.test(inputs.name))
      newErrors.name = "Name can only contain letters and spaces";

    // Email validation
    if (!inputs.gmail.trim()) newErrors.gmail = "Email is required";
    else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(inputs.gmail)
    )
      newErrors.gmail = "Invalid email format";

    // Phone number validation
    if (!inputs.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if (!/^\d{10}$/.test(inputs.phoneNumber))
      newErrors.phoneNumber = "Phone number must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update user request
  const sendRequest = async () => {
    try {
      await axios.put(`http://localhost:5000/userc/${id}`, {
        name: inputs.name,
        gmail: inputs.gmail,
        phoneNumber: inputs.phoneNumber
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update user.');
    }
  };

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      sendRequest().then(() => {
        alert('User updated successfully!');
        navigate('/usercdetails');
      });
    }
  };

  if (loading) return <p>Loading user data...</p>;

  return (
    <>
      <Nav />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow" style={{ backgroundColor: "#f8f9fa" }}>
              <div className="card-body">
                <h2 className="text-center mb-4">Update User</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Name:</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      value={inputs.name}
                      onChange={handleChange}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email:</label>
                    <input
                      type="email"
                      name="gmail"
                      className={`form-control ${errors.gmail ? 'is-invalid' : ''}`}
                      value={inputs.gmail}
                      onChange={handleChange}
                    />
                    {errors.gmail && <div className="invalid-feedback">{errors.gmail}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone Number:</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                      value={inputs.phoneNumber}
                      onChange={handleChange}
                    />
                    {errors.phoneNumber && (
                      <div className="invalid-feedback">{errors.phoneNumber}</div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mt-3">
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UpdateUserC;
