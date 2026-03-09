import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRouter.jsx';
import Loader from './components/Loader.jsx';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const AllProducts = lazy(() => import('./pages/AllProducts'));
const Wishlist = lazy(() => import('./pages/WishList'));
const Cart = lazy(() => import('./pages/Cart'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const Signup = lazy(() => import('./pages/Authentication/Singup'));
const Login = lazy(() => import('./pages/Authentication/Login'));
const Auth = lazy(() => import('./pages/Authentication/Auth'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Payment = lazy(() => import('./pages/Payment.jsx'));
const Orders = lazy(() => import("./pages/Orders.jsx"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Admin = lazy(() => import('./Admin/Admin.jsx'));

// Layout that includes the navbar
function MainLayout() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Loader />}>
        <Outlet /> {/* renders the nested route */}
      </Suspense>
    </>
  );
}

// Layout without navbar (for auth/admin)
function BlankLayout() {
  return (
    <Suspense fallback={<Loader />}>
      <Outlet />
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <Routes>

        {/* ---------- Main layout with Navbar ---------- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }/>
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }/>
          <Route path="/productpage/:id" element={<ProductPage />} />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/payment" element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
        </Route>

        {/* ---------- Layout without Navbar ---------- */}
        <Route element={<BlankLayout />}>
          <Route path="/auth" element={<Auth />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }/>
        </Route>

      </Routes>
    </Router>
  )
}

export default App;
