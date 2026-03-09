import React, { useContext, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShieldCheck, User, ShoppingBag } from "lucide-react";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

import {
  removeFromCart,
  updateCartQuantity
} from "../services/cartService";

const Cart = () => {

  const { user, cart, setCart, loading } = useContext(UserContext);
  const navigate = useNavigate();





  // INCREASE QUANTITY
  const increaseQty = async (productId, quantity) => {

    const newQty = quantity + 1;

    try {

      await updateCartQuantity(productId, newQty);

      setCart(prev =>
        prev.map(item =>
          item._id === productId
            ? { ...item, quantity: newQty }
            : item
        )
      );

    } catch (error) {
      // Quiet fail or handle error gracefully
    }

  };



  // DECREASE QUANTITY
  const decreaseQty = async (productId, quantity) => {

    const newQty = Math.max(1, quantity - 1);

    try {

      await updateCartQuantity(productId, newQty);

      setCart(prev =>
        prev.map(item =>
          item._id === productId
            ? { ...item, quantity: newQty }
            : item
        )
      );

    } catch (error) {
      // Quiet fail or handle error gracefully
    }

  };



  // REMOVE ITEM
  const removeItem = async (productId) => {

    try {

      await removeFromCart(productId);

      setCart(prev =>
        prev.filter(item => item._id !== productId)
      );

    } catch (error) {
      // Quiet fail or handle error gracefully
    }

  };



  // TOTAL CALCULATION
  const subtotal = cart.reduce((sum, item) => {

    const price = Number(item.currentPrice || item.price || 0);
    const quantity = item.quantity || 1;

    return sum + price * quantity;

  }, 0);

  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;



  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-yellow-600" />
          </div>
          <p className="text-gray-800 text-2xl font-bold mb-4">You're not logged in</p>
          <p className="text-gray-600 mb-8">Please login to view and manage your shopping cart.</p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg transform hover:scale-105"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Your Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* CART ITEMS */}
            <div className="lg:col-span-2 space-y-5">
              {cart.map(item => (
                <div
                  key={item._id}
                  className="group flex flex-row p-4 sm:p-6 gap-4 sm:gap-6 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative"
                >
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    className="w-24 h-24 sm:w-36 sm:h-36 object-cover rounded-xl sm:rounded-2xl shadow-sm border border-gray-50 flex-shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="pr-1 sm:pr-8 mb-2 sm:mb-4">
                      <h2 className="font-bold text-base sm:text-xl text-gray-900 line-clamp-2 leading-tight mb-1 sm:mb-2 text-left">
                        {item.name || item.title}
                      </h2>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {item.description|| "No description available"}
                      </p>
                      <p className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent text-left">
                        ₹{(item.price || item.currentPrice).toLocaleString("en-IN")}
                      </p>
                      
                    </div>

                    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 mt-auto">
                      {/* QUANTITY CONTROLS */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 border border-gray-200 shadow-inner">
                        <button
                          onClick={() => decreaseQty(item._id, item.quantity)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-colors border border-gray-100"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>

                        <span className="font-bold w-6 text-center text-gray-800 text-sm sm:text-base">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => increaseQty(item._id, item.quantity)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-colors border border-gray-100"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                      
                      {/* Mobile Remove Button */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="sm:hidden flex items-center gap-1 py-1.5 px-3 rounded-lg border border-gray-200 bg-white text-sm text-red-500 font-medium hover:bg-red-50 shadow-sm"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Desktop Remove Button (top right) */}
                  <button
                    onClick={() => removeItem(item._id)}
                    className="hidden sm:flex absolute right-6 top-6 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-gray-900">₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">Tax included.</p>
                </div>

                <button
                  onClick={() => navigate("/payment")}
                  className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <ShieldCheck size={16} className="text-green-500" />
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="w-32 h-32 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
        <ShoppingCart size={64} className="text-amber-500" />
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-3 text-center">Your cart is empty</h2>
      <p className="text-gray-500 mb-8 max-w-sm text-center">Looks like you haven't added anything to your cart yet. Discover our latest products and start shopping!</p>
      <button
        onClick={() => navigate("/")}
        className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
      >
        <ShoppingBag size={20} />
        Start Shopping
      </button>
    </div>
  );
};

export default Cart;