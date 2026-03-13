import React, { useContext, useState } from "react";
import { Trash2, ShoppingCart, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { removeFromWishlist } from "../services/wishlistService";
import { addToCart } from "../services/cartService";
import Loader from "../components/Loader";

const EmptyWishlist = ({ navigate }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div className="relative mb-8">
      <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center">
        <ShoppingCart className="w-10 h-10 text-[#ffbe00]" />
      </div>
      <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#ffbe00] rounded-full flex items-center justify-center animate-bounce">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
    </div>
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
      Your wishlist is empty
    </h2>
    <p className="text-gray-400 text-sm text-center mb-8 max-w-xs px-4 leading-relaxed">
      Browse products and tap the heart icon to save your favorites here.
    </p>
    <button
      onClick={() => navigate("/")}
      className="group flex items-center gap-2 bg-[#ffbe00] hover:bg-yellow-500 text-black px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm"
    >
      Start Shopping
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
    </button>
  </div>
);

const WishlistItems = ({ items, onRemove, onAddToCart, removingId }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
    {items.map((item) => (
      <div
        key={item._id}
        className={`group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden flex flex-col transition-all duration-300 ${
          removingId === item._id ? "scale-95 opacity-40 pointer-events-none" : ""
        }`}
      >
        {/* Image Area */}
        <div className="relative bg-gray-50 flex items-center justify-center h-36 sm:h-44 md:h-48 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <button
            onClick={() => onRemove(item._id)}
            className="absolute top-2 right-2 w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 shadow-sm transition-all duration-200"
            aria-label="Remove item"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 line-clamp-1 leading-snug">
            {item.name}
          </h3>
          <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed hidden sm:block">
            {item.description || "No description available"}
          </p>

          {/* Price */}
          <div className="flex items-baseline flex-wrap gap-1 mb-3 mt-auto">
            <span className="text-sm sm:text-base font-bold text-gray-900">
              ₹{typeof item.price === "string" ? item.price : item.price?.toLocaleString("en-IN")}
            </span>
            {item.originalPrice && (
              <span className="text-xs text-gray-300 line-through">
                ₹{typeof item.originalPrice === "string" ? item.originalPrice : item.originalPrice?.toLocaleString("en-IN")}
              </span>
            )}
            {item.discount && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
                {item.discount}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={() => onAddToCart(item)}
            className="w-full flex items-center justify-center gap-1.5 bg-[#ffbe00] hover:bg-yellow-500 active:scale-95 text-black py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200"
          >
            <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    ))}
  </div>
);

const Wishlist = () => {
  const { user, cart, setCart, wishlist, setWishlist, loading } = useContext(UserContext);
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (id) => {
    setRemovingId(id);
    const updatedWishlist = wishlist.filter((item) => item._id !== id);
    setWishlist(updatedWishlist);
    try {
      await removeFromWishlist(id);
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      setWishlist(wishlist);
    }
    setTimeout(() => setRemovingId(null), 300);
  };

  const handleAddToCart = async (item) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await addToCart(item._id, 1);
      const existing = cart.find((i) => i._id === item._id);
      const updatedCart = existing
        ? cart.map((i) => (i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...cart, { ...item, quantity: 1 }];
      setCart(updatedCart);
      const updatedWishlist = wishlist.filter((wItem) => wItem._id !== item._id);
      setWishlist(updatedWishlist);
      await removeFromWishlist(item._id);
    } catch (err) {
      // Quiet fail
    }
  };

  if (loading) return <Loader />;

  const totalPrice = wishlist.reduce((acc, item) => {
    const price =
      typeof item.price === "string"
        ? parseFloat(item.price.replace(/,/g, ""))
        : item.price;
    return acc + (price || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 py-8 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-1 h-6 sm:h-7 bg-[#ffbe00] rounded-full inline-block" />
            My Wishlist
            {wishlist.length > 0 && (
              <span className="ml-1 text-sm font-medium text-gray-400 bg-white border border-gray-100 px-2.5 py-0.5 rounded-full shadow-sm">
                {wishlist.length}
              </span>
            )}
          </h2>

          {wishlist.length > 0 && (
            <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
              Total:{" "}
              <span className="font-semibold text-gray-700">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </p>
          )}
        </div>

        {wishlist.length === 0 ? (
          <EmptyWishlist navigate={navigate} />
        ) : (
          <>
            <WishlistItems
              items={wishlist}
              onRemove={handleRemove}
              onAddToCart={handleAddToCart}
              removingId={removingId}
            />

            {/* Summary Bar */}
            <div className="mt-6 sm:mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">
                  Total Estimate
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {wishlist.length} {wishlist.length === 1 ? "item" : "items"} in wishlist
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Prices updated in real-time
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;