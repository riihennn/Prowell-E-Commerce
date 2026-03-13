import React, { useContext, useState } from "react";
import { Trash2, ShoppingCart, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { removeFromWishlist } from "../services/wishlistService";
import { addToCart } from "../services/cartService";
import Loader from "../components/Loader";

const EmptyWishlist = ({ navigate }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100 backdrop-blur-sm">
    <div className="relative mb-8">
      <div className="w-32 h-32 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center">
        <ShoppingCart className="w-16 h-16 text-[#ffbe00]" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
        <Sparkles className="w-4 h-4 text-yellow-600" />
      </div>
    </div>

    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
      Your wishlist is empty
    </h2>

    <p className="text-gray-500 text-center mb-8 max-w-md px-4">
      Discover amazing products and save your favorites! Click the heart icon on
      any product to add it here.
    </p>

    <button
      onClick={() => navigate("/")}
      className="group bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
    >
      Start Shopping
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

// ✅ Wishlist Items Component (each card has its own "Add to Cart" and "Remove" button)
const WishlistItems = ({ items, onRemove, onAddToCart, removingId }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {items.map((item) => (
      <div
        key={item._id}
        className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
          removingId === item._id ? "scale-95 opacity-50" : "hover:scale-105"
        }`}
      >
        <div className="relative overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="ml-10 w-50 h-50 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <button
            onClick={() => onRemove(item._id)}
            className="absolute top-3 right-3 w-8 h-8 text-gray-400 bg-white rounded-lg  flex items-center justify-center hover:bg-gray-100 hover:text-gray-500 transition-colors"
          >
           <Trash2 size={18} />
          </button>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1  transition-colors">
            {item.name}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {item.description|| "No description available"}
          </p>

          <div className="flex items-baseline gap-2 mb-4 flex-wrap">
            <span className="text-xl font-bold text-gray-900">
              ₹
              {typeof item.price === "string"
                ? item.price
                : item.price?.toLocaleString("en-IN")}
            </span>
            {item.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹
                {typeof item.originalPrice === "string"
                  ? item.originalPrice
                  : item.originalPrice?.toLocaleString("en-IN")}
              </span>
            )}
            {item.discount && (
              <span className="text-sm font-semibold text-green-600">
                {item.discount}
              </span>
            )}
          </div>

          {/* ✅ Add to Cart Button (individual) */}
          <button
            onClick={() => onAddToCart(item)}
            className="w-full flex items-center justify-center gap-2 bg-[#ffbe00] hover:bg-yellow-500 text-black px-4 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md"
          >
            <ShoppingCart size={18} />
            Add to Cart
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
    
    // Update local state immediately
    const updatedWishlist = wishlist.filter(item => item._id !== id);
    setWishlist(updatedWishlist);
    
    try {
      await removeFromWishlist(id);
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      // Revert if API fails
      setWishlist(wishlist);
    }
    
    setTimeout(() => {
      setRemovingId(null);
    }, 300);
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
        ? cart.map((i) =>
            i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...cart, { ...item, quantity: 1 }];

      setCart(updatedCart);

      // Remove from wishlist after adding to cart
      const updatedWishlist = wishlist.filter(wItem => wItem._id !== item._id);
      setWishlist(updatedWishlist);
      await removeFromWishlist(item._id);
      
    } catch (err) {
      // Quiet fail or handle error gracefully
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-2 mb-6">
      <span className="w-1 h-6 sm:h-8 bg-[#ffbe00]" />
       Wishlist
    </h2>

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

            {/* ✅ Summary Box (optional, shows total price) */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Total Price ({wishlist.length} items)
                </p>
                <p className="text-3xl font-bold text-black">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
