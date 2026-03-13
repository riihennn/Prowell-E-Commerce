import { Heart, ChevronRight } from "lucide-react";
import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { addToCart } from "../services/cartService";
import { addToWishlist, removeFromWishlist } from "../services/wishlistService";

export default function SecondProducts({ products = [] }) {
  const { user, cart, setCart, wishlist, setWishlist } = useContext(UserContext);
  const navigate = useNavigate();

  const toggleWishlist = async (product) => {
    if (!user) return navigate("/auth");
    const exists = wishlist.some((item) => item._id === product._id);
    const updatedWishlist = exists
      ? wishlist.filter((item) => item._id !== product._id)
      : [...wishlist, product];
    setWishlist(updatedWishlist);
    try {
      if (exists) await removeFromWishlist(product._id);
      else await addToWishlist(product._id);
    } catch (err) {
      setWishlist(wishlist);
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) return navigate("/auth");
    try {
      await addToCart(product._id, 1);
      const exists = cart.find((item) => item._id === product._id);
      if (exists) {
        setCart(cart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    } catch (err) {}
  };

  const displayedProducts = useMemo(() => products.slice(10, 20), [products]);

  if (displayedProducts.length === 0) return null;

  return (
    <div className="w-full bg-[#ececec] py-8 sm:py-12">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8">

        {/* Header */}
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 flex items-center gap-2 mb-5 sm:mb-6">
          <span className="w-1 h-6 sm:h-8 bg-[#ffbe00]" />
          Frequently Bought Together
        </h2>

        {/* Horizontal Scroll */}
        <div className="w-full overflow-x-auto hide-scrollbar -mx-3 px-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex gap-4 sm:gap-6 pb-4 min-w-min">
            {displayedProducts.map((product) => {
              const liked = wishlist.some((item) => item._id === product._id);

              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/productpage/${product._id}`)}
                  className="bg-white border border-gray-200 flex-shrink-0
                             w-[200px] sm:w-[220px] lg:w-[250px]
                             flex flex-col shadow-sm cursor-pointer
                             transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  {/* Image */}
                  <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-t-2xl p-4 h-36 sm:h-40 flex items-center justify-center overflow-hidden">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-transform z-10"
                    >
                      <Heart className={`w-5 h-5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    </button>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-28 sm:h-32 object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {product.title || product.name}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {product.subtitle || product.description}
                    </p>

                    <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                      <span className="text-base font-bold text-gray-900">
                        ₹{product.currentPrice || product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                      {product.discount && (
                        <span className="text-xs text-green-600 font-semibold">
                          {product.discount}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      className="w-full bg-[#ffbe00] text-gray-900 font-medium py-2 rounded-md text-xs hover:bg-yellow-500 active:scale-95 focus:ring-2 focus:ring-[#ffbe00] transition-transform duration-300 mt-auto"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* See All */}
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-[#4192df] font-semibold hover:text-gray-700 text-sm sm:text-base transition-colors"
          >
            See All Products
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}