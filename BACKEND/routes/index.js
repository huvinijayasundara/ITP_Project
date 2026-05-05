const router = require('express').Router();
const { auth, requireRole } = require('../Middleware/auth');
const { handleValidation } = require('../validators');
const schemas = require('../validators/schemas');

const authCtrl = require('../Controllers/authController');
const orderCtrl = require('../Controllers/orderController');
const deliveryCtrl = require('../Controllers/deliveryController');
const deliveryPersonCtrl = require('../Controllers/deliveryPersonController');
const User = require('../models/Register');
const Product = require('../models/product_model');
const Order = require('../models/OrderModel');

// Auth
router.post('/auth/register', schemas.registerValidator, handleValidation, authCtrl.register);
router.post('/auth/login', schemas.loginValidator, handleValidation, authCtrl.login);
router.get('/auth/me', auth, authCtrl.me);

// Orders
router.post('/orders', auth, requireRole('customer', 'admin'), schemas.createOrderValidator, handleValidation, orderCtrl.createPaidOrder);
router.get('/orders', auth, requireRole('customer', 'admin'), orderCtrl.listOrders);

// Deliveries
router.post('/deliveries/assign', auth, requireRole('admin'), schemas.assignDeliveryValidator, handleValidation, deliveryCtrl.assign);
// Alias: also allow POST /deliveries to create an assignment
router.post('/deliveries', auth, requireRole('admin'), schemas.assignDeliveryValidator, handleValidation, deliveryCtrl.assign);
router.patch('/deliveries/:id/reassign', auth, requireRole('admin'), schemas.reassignValidator, handleValidation, deliveryCtrl.reassign);
router.patch('/deliveries/:id/status', auth, requireRole('admin', 'delivery'), schemas.updateStatusValidator, handleValidation, deliveryCtrl.updateStatus);
router.patch('/deliveries/:id', auth, requireRole('admin'), schemas.updateMetaValidator, handleValidation, deliveryCtrl.updateMeta);
router.get('/deliveries/:id', auth, requireRole('admin', 'customer', 'delivery'), deliveryCtrl.getById);
router.get('/deliveries', auth, requireRole('admin', 'customer', 'delivery'), schemas.listDeliveriesValidator, handleValidation, deliveryCtrl.list);
router.delete('/deliveries/:id', auth, requireRole('admin'), deliveryCtrl.remove);
router.get('/track/:orderId', auth, requireRole('admin', 'customer', 'delivery'), schemas.trackParamValidator, handleValidation, deliveryCtrl.track);
router.get('/track/:orderId/report.pdf', auth, requireRole('admin', 'customer', 'delivery'), schemas.trackParamValidator, handleValidation, deliveryCtrl.trackPdf);
router.get('/deliveries/report.pdf', auth, requireRole('admin'), deliveryCtrl.reportPdf);

// Delivery person resolver (admin only)
router.get('/delivery-person/resolve', auth, requireRole('admin'), deliveryPersonCtrl.resolveByEmail);

// Utility lists
router.get('/delivery-persons', auth, requireRole('admin'), async (req, res, next) => {
	try {
		const users = await User.find({ role: 'delivery', isActive: true }).select('_id name email');
		res.json(users);
	} catch (e) { next(e) }
});

router.get('/products', auth, requireRole('admin', 'customer'), async (req, res, next) => {
	try {
		const prods = await Product.find({ isActive: true }).select('_id sku name price');
		res.json(prods);
	} catch (e) { next(e) }
});

// Recent paid orders (admin only, for selection)
router.get('/orders/recent', auth, requireRole('admin'), async (req, res, next) => {
	try {
		const orders = await Order.find({ status: 'paid' }).sort({ createdAt: -1 }).limit(20).select('_id totalAmount createdAt');
		res.json(orders);
	} catch (e) { next(e) }
});

module.exports = router;
