import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useMemo } from "react";
import { Heart } from "lucide-react";
import { UserContext } from "../Context/UserContext";
import { getProducts } from "../services/productService";
import { addToWishlist, removeFromWishlist } from "../services/wishlistService";
import { addToCart } from "../services/cartService";
import Loader from "../components/Loader";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, cart, setCart, wishlist, setWishlist, setUser } = useContext(UserContext);

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);

      getProducts()
        .then((data) => {
          const filtered = data.filter(
            (product) =>
              product.title.toLowerCase().includes(query.toLowerCase()) ||
              (product.name && product.name.toLowerCase().includes(query.toLowerCase())) ||
              (product.category && product.category.toLowerCase().includes(query.toLowerCase()))
          );
          setResults(filtered);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [query]);

  const toggleWishlist = async (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }

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
      // Revert if error
      setWishlist(wishlist);
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      await addToCart(product._id, 1);
      const existingItem = cart.find((item) => item._id === product._id);
      const updatedCart = existingItem
        ? cart.map((item) =>
            item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...cart, { ...product, quantity: 1 }];

      setCart(updatedCart);
    } catch (err) {
      // Handle error
    }
  };

  const wishlistIds = useMemo(() => new Set(wishlist.map((item) => item._id)), [wishlist]);
  const isInWishlist = (productId) => wishlistIds.has(productId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="text-2xl font-bold mb-6">
        Search Results for:{" "}
        <span className="text-[#ffbe00] capitalize">{query}</span>
      </h2>

      {loading ? (
        <Loader />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {results.map((product) => {
            const liked = isInWishlist(product._id);

            return (
              <div
                key={product._id}
                onClick={() => navigate(`/productpage/${product._id}`)}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col shadow-sm transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative bg-gradient-to-b from-gray-50 to-white p-3 sm:p-4 h-44 sm:h-48 md:h-48">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform z-10"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        liked ? "fill-red-500 text-red-500" : "text-gray-400"
                      }`}
                    />
                  </button>

                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-1">
                    {product.title || product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
                    {product.subtitle || product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 sm:gap-1.5 mb-3 flex-wrap">
                    <span className="text-sm sm:text-base font-bold text-gray-900">
                      ₹{product.currentPrice || product.price}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="text-xs font-semibold text-green-600">
                      {product.discount}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full bg-white border border-gray-300 text-gray-900 font-medium py-2 rounded-md text-xs 
                        hover:bg-gray-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#ffbe00] 
                        focus:ring-offset-2 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      ) : (
        <p className="text-gray-600">No products found for "{query}"</p>
      )}
    </div>
  );
}
