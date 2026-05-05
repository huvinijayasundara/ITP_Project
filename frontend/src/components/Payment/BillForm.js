import React, { useState } from "react";
import axios from "axios";

const BillForm = () => {
  const [billData, setBillData] = useState({
    invoiceNumber: "",
    customerName: "",
    email: "",
    address: "",
    paymentMethod: "Cash on Delivery",
    billDate: "",
    billTime: "",
    items: [
      { name: "", quantity: 1, price: 0 }
    ],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Handle input changes for billData fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle change for items array
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...billData.items];
    newItems[index][name] = name === "name" ? value : Number(value);
    setBillData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  // Add new item input
  const addItem = () => {
    setBillData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: 0 }],
    }));
  };

  // Remove item input
  const removeItem = (index) => {
    const newItems = billData.items.filter((_, i) => i !== index);
    setBillData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  // On form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Add current date/time if empty
    const now = new Date();
    const billDate = billData.billDate || now.toISOString().split("T")[0]; // yyyy-mm-dd
    const billTime = billData.billTime || now.toTimeString().slice(0, 8); // HH:mm:ss

    try {
      const payload = { ...billData, billDate, billTime };
      // Don't send totalAmount; backend auto-calculates it

      await axios.post("http://localhost:5000/bills/generate-bill", payload);

      setMessage("Bill generated and emailed successfully!");
      // Reset form (optional)
      setBillData({
        invoiceNumber: "",
        customerName: "",
        email: "",
        address: "",
        paymentMethod: "Cash on Delivery",
        billDate: "",
        billTime: "",
        items: [{ name: "", quantity: 1, price: 0 }],
      });
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Failed to generate bill. Please try again."
      );
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Generate Bill</h2>
      <form onSubmit={handleSubmit}>

        <label>
          Invoice Number:<br />
          <input
            type="text"
            name="invoiceNumber"
            value={billData.invoiceNumber}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Customer Name:<br />
          <input
            type="text"
            name="customerName"
            value={billData.customerName}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Email:<br />
          <input
            type="email"
            name="email"
            value={billData.email}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Address:<br />
          <textarea
            name="address"
            value={billData.address}
            onChange={handleChange}
            required
            rows={3}
          />
        </label>
        <br />

        <label>
          Payment Method:<br />
          <select
            name="paymentMethod"
            value={billData.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="Bank Slip Upload">Bank Slip Upload</option>
          </select>
        </label>
        <br />

        <label>
          Bill Date:<br />
          <input
            type="date"
            name="billDate"
            value={billData.billDate}
            onChange={handleChange}
          />
        </label>
        <br />

        <label>
          Bill Time:<br />
          <input
            type="time"
            name="billTime"
            value={billData.billTime}
            onChange={handleChange}
          />
        </label>
        <br />

        <h3>Items</h3>
        {billData.items.map((item, index) => (
          <div key={index} style={{ marginBottom: 10, border: "1px solid #ddd", padding: 10, borderRadius: 4 }}>
            <label>
              Name:<br />
              <input
                type="text"
                name="name"
                value={item.name}
                onChange={(e) => handleItemChange(index, e)}
                required
              />
            </label>
            <br />

            <label>
              Quantity:<br />
              <input
                type="number"
                name="quantity"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, e)}
                required
              />
            </label>
            <br />

            <label>
              Price:<br />
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) => handleItemChange(index, e)}
                required
              />
            </label>
            <br />

            {billData.items.length > 1 && (
              <button type="button" onClick={() => removeItem(index)} style={{ marginTop: 6, color: "red" }}>
                Remove Item
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addItem} style={{ marginBottom: 10 }}>
          Add Item
        </button>
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Bill"}
        </button>
      </form>

      {message && <p style={{ marginTop: 20, fontWeight: "bold" }}>{message}</p>}
    </div>
  );
};

export default BillForm;
