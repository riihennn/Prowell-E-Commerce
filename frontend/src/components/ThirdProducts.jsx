import { Heart, ChevronRight } from "lucide-react";
import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { addToCart } from "../services/cartService";
import { addToWishlist, removeFromWishlist } from "../services/wishlistService";

export default function ThirdProducts({ products = [] }) {
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
      if (exists) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      setWishlist(wishlist);
    }
  };

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
    () => products.filter((p) => p.badge === "Verified" || p.badge === "Best Seller"),
    [products]
  );

  if (bestSellers.length === 0) return null;

  return (
    <div
      className="w-full bg-cover bg-center bg-no-repeat py-6 sm:py-8"
      style={{ backgroundImage: "url('./popular.jpeg')" }}
    >
      <div className="w-full max-w-[1200px] mx-auto pt-8 sm:pt-12 pb-8 sm:pb-10 px-3 sm:px-6 lg:px-8">

        {/* Header */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2.5 mb-5 sm:mb-6">
          <span className="w-1 h-6 sm:h-7 bg-[#ffbe00] rounded-full inline-block" />
          Popular
        </h2>

        {/* Tab */}
        <div className="flex gap-2 sm:gap-3 mb-5 sm:mb-6">
          <button className="bg-gray-900 text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm">
            Best Seller
          </button>
        </div>

        {/* Horizontal Scroll */}
        <div className="w-full overflow-x-auto hide-scrollbar -mx-3 px-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex gap-3 sm:gap-4 md:gap-5 pb-3 min-w-min">
            {bestSellers.map((product) => {
              const liked = wishlist.some((item) => item._id === product._id);

              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/productpage/${product._id}`)}
                  className="bg-white border border-gray-100 shadow-sm flex-shrink-0
                             w-[200px] sm:w-[250px] md:w-[280px] lg:w-[320px]
                             flex flex-col cursor-pointer
                             transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-t-2xl
                                  h-32 sm:h-36 md:h-40
                                  flex items-center justify-center p-3 sm:p-4 overflow-hidden">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform z-10"
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    </button>

                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-24 sm:h-28 md:h-32 object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-2.5 sm:p-3 flex flex-col flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1 mb-0.5">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 min-h-[2rem] mb-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 flex-wrap mb-2.5 mt-auto">
                      <span className="text-sm sm:text-base font-bold text-gray-900">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-300 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                      {product.discount && (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded">
                          {product.discount}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      className="w-full bg-[#ffbe00] hover:bg-yellow-500 active:scale-95 text-gray-900 font-semibold py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-150"
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
            className="flex items-center gap-1.5 text-[#4192df] font-semibold hover:text-gray-200 text-sm sm:text-base transition-colors duration-200"
          >
            See All Products
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}