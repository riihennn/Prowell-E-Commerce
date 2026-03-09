import { Heart, ChevronRight } from "lucide-react";
import { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { addToCart } from "../services/cartService";
import { addToWishlist, removeFromWishlist } from "../services/wishlistService";

export default function FirstProducts({ products = [] }) {
  const { user, cart, setCart, wishlist, setWishlist } = useContext(UserContext);
  const navigate = useNavigate();

  const toggleWishlist = async (product) => {
    if (!user) return navigate("/auth");

    const exists = wishlist.some(item => item._id === product._id);
    const updatedWishlist = exists
      ? wishlist.filter(item => item._id !== product._id)
      : [...wishlist, product];

    setWishlist(updatedWishlist);

    try {
      if (exists) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      setWishlist(wishlist); // Revert on failure
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) return navigate("/auth");

    try {
      await addToCart(product._id, 1);
      const existingItem = cart.find(item => item._id === product._id);
      if (existingItem) {
        setCart(cart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    } catch (err) {
      // Handle error
    }
  };

  const displayedProducts = useMemo(() => products.slice(20, 30), [products]);

  if (displayedProducts.length === 0) return null;

  return (
<div
  className="w-full bg-cover py-8 bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('/popularV1.png')"
  }}
>
  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-0 py-8 rounded-xl">

    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 mb-6">
      <span className="w-1 h-6 sm:h-8 bg-[#ffbe00]" />
      In High Demand
    </h2>

    
      {/* Tabs */}
      <div className="flex gap-2 sm:gap-3 mb-6">
          <button className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg">
            PreWork-Out
          </button>
      </div>

      {/* Horizontal Scroll Products */}
      <div className="w-full overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 sm:gap-6 md:gap-8 pb-4 min-w-min px-4 -mx-4">
          {displayedProducts.map(product => {
            const liked = wishlist.some(item => item._id === product._id);

            return (
              <div
                key={product._id}
                onClick={() => navigate(`/productpage/${product._id}`)}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] lg:w-[250px] h-[340px] sm:h-[350px] md:h-[360px] lg:h-[370px] flex flex-col
                           transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                {/* Image */}
                <div className="relative bg-gradient-to-b from-gray-50 to-white p-3 sm:p-4 h-32 sm:h-36 md:h-40 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform z-10"
                  >
                    <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                  </button>
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-28 sm:h-32 md:h-35 object-contain mb-2"
                  />
                  <div className="absolute bottom-2 right-2 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-md flex items-center justify-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2 sm:p-3 flex-1 flex flex-col">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">{product.title || product.name}</h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{product.subtitle || product.description}</p>

                  <div className="flex items-baseline gap-1 sm:gap-1.5 mb-2 sm:mb-3 flex-wrap">
                    <span className="text-sm sm:text-base font-bold text-gray-900">₹{product.currentPrice || product.price}</span>
                    <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                    <span className="text-xs font-semibold text-green-600">{product.discount}</span>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full bg-[#ffbe00]  text-gray-900 font-medium py-2 rounded-md text-xs hover:bg-yellow-500 active:scale-95 transition-transform duration-150"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-[#4192df] font-semibold hover:text-gray-700 transition-colors duration-200"
        >
          See All Products
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

  </div>

    </div>
  );
}
