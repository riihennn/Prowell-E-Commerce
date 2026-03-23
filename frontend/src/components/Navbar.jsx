import { useState, useContext, useEffect, useRef } from "react";
import { Search, ShoppingCart, User, Menu, X, Heart, TrendingUp } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import Logo from "../assets/ProWell.png";
import { getProducts } from "../services/productService";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { cart, wishlist, user } = useContext(UserContext);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const [allProducts, setAllProducts] = useState([]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        navigateToProduct(suggestions[activeIndex]);
      } else if (searchTerm.trim() !== "") {
        navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        setIsDropdownOpen(false); // Close dropdown, but keep text
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSearchClick = () => {
    if (searchTerm.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsDropdownOpen(false); // Close dropdown, but keep text
    }
  };

  const navigateToProduct = (product) => {
    navigate(`/products?search=${encodeURIComponent(product.title || product.name)}`);
    setIsDropdownOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setIsDropdownOpen(false);
    setActiveIndex(-1);
  };

  // Fetch all products once for instant local filtering
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await getProducts();
        setAllProducts(data);
      } catch (err) {
        console.error("Failed to fetch products for suggestions", err);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const performFilter = () => {
      const query = searchTerm.toLowerCase();
      const filtered = allProducts
        .filter(
          (p) =>
            p.title?.toLowerCase().includes(query) ||
            p.name?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query)
        )
        .slice(0, 8); // Show up to 8 results
      setSuggestions(filtered);
      setIsDropdownOpen(true);
      setActiveIndex(-1);
    };

    // Minor debounce just to avoid CPU spikes during very fast typing
    const timer = setTimeout(performFilter, 100);
    return () => clearTimeout(timer);
  }, [searchTerm, allProducts]);


  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50 overflow-visible">
        <div className="mx-auto px-3 md:mx-20">
          <div className="flex items-center justify-between h-24">
            {/* Mobile menu & Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-3"
              >
                <Menu className="h-8 w-8" />
              </button>
              <Link to="/" className="flex-shrink-0">
                <img
                  className="h-10 md:h-15 lg:h-15 w-auto pr-10"
                  src={Logo}
                  alt="Prowell"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
              <Link to="/" className="text-lg text-gray-700 hover:text-gray-900">Home</Link>
              <Link to="/products" className="text-lg text-gray-700 hover:text-gray-900">Shop</Link>
              {user?.isAdmin && <Link to="/admin">Admin</Link>}
            </div>

            {/* Desktop Search */}
            <div
              ref={searchRef}
              className="hidden md:flex flex-1 max-w-lg mx-8 relative overflow-visible"
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
                className="w-full px-5 py-3 pl-12 pr-10 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbe00]"
                style={{ transition: "box-shadow 0.2s" }}
              />
              <Search
                onClick={handleSearchClick}
                className="absolute left-4 top-3.5 h-6 w-6 text-gray-400 cursor-pointer"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="h-6 w-6 p-0.5" />
                </button>
              )}
              {isDropdownOpen && (
                <SuggestionDropdown
                  suggestions={suggestions}
                  searchTerm={searchTerm}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                  navigateToProduct={navigateToProduct}
                  handleSearchClick={handleSearchClick}
                  setIsDropdownOpen={setIsDropdownOpen}
                />
              )}
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-3 md:space-x-5">
              <button
                onClick={() => navigate("/wishlist")}
                className="relative p-3 hover:bg-gray-100 rounded-full"
              >
                <Heart className="h-8 w-8 text-gray-700" />
                {wishlist.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-black text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center"
                    style={{ backgroundColor: "#ffbe00" }}
                  >
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="relative p-3 hover:bg-gray-100 rounded-full"
              >
                <ShoppingCart className="h-8 w-8 text-gray-700" />
                {cart.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-black text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center"
                    style={{ backgroundColor: "#ffbe00" }}
                  >
                    {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                  </span>
                )}
              </button>

              <div
                onClick={() => navigate(user ? "/profile" : "/auth")}
                className="hidden md:flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg"
                  style={{ backgroundColor: "#ffbe00" }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                </div>
                <span className="text-gray-700 font-semibold">
                  {user?.name ? `Hello, ${user.name}` : "Login / Sign Up"}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div ref={mobileSearchRef} className="md:hidden pb-4 relative overflow-visible">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
              className="w-full px-5 py-3 pl-12 pr-10 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbe00]"
            />
            <Search
              onClick={handleSearchClick}
              className="absolute left-4 top-3.5 h-6 w-6 text-gray-400 cursor-pointer"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="h-6 w-6 p-0.5" />
              </button>
            )}
            {isDropdownOpen && (
              <SuggestionDropdown
                isMobile
                suggestions={suggestions}
                searchTerm={searchTerm}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                navigateToProduct={navigateToProduct}
                handleSearchClick={handleSearchClick}
                setIsDropdownOpen={setIsDropdownOpen}
                setIsMenuOpen={setIsMenuOpen}
              />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200">
          <div
            onClick={() => { navigate(user ? "/profile" : "/auth"); setIsMenuOpen(false); }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg shadow-md"
              style={{ backgroundColor: "#ffbe00" }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-lg">{user?.name || "Guest"}</p>
              <p className="text-sm text-gray-500">{user ? "View Profile" : "Login / Sign Up"}</p>
            </div>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <div className="flex flex-col mt-6 space-y-4 px-6">
          {[
            { to: "/", label: "Home" },
            { to: "/products", label: "Shop" },
            { to: "/Cart", label: "Cart" },
            { to: "/WishList", label: "Wishlist" },
            { to: "/orders", label: "Your Orders" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg text-gray-700 hover:text-[#ffbe00]"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 w-full border-t border-gray-200 py-4 px-6">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Prowell. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}

const SuggestionDropdown = ({
  isMobile = false,
  suggestions,
  searchTerm,
  activeIndex,
  setActiveIndex,
  navigateToProduct,
  handleSearchClick,
  setIsDropdownOpen,
  setIsMenuOpen
}) => (
  <div
    className="absolute top-full left-0 w-full z-[999]"
    style={{ marginTop: "6px" }}    >
      {/* Arrow pointer */}
      <div
        style={{
          position: "absolute",
          top: "-6px",
          left: isMobile ? "20px" : "40px",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: "6px solid #fff",
          filter: "drop-shadow(0 -1px 1px rgba(0,0,0,0.08))",
        }}
      />
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 1.5px 4px rgba(0,0,0,0.07)",
          border: "1px solid #f0f0f0",
          overflow: "hidden",
          animation: "dropdownFade 0.18s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "10px 16px 8px",
            borderBottom: "1px solid #f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <TrendingUp size={13} style={{ color: "#ffbe00" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {suggestions.length > 0 ? "Suggestions" : "No results found"}
            </span>
          </div>
          {suggestions.length > 0 && (
            <span style={{ fontSize: "10px", color: "#bbb" }}>Type to refine</span>
          )}
        </div>

        {suggestions.length > 0 ? (
          <ul style={{ margin: 0, padding: "6px 0", listStyle: "none" }}>
            {suggestions.map((product, index) => (
              <li
                key={product._id}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
                onClick={() => navigateToProduct(product)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "9px 16px",
                  cursor: "pointer",
                  background: activeIndex === index ? "#fffbee" : "transparent",
                  borderLeft: activeIndex === index ? "3px solid #ffbe00" : "3px solid transparent",
                  transition: "all 0.12s ease",
                }}
              >
                {/* Product image */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#f8f8f8",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <img
                    src={product.image || product.images?.[0]}
                    alt={product.title || product.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => (e.target.src = "https://via.placeholder.com/44")}
                  />
                </div>

                {/* Product info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#1a1a1a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {/* Highlight matching text */}
                      {highlightMatch(product.title || product.name, searchTerm)}
                    </p>
                    {product.category && (
                      <span
                        style={{
                          fontSize: "9px",
                          background: "#f4f4f4",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          color: "#888",
                          textTransform: "uppercase",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {product.category}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                    {(product.price || product.currentPrice) && (
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffbe00" }}>
                        ₹{product.price || product.currentPrice}
                      </span>
                    )}
                    {product.brand && (
                      <span style={{ fontSize: "11px", color: "#bbb" }}>{product.brand}</span>
                    )}
                  </div>
                </div>

                {/* Arrow hint */}
                <span style={{ fontSize: "16px", color: "#ddd", flexShrink: 0 }}>›</span>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ padding: "30px 16px", textAlign: "center", color: "#999" }}>
            <Search size={24} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
            <p style={{ fontSize: "14px", margin: 0 }}>
              We couldn't find any products matching <br />
              <strong style={{ color: "#555" }}>"{searchTerm}"</strong>
            </p>
          </div>
        )}

        {/* Footer: view all */}
        <div
          onClick={() => {
            handleSearchClick();
            setIsDropdownOpen(false);
            if (isMobile) setIsMenuOpen(false);
          }}
          style={{
            padding: "10px 16px",
            borderTop: "1px solid #f5f5f5",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#fafafa",
            transition: "all 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fffbee")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fafafa")}
        >
          <Search size={13} style={{ color: "#ffbe00" }} />
          <span style={{ fontSize: "13px", color: "#666" }}>
            {suggestions.length > 0 ? (
              <>Search all results for <strong style={{ color: "#1a1a1a" }}>"{searchTerm}"</strong></>
            ) : (
              <>Try a different search term</>
            )}
          </span>
        </div>
      </div>

    <style>{`
      @keyframes dropdownFade {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
);

// Utility: highlight matched substring
function highlightMatch(text, query) {
  if (!text || !query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: "#ffbe00", fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}