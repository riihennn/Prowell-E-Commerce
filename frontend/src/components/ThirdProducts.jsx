import { Heart, ChevronRight } from "lucide-react";
import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { addToCart } from "../services/cartService";
import { addToWishlist, removeFromWishlist } from "../services/wishlistService";

export default function ThirdProducts({ products = [] }) {
  const { user, cart, setCart, wishlist, setWishlist } = useContext(UserContext);
  const navigate = useNavigate();

  // Wishlist toggle
  const toggleWishlist = async (product) => {
    if (!user) return navigate("/auth");

    const exists = wishlist.some((item) => item._id === product._id);
    const updatedWishlist = exists
      ? wishlist.filter((item) => item._id !== product._id)
      : [...wishlist, product];

    setWishlist(updatedWishlist);

    try {
      if (exists) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      setWishlist(wishlist);
    }
  };

  // Add to Cart
  const handleAddToCart = async (product) => {
    if (!user) return navigate("/auth");

    try {
      await addToCart(product._id, 1);
      const existingItem = cart.find((item) => item._id === product._id);
      if (existingItem) {
        setCart(cart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    } catch (err) {
      // Handle error
    }
  };


  const bestSellers = useMemo(
    () =>
      products.filter(
        (p) =>  p.badge === "Verified" || p.badge === "Best Seller"
      ),
    [products]
  );

  if (bestSellers.length === 0) return null;

  return (
    <div
      className="w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('./popular.jpeg')" }}
    >
      <div className="w-full max-w-[1200px] mx-auto pt-16 pb-10 px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl sm:text-4xl font-semibold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-[#ffbe00]" />
          Popular
        </h2>

        <div className="flex gap-2 mb-6">
          <button className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg">
            Best Seller
          </button>
        </div>

        {/* Products Section */}
        <div className="w-full overflow-x-auto hide-scrollbar">
          <div className="flex gap-6 pb-4 min-w-min">
            {bestSellers.map((product) => {
              const liked = wishlist.some((item) => item._id === product._id);

              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/productpage/${product._id}`)}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-shrink-0 w-[260px] sm:w-[300px] flex flex-col 
                             transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative p-4 bg-gradient-to-b from-gray-50 to-white h-40 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-transform z-10"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          liked ? "fill-red-500 text-red-500" : "text-gray-400"
                        }`}
                      />
                    </button>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 sm:h-36 object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 min-h-[2.5rem]">
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base font-bold text-gray-900">
                        ₹{product.price}
                      </span>
                      <span className="text-xs line-through text-gray-400">
                        ₹{product.originalPrice}
                      </span>
                      <span className="text-xs font-semibold text-green-600">
                        {product.discount}
                      </span>
                    </div>

                    {/* Buttons */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full bg-[#ffbe00] text-gray-900 font-medium py-2 rounded-md text-xs hover:bg-yellow-500 active:scale-95 transition-transform duration-300"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-[#4192df] font-semibold hover:text-gray-200 transition-colors"
          >
            See All Products
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
