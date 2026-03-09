import React, { useContext, useEffect } from "react";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-600 text-lg font-medium">Please login to see your cart.</p>
          <button 
            onClick={() => navigate('/auth')}
            className="mt-4 bg-[#ffbe00] text-white px-6 py-2 rounded-lg hover:bg-[#e6ab00] transition-colors"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }



  return (

    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Shopping Cart
      </h1>


      {cart.length === 0 ? (

        <EmptyCart />

      ) : (

        <div className="flex flex-col lg:flex-row gap-6">

          {/* CART ITEMS */}
          <div className="w-full lg:w-2/3 space-y-6">

            {cart.map(item => (

              <div
                key={item._id}
                className="flex justify-between items-center p-4 bg-white rounded-lg shadow border"
              >

                <div className="flex gap-4">

                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded flex-shrink-0"
                  />

                  <div>

                    <h2 className="font-semibold text-lg">
                      {item.name || item.title}
                    </h2>

                    <p className="text-gray-600">
                      ₹{item.price || item.currentPrice}
                    </p>

                  </div>

                </div>


                {/* QUANTITY CONTROLS */}
                <div className="flex items-center gap-3">

                  <button
                    onClick={() =>
                      decreaseQty(item._id, item.quantity)
                    }
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="font-semibold">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      increaseQty(item._id, item.quantity)
                    }
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    onClick={() => removeItem(item._id)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>

                </div>

              </div>

            ))}

          </div>



          {/* ORDER SUMMARY */}
          <div className="w-full lg:w-1/3 p-4 bg-gray-100 rounded-lg h-fit">

            <h2 className="text-xl font-bold mb-4">
              Order Summary
            </h2>

            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>GST (18%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate("/payment")}
              className="w-full mt-4 bg-[#ffbe00] text-white py-3 rounded hover:bg-[#e6ab00]"
            >
              Proceed to Checkout
            </button>

          </div>

        </div>

      )}

    </div>

  );

};



const EmptyCart = () => {

  const navigate = useNavigate();

  return (

    <div className="flex flex-col items-center py-16">

      <ShoppingCart size={60} className="text-gray-400 mb-4" />

      <h2 className="text-xl font-semibold mb-2">
        Your cart is empty
      </h2>

      <button
        onClick={() => navigate("/")}
        className="bg-[#ffbe00] text-white px-6 py-3 rounded-lg hover:bg-[#e6ab00]"
      >
        Continue Shopping
      </button>

    </div>

  );

};

export default Cart;