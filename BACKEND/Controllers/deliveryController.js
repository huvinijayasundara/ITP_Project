const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');
const Order = require('../models/OrderModel');
const User = require('../models/Register');

const allowedTransitions = {
  'assigned': ['out-for-delivery', 'cancelled'],
  'out-for-delivery': ['delivered', 'cancelled'],
  'delivered': [],
  'cancelled': [],
};

async function validateDeliveryPerson(deliveryPersonId) {
  const user = await User.findById(deliveryPersonId);
  if (!user) throw Object.assign(new Error('Delivery person not found'), { status: 400 });
  if (user.role !== 'delivery') throw Object.assign(new Error('User is not a delivery person'), { status: 400 });
  if (!user.isActive) throw Object.assign(new Error('Delivery person is inactive'), { status: 400 });
  const activeCount = await Delivery.countDocuments({ deliveryPerson: user._id, status: { $in: ['assigned', 'out-for-delivery'] } });
  if (activeCount >= user.deliveryCapacity) throw Object.assign(new Error('Delivery person capacity reached'), { status: 400 });
  return user;
}

// =====================================================
// NEW METHODS FOR ADMIN
// =====================================================

// ✅ Get all delivery persons
exports.getAllDeliveryPersons = async (req, res, next) => {
  try {
    console.log('👥 Fetching all delivery persons');
    
    // Find all users with 'delivery' role
    const deliveryPersons = await User.find({ 
      role: 'delivery'
    }).select('name email phoneNumber isActive deliveryCapacity');
    
    console.log(`✅ Found ${deliveryPersons.length} delivery persons`);
    
    res.json(deliveryPersons);
  } catch (e) {
    console.error('❌ Error fetching delivery persons:', e);
    next(e);
  }
};

// ✅ Get recent paid orders without delivery assignment
exports.getRecentPaidOrders = async (req, res, next) => {
  try {
    console.log('📦 Fetching recent paid orders for delivery assignment');
    
    // Find paid orders
    const paidOrders = await Order.find({ 
      $or: [
        { status: 'paid' },
        { status: 'Paid' },
        { isPaid: true }
      ]
    })
    .populate('userId', 'name email phoneNumber')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
    
    console.log(`📋 Found ${paidOrders.length} paid orders`);
    
    // Get all order IDs that already have delivery assignments
    const orderIds = paidOrders.map(o => o._id);
    const existingDeliveries = await Delivery.find({ 
      order: { $in: orderIds } 
    }).select('order');
    
    const assignedOrderIds = new Set(
      existingDeliveries.map(d => d.order.toString())
    );
    
    // Filter out orders that already have delivery
    const availableOrders = paidOrders.filter(
      o => !assignedOrderIds.has(o._id.toString())
    );
    
    console.log(`✅ ${availableOrders.length} orders available for delivery assignment`);
    console.log(`🚫 ${assignedOrderIds.size} orders already have delivery assigned`);
    
    res.json(availableOrders);
  } catch (e) {
    console.error('❌ Error fetching recent orders:', e);
    res.status(500).json({ 
      message: 'Failed to fetch recent orders',
      error: e.message 
    });
  }
};

// =====================================================
// EXISTING CRUD METHODS
// =====================================================

exports.assign = async (req, res, next) => {
  try {
    const { orderId, deliveryPersonId, eta, notes } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.isPaid || order.status !== 'paid') return res.status(400).json({ message: 'Only paid orders can be assigned' });
    
    // ✅ FIX: Check both customer and userId fields
    const orderUserId = order.customer || order.userId;
    if (!orderUserId) return res.status(400).json({ message: 'Order has no customer' });
    
    await validateDeliveryPerson(deliveryPersonId);
    const existing = await Delivery.findOne({ order: order._id });
    if (existing) return res.status(400).json({ message: 'Delivery already exists for this order' });
    
    const delivery = await Delivery.create({
      order: order._id,
      deliveryPerson: deliveryPersonId,
      eta: eta ? new Date(eta) : undefined,
      notes,
      status: 'assigned',
      statusHistory: [{ status: 'assigned', note: 'Assigned', updatedBy: req.user._id }],
    });
    res.status(201).json(await delivery.populate([{ path: 'order' }, { path: 'deliveryPerson', select: 'name email' }]));
  } catch (e) {
    next(e);
  }
};

exports.reassign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliveryPersonId, note } = req.body;
    const delivery = await Delivery.findById(id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    await validateDeliveryPerson(deliveryPersonId);
    delivery.deliveryPerson = deliveryPersonId;
    delivery.statusHistory.push({ status: delivery.status, note: `Reassigned: ${note || ''}`.trim(), updatedBy: req.user._id });
    await delivery.save();
    res.json(await delivery.populate([{ path: 'order' }, { path: 'deliveryPerson', select: 'name email' }]));
  } catch (e) {
    next(e);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const delivery = await Delivery.findById(id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    // Role-based: delivery person can only update their own deliveries
    if (req.user.role === 'delivery' && String(delivery.deliveryPerson) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // prevent skipping
    const allowed = allowedTransitions[delivery.status] || [];
    if (!allowed.includes(status)) return res.status(400).json({ message: `Invalid status transition from ${delivery.status} to ${status}` });
    delivery.status = status;
    if (status === 'delivered') delivery.deliveredAt = new Date();
    delivery.statusHistory.push({ status, note, updatedBy: req.user._id });
    await delivery.save();
    res.json(await delivery.populate([{ path: 'order' }, { path: 'deliveryPerson', select: 'name email' }]));
  } catch (e) {
    next(e);
  }
};

exports.updateMeta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { eta, notes } = req.body;
    const delivery = await Delivery.findById(id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    if (typeof eta !== 'undefined') delivery.eta = eta ? new Date(eta) : null;
    if (typeof notes !== 'undefined') delivery.notes = notes;
    await delivery.save();
    res.json(await delivery.populate([{ path: 'order' }, { path: 'deliveryPerson', select: 'name email' }]));
  } catch (e) {
    next(e);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id).populate([{ path: 'order' }, { path: 'deliveryPerson', select: 'name email' }]);
    if (!delivery) return res.status(404).json({ message: 'Not found' });
    
    // ✅ FIX: Check both customer and userId fields
    const orderUserId = delivery.order.customer || delivery.order.userId;
    
    // customer can only view their own order's delivery
    if ((req.user.role === 'customer' || req.user.role === 'user') && String(orderUserId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(delivery);
  } catch (e) {
    next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { status, orderId, deliveryPersonId, from, to, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (orderId) filter.order = orderId;
    if (deliveryPersonId) filter.deliveryPerson = deliveryPersonId;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    // role scoping
    if (req.user.role === 'delivery') filter.deliveryPerson = req.user._id;
    if (req.user.role === 'user' || req.user.role === 'customer') {
      // ✅ FIX: Check both customer and userId fields
      const customerOrders = await Order.find({ 
        $or: [
          { customer: req.user._id },
          { userId: req.user._id }
        ]
      }).select('_id');
      filter.order = { $in: customerOrders.map((o) => o._id) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Delivery.find(filter)
        .populate([{ path: 'order' }, { path: 'deliveryPerson', select: 'name email' }])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Delivery.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const delivery = await Delivery.findById(id).populate('order');
    if (!delivery) return res.status(404).json({ message: 'Not found' });
    // only admin can delete
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await Delivery.deleteOne({ _id: id });
    res.json({ message: 'Delivery record deleted', reason: reason || undefined });
  } catch (e) {
    next(e);
  }
};

exports.track = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    console.log('🔍 Tracking order:', orderId);
    console.log('👤 User:', req.user.name, '- Role:', req.user.role);
    
    const delivery = await Delivery.findOne({ order: orderId })
      .populate([
        { path: 'order' },
        { path: 'deliveryPerson', select: 'name email' }
      ]);
      
    if (!delivery) {
      console.log('❌ No delivery found for order:', orderId);
      return res.status(404).json({ message: 'Tracking not found' });
    }
    
    console.log('✅ Delivery found:', delivery._id);
    
    // ✅ FIX: Check both customer and userId fields
    const orderUserId = delivery.order.customer || delivery.order.userId;
    console.log('📦 Order User ID:', orderUserId);
    
    // Permissions: admin can view; delivery can view if assigned; customer only their own order
    if (req.user.role === 'admin') {
      console.log('✅ Admin access granted');
    } else if (req.user.role === 'delivery') {
      if (String(delivery.deliveryPerson?._id || delivery.deliveryPerson) !== String(req.user._id)) {
        console.log('❌ Delivery person mismatch');
        return res.status(403).json({ message: 'Forbidden' });
      }
      console.log('✅ Delivery person access granted');
    } else if (req.user.role === 'user' || req.user.role === 'customer') {
      if (String(orderUserId) !== String(req.user._id)) {
        console.log('❌ Customer mismatch - Order User:', orderUserId, 'Request User:', req.user._id);
        return res.status(403).json({ message: 'Forbidden' });
      }
      console.log('✅ Customer access granted');
    } else {
      console.log('❌ Unknown role:', req.user.role);
      return res.status(403).json({ message: 'Forbidden' });
    }

    console.log('✅ Sending tracking data');
    res.json({
      deliveryId: delivery._id,
      order: {
        _id: delivery.order._id,
        totalAmount: delivery.order.totalAmount,
        deliveryAddress: delivery.order.deliveryAddress,
        contactPhone: delivery.order.contactPhone,
        createdAt: delivery.order.createdAt,
      },
      deliveryPerson: delivery.deliveryPerson ? { 
        _id: delivery.deliveryPerson._id, 
        name: delivery.deliveryPerson.name, 
        email: delivery.deliveryPerson.email 
      } : null,
      status: delivery.status,
      eta: delivery.eta,
      deliveredAt: delivery.deliveredAt,
      notes: delivery.notes || '',
      history: delivery.statusHistory,
    });
  } catch (e) {
    console.error('❌ Track error:', e);
    next(e);
  }
};

exports.trackPdf = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const delivery = await Delivery.findOne({ order: orderId })
      .populate([
        { path: 'order' },
        { path: 'deliveryPerson', select: 'name email' }
      ]);
    if (!delivery) return res.status(404).json({ message: 'Tracking not found' });
    
    // ✅ FIX: Check both customer and userId fields
    const orderUserId = delivery.order.customer || delivery.order.userId;
    
    // Same permissions as track
    if (req.user.role === 'admin') {
      // allowed
    } else if (req.user.role === 'delivery') {
      if (String(delivery.deliveryPerson?._id || delivery.deliveryPerson) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (req.user.role === 'user' || req.user.role === 'customer') {
      if (String(orderUserId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="tracking_${orderId}.pdf"`);
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(18).text('Order Delivery Tracking', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`);
    doc.text(`Order ID: ${delivery.order._id}`);
    doc.text(`Status: ${delivery.status}`);
    doc.text(`ETA: ${delivery.eta ? new Date(delivery.eta).toLocaleString() : '-'}`);
    doc.text(`Delivered At: ${delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleString() : '-'}`);
    if (delivery.deliveryPerson) doc.text(`Assigned To: ${delivery.deliveryPerson.name} (${delivery.deliveryPerson.email})`);
    doc.moveDown();
    doc.fontSize(12).text('Delivery Address');
    const addr = delivery.order.deliveryAddress || {};
    doc.fontSize(10).text(`${addr.line1 || ''}`);
    if (addr.line2) doc.text(addr.line2);
    doc.text(`${addr.city || ''} ${addr.postalCode || ''}`);
    doc.text(`${addr.country || ''}`);
    if (delivery.order.contactPhone) doc.text(`Phone: ${delivery.order.contactPhone}`);

    doc.moveDown();
    doc.fontSize(12).text('Status History');
    doc.moveDown(0.5);
    doc.fontSize(10);
    (delivery.statusHistory || []).forEach((h, i) => {
      doc.text(`${i + 1}. ${h.status} ${h.note ? '- ' + h.note : ''} (${new Date(h.timestamp).toLocaleString()})`);
    });

    doc.end();
  } catch (e) {
    next(e);
  }
};

exports.reportPdf = async (req, res, next) => {
  try {
    // Reuse list filter logic without pagination
    const { status, deliveryPersonId, from, to } = req.query;
    const filter = {};
    const allowedStatuses = ['assigned', 'out-for-delivery', 'delivered', 'cancelled'];
    if (status && allowedStatuses.includes(status)) filter.status = status;
    if (deliveryPersonId && mongoose.Types.ObjectId.isValid(deliveryPersonId)) filter.deliveryPerson = deliveryPersonId;
    if (from || to) {
      const range = {};
      const fromDate = from && !isNaN(new Date(from)) ? new Date(from) : null;
      const toDateRaw = to && !isNaN(new Date(to)) ? new Date(to) : null;
      if (fromDate) range.$gte = fromDate;
      if (toDateRaw) {
        // If client sent a date-only string (YYYY-MM-DD), include the full day
        const toStr = String(to);
        const toDate = new Date(toDateRaw);
        if (/^\d{4}-\d{2}-\d{2}$/.test(toStr)) {
          toDate.setHours(23, 59, 59, 999);
        }
        range.$lte = toDate;
      }
      if (Object.keys(range).length) filter.createdAt = range;
    }
    const rows = await Delivery.find(filter)
      .populate([{ path: 'order' }, { path: 'deliveryPerson', select: 'name email' }])
      .sort({ createdAt: -1 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="deliveries_report.pdf"');
    const doc = new PDFDocument({ margin: 36 });
    doc.pipe(res);

    // Branded header
    doc.rect(0, 0, doc.page.width, 60).fill('#1f2937'); // slate-800
    doc.fill('#ffffff').fontSize(18).text('Delivery Report', 36, 20, { align: 'left' });
    doc.fontSize(10).fill('#e5e7eb').text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    // Filters summary
    doc.moveDown(1.2);
    doc.fill('#111827').fontSize(11);
    const filtersLine = [
      status ? `Status: ${status}` : null,
      deliveryPersonId ? `Delivery Person: ${deliveryPersonId}` : null,
      (from || to) ? `Date: ${from || '...'} → ${to || '...'}` : null,
    ].filter(Boolean).join('   |   ');
    if (filtersLine) {
      doc.text(filtersLine, { align: 'left' });
      doc.moveDown(0.5);
    }

    // Table headers
    const startX = 36;
    let y = 100;
    const col = (w) => w; // util
    const widths = [col(120), col(140), col(120), col(80), col(140), col(140)];
    const heads = ['Order ID', 'Customer/Phone', 'Assigned To', 'Status', 'ETA', 'Delivered'];

    doc.fill('#374151').fontSize(10);
    let x = startX;
    heads.forEach((h, i) => {
      doc.text(h, x, y, { width: widths[i], align: 'left' });
      x += widths[i] + 8;
    });
    y += 14;
    doc.moveTo(startX, y).lineTo(doc.page.width - 36, y).stroke('#e5e7eb');
    y += 8;

    // Rows
    rows.forEach((d, idx) => {
      const order = d.order || {};
      const person = d.deliveryPerson || {};
      const rowBg = idx % 2 === 0 ? '#f9fafb' : '#ffffff';
      doc.rect(startX - 6, y - 4, doc.page.width - startX - 30, 22).fillAndStroke(rowBg, rowBg);
      doc.fill('#111827');

      let cx = startX;
      doc.text(String(order._id || ''), cx, y, { width: widths[0] }); cx += widths[0] + 8;
      doc.text(`${order.customer || order.userId || ''}\n${order.contactPhone || ''}`, cx, y, { width: widths[1] }); cx += widths[1] + 8;
      doc.text(`${person.name || ''} ${person.email ? `\n(${person.email})` : ''}`, cx, y, { width: widths[2] }); cx += widths[2] + 8;
      doc.text(String(d.status || ''), cx, y, { width: widths[3] }); cx += widths[3] + 8;
      doc.text(d.eta ? new Date(d.eta).toLocaleString() : '-', cx, y, { width: widths[4] }); cx += widths[4] + 8;
      doc.text(d.deliveredAt ? new Date(d.deliveredAt).toLocaleString() : '-', cx, y, { width: widths[5] });
      y += 26;

      // New page if needed
      if (y > doc.page.height - 72) {
        doc.addPage();
        y = 60;
      }
    });

    // Footer
    doc.fill('#6b7280').fontSize(9).text(`Total deliveries: ${rows.length}`, 36, doc.page.height - 36, { align: 'left' });

    doc.end();
  } catch (e) {
    next(e);
  }
};