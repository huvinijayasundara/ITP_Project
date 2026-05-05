const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getComplaintByTicketRef,
  updateComplaint,
  deleteComplaint,
  resolveComplaint,
  getComplaintStatistics,
  getComplaintsByAdmin
} = require("../Controllers/complaintController");

// POST /api/complaints - Create new complaint
router.post("/", createComplaint);

// GET /api/complaints - Get all complaints with filtering and pagination
router.get("/", getAllComplaints);

// GET /api/complaints/stats - Get complaint statistics
router.get("/stats", getComplaintStatistics);

// GET /api/complaints/admin/:adminName - Get complaints assigned to specific admin
router.get("/admin/:adminName", getComplaintsByAdmin);

// GET /api/complaints/ticket/:ticketRef - Get complaint by ticket reference
router.get("/ticket/:ticketRef", getComplaintByTicketRef);

// GET /api/complaints/:id - Get single complaint by ID
router.get("/:id", getComplaintById);

// PUT /api/complaints/:id - Update complaint
router.put("/:id", updateComplaint);

// PUT /api/complaints/:id/resolve - Resolve complaint with solution
router.put("/:id/resolve", resolveComplaint);

// DELETE /api/complaints/:id - Delete complaint
router.delete("/:id", deleteComplaint);

module.exports = router;