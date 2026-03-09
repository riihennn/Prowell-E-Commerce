import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { UserContext } from "../Context/UserContext";
import { getProductById } from "../services/productService";
import { addToCart } from "../services/cartService";
import { addToWishlist, removeFromWishlist } from "../services/wishlistService";
import Loader from "./Loader";

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const { user, cart, setCart, wishlist, setWishlist } = useContext(UserContext);
  const navigate = useNavigate();

  const handleBuyNow = (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // Bypass cart: just navigate to payment with the product data
    navigate("/payment", { state: { product } });
  };

  // Check if product is liked
  const liked = product ? wishlist.some((item) => item._id === product._id) : false;

  // Fetch product from DB
  useEffect(() => {
    if (id) {
      setLoading(true);
      getProductById(id)
        .then((data) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  }, [id]);

  // Add to Cart
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
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...cart, { ...product, quantity: 1 }];

      setCart(updatedCart);
    } catch (err) {
      // Handle error
    }
  };

  // Toggle Wishlist
  const toggleWishlist = async (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const exists = wishlist.some((item) => item._id === product._id);
    const updatedWishlist = exists
      ? wishlist.filter((item) => item._id !== product._id)
      : [...wishlist, product];

    setWishlist(updatedWishlist); // Update local UI

    try {
      if (exists) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      // Revert if API fails
      setWishlist(wishlist);
    }
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 md:px-8 lg:px-12 pt-5">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
          {/* Left - Images */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="max-w-[600px] mx-auto">
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
                <img
                  src={product.image}
                  alt={product.title || product.name}
                  className="w-250 h-150 object-contain drop-shadow-2xl rounded-2xl p-8"
                />
                {/* Veg Icon */}
                <div className="absolute top-6 left-6 w-7 h-7 border-[2.5px] border-green-600 rounded-md flex items-center justify-center bg-white">
                  <div className="w-3.5 h-3.5 bg-green-600 rounded-full"></div>
                </div>
                {/* Wishlist */}
                <div className="absolute top-6 right-6">
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        liked ? "fill-red-500 text-red-500" : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Details */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-12 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl lg:text-[38px] font-bold text-gray-900 mb-3">
                {product.title || product.name}
              </h1>
              <p className="text-lg text-gray-600 font-medium">{product.subtitle || product.description}</p>
            </div>

            {/* Price */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-5xl font-bold text-gray-900">
                  ₹{product.currentPrice || product.price}
                </span>
                <span className="text-2xl text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {product.discount}
                </span>
              </div>
              <p className="text-sm text-gray-500">Inclusive all Taxes</p>
            </div>

            {/* Selected Flavor */}
            <div className="border-[3px] border-[#ffbe00] rounded-xl p-5 bg-yellow-50/30">
              <span className="text-gray-900 font-medium">Choosed Flavour and Weight: </span>
              <span className="text-gray-900 font-semibold">{product.subtitle || product.description}</span>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-white border border-gray-300 text-gray-900 font-medium py-2 rounded-md text-xs 
                  hover:bg-gray-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#ffbe00] 
                  focus:ring-offset-2 transition-transform duration-150"
              >
                Add to Cart
              </button>
              <button
                  onClick={() => handleBuyNow(product)}
                className="bg-[#ffbe00] text-black font-bold py-4 px-6 rounded-xl hover:bg-[#e6ab00] transition-all text-lg shadow-md hover:shadow-lg"
              >
                BUY NOW
              </button>
            </div>

            {/* Features */}
            <div className="flex gap-5 items-start bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="w-14 h-14 bg-white rounded-full flex-shrink-0 flex items-center justify-center border-2 border-gray-200 shadow-sm">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/5968/5968517.png"
                  alt="USA Patent"
                  className="w-8 h-8"
                  
                />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1.5 text-lg">USA Patented</h4>
                <p className="text-gray-600 text-base leading-relaxed">
                  Biozyme range proven for 50% higher protein absorption
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-gray-50 border-t border-gray-200 p-8 lg:p-12">
          <div className="max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Prowell</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Prowell is a leading sports nutrition and wellness brand committed to empowering individuals on their fitness journey.
                With a focus on scientific innovation and quality, Prowell delivers premium supplements that help athletes and fitness
                enthusiasts achieve their health and performance goals.
              </p>
              <p>
                Founded with the vision of making world-class nutrition accessible, Prowell combines cutting-edge research with
                high-quality ingredients to create products that deliver real results. Every product undergoes rigorous testing to ensure
                purity, potency, and safety.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}