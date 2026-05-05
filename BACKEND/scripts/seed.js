require('dotenv').config();
const { connectDB } = require('../utils/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

async function run() {
  await connectDB();
  const users = [
    { name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'admin' },
    { name: 'Customer', email: 'customer@example.com', password: 'password123', role: 'customer' },
    { name: 'Delivery One', email: 'delivery1@example.com', password: 'password123', role: 'delivery' },
    { name: 'Delivery Two', email: 'delivery2@example.com', password: 'password123', role: 'delivery' },
  ];
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log('Created user:', u.email);
    } else {
      console.log('User exists:', u.email);
    }
  }
  // Seed products
  const products = [
    { sku: 'HC-VASE-001', name: 'Handicraft Vase', price: 1500 },
    { sku: 'HC-BOWL-002', name: 'Coconut Shell Bowl', price: 800 },
    { sku: 'HC-MASK-003', name: 'Traditional Mask', price: 2500 },
  ];
  for (const p of products) {
    const exists = await Product.findOne({ sku: p.sku });
    if (!exists) {
      await Product.create(p);
      console.log('Created product:', p.sku);
    } else {
      console.log('Product exists:', p.sku);
    }
  }

  // Seed a few paid orders for the sample customer
  const customer = await User.findOne({ email: 'customer@example.com' })
  if (customer) {
    const existingOrders = await Order.countDocuments({ customer: customer._id })
    if (existingOrders === 0) {
      const prods = await Product.find({}).limit(3)
      const addr = { line1: '123 Main St', city: 'Colombo', postalCode: '10000', country: 'Sri Lanka' }
      const phone = '0771234567'
      const mkOrder = async (prod) => Order.create({
        customer: customer._id,
        items: [{ productId: String(prod._id), name: prod.name, quantity: 1, price: prod.price }],
        totalAmount: prod.price,
        isPaid: true,
        paidAt: new Date(),
        deliveryAddress: addr,
        contactPhone: phone,
        status: 'paid',
      })
      for (const p of prods) {
        const o = await mkOrder(p)
        console.log('Created paid order:', o._id.toString())
      }
    } else {
      console.log('Customer already has orders, skipping order seed')
    }
  }

  console.log('Seeding complete');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
