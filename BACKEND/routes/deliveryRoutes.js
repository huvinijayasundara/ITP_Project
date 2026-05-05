// routes/deliveryRoutes.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const deliveryController = require('../Controllers/deliveryController');
const { adminOnly } = require('../Middleware/auth');

// =====================================================
// SPECIAL ROUTES (Must be BEFORE generic routes)
// =====================================================

// ✅ Get all delivery persons (admin only)
router.get('/persons/all', adminOnly, deliveryController.getAllDeliveryPersons);

// ✅ Get recent paid orders without delivery (admin only)
router.get('/orders/recent', adminOnly, deliveryController.getRecentPaidOrders);

// ✅ Track order by orderId
router.get('/track/:orderId', deliveryController.track);

// ✅ Generate tracking PDF
router.get('/track/:orderId/pdf', deliveryController.trackPdf);

// ✅ Generate delivery report PDF
router.get('/report.pdf', adminOnly, deliveryController.reportPdf);

// =====================================================
// CRUD ROUTES
// =====================================================

// Create delivery assignment
router.post('/', adminOnly, deliveryController.assign);

// Get all deliveries (with filters)
router.get('/', deliveryController.list);

// Get delivery by ID
router.get('/:id', deliveryController.getById);

// Update delivery metadata (ETA, notes)
router.patch('/:id', adminOnly, deliveryController.updateMeta);

// Reassign delivery person
router.patch('/:id/reassign', adminOnly, deliveryController.reassign);

// Update delivery status
router.patch('/:id/status', deliveryController.updateStatus);

// Delete delivery
router.delete('/:id', adminOnly, deliveryController.remove);

module.exports = router;