import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import ProductViewer from './components/ProductViewer'; 
import ProductPage from './pages/ProductPage'; 
import Cart from './components/Cart/Cart'; 
import AddProduct from './components/ProductDetails/addProduct'; 
import UpdateProduct from './components/ProductDetails/Updateproduct';
import AdminProduct from './components/ProductDetails/adminProduct'; 
import FeedbackPage from './pages/FeedbackPage';
import RatingsPage from './pages/RatingsPage';
import PromotionsPage from './pages/PromotionsPage';
import DiscountsPage from './pages/DiscountsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import Profile from './components/Profile/Profile';
import Dashboard from './components/Dashboard/Dashboard';
import DashboardArtisan from './components/Dashboard/DashboardArtisan';
import DashboardUser from './components/Dashboard/DashboardUser';

import AboutUs from './components/AboutUs'
import Contact from  './components/Contact'

// Delivery Imports
import Track from './pages/Track'
import Deliveries from './pages/Deliveries'
import MyDeliveries from './pages/MyDeliveries'
import Orders from './pages/Orders';

// ✅ USER MANAGEMENT IMPORTS
import UserDetails from './components/UserDetails/UserDetails';
import UserCDetails from './components/UserDetails/UserCDetails';
import AddUser from './components/AddUser/AddUser';
import UpdateUser from './components/UpdateUser/UpdateUser';
import UpdateUserC from './components/UpdateUser/UpdateUserC';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';

// ✅ PAYMENT MANAGEMENT IMPORTS
import AddTransaction from "./components/AddTransaction/AddTransaction"; 
import DisplayTransactions from "./components/ManageTransactions/DisplayTransactions";
import UpdateTransaction from "./components/UpdateTransaction/UpdateTransaction";
import ViewTransaction from "./components/ViewTransaction/ViewTransaction";
import BillForm from "./components/Payment/BillForm";
import PaymentForm from "./components/Payment/PaymentForm";
import PaymentPage from "./components/Payment/PaymentPage";
import MyPayments from "./components/Payment/MyPayments";
import ManageRefund from "./components/Payment/ManageRefund";

import './App.css';

// 🎯 Wrapper component for DiscountsPage with role detection
const DiscountsPageWrapper = () => {
  const userRole = localStorage.getItem('userRole') || 'customer';
  return <DiscountsPage userRole={userRole} />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              {/* ========== PUBLIC ROUTES ========== */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              {/* ========== PRODUCT ROUTES (More specific first) ========== */}
              <Route path="/addproduct" element={<AddProduct />} />
              <Route path="/Updateproduct/:id" element={<UpdateProduct />} />
              <Route path="/admin/products" element={<AdminProduct />} />
              <Route path="/products/:id" element={<ProductPage />} />
              <Route path="/products" element={<ProductViewer />} />
              <Route path="/cart" element={<Cart />} />
              
              {/* ========== DASHBOARD ROUTES ========== */}
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/artisan/dashboard" element={<DashboardArtisan />} />
              <Route path="/user/dashboard" element={<DashboardUser />} />
              
              {/* ========== USER MANAGEMENT ROUTES ========== */}
              <Route path="/addUser" element={<AddUser />} />
              <Route path="/userdetails/:id" element={<UpdateUser />} />
              <Route path="/userdetails" element={<UserDetails />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* ========== CUSTOMER MANAGEMENT ROUTES ========== */}
              <Route path="/usercdetails/:id" element={<UpdateUserC />} />
              <Route path="/usercdetails" element={<UserCDetails />} />
              
              {/* ========== CUSTOMER SERVICE ROUTES ========== */}
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/ratings" element={<RatingsPage />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/discounts" element={<DiscountsPageWrapper />} />
              <Route path="/complaints" element={<ComplaintsPage />} />
              <Route path="/profile" element={<Profile />} />

              {/* ========== PAYMENT & TRANSACTION ROUTES (Specific first) ========== */}
              <Route path="/add-transaction" element={<AddTransaction />} />
              <Route path="/display-Transactions/:id" element={<UpdateTransaction />} />
              <Route path="/display-Transactions" element={<DisplayTransactions />} />
              <Route path="/view-transaction/:id" element={<ViewTransaction />} />
              <Route path="/generate-bill" element={<BillForm />} />
              <Route path="/paymentform" element={<PaymentForm />} />
              
              {/* ========== PAYMENT PROCESSING ROUTES ========== */}
              {/* 🔥 PAYMENT FORM - Single Product (Buy Now) or Multiple Products (Cart Checkout) */}
              <Route path="/make-payment/:orderId" element={<PaymentPage />} />
              
              {/* ========== USER PAYMENT HISTORY & REFUND ROUTES ========== */}
              {/* 💳 MY PAYMENTS - View payment history and request refunds */}
              <Route path="/payments/user/:userId" element={<MyPayments />} />
              <Route path="/my-payments" element={<MyPayments />} />
              <Route path="/payment-history" element={<MyPayments />} />
              
              {/* ========== ADMIN REFUND MANAGEMENT ROUTES ========== */}
              {/* 🔍 MANAGE REFUNDS - Admin only: Approve/Reject refund requests */}
              <Route path="/manage-refund" element={<ManageRefund />} />
              <Route path="/admin/refunds" element={<ManageRefund />} />
              <Route path="/refund-management" element={<ManageRefund />} />

              {/* ========== ORDER ROUTES (Specific first) ========== */}
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/my-orders" element={<Orders />} />
              <Route path="/orders" element={<Orders />} />

              {/* ========== DELIVERY ROUTES (Most specific first) ========== */}
              <Route path="/track/:orderId" element={<Track />} />
              <Route path="/admin/deliveries" element={<Deliveries />} />
              <Route path="/my-deliveries" element={<MyDeliveries />} />

              {/* ========== ABOUT & CONTACT ROUTES ========== */}
              <Route path="/about" element={<AboutUs />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/contact-us" element={<Contact />} />
              
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;