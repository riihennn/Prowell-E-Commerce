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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

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
        setIsDropdownOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSearchClick = () => {
    if (searchTerm.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsDropdownOpen(false);
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

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const data = await getProducts();
        const filtered = data
          .filter(
            (p) =>
              p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 6);
        setSuggestions(filtered);
        setIsDropdownOpen(filtered.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        // Silently fail
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const SuggestionDropdown = ({ isMobile = false }) => (
    <div
      className="absolute top-full left-0 w-full z-[999]"
      style={{ marginTop: "6px" }}
    >
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
            gap: "6px",
          }}
        >
          <TrendingUp size={13} style={{ color: "#ffbe00" }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Suggestions
          </span>
        </div>

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
                  src={product.image}
                  alt={product.title || product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
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
                  {highlightMatch(product.title || product.name, searchTerm)}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                  {(product.price || product.currentPrice) && (
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffbe00" }}>
                      ₹{product.price || product.currentPrice}
                    </span>
                  )}
                  {product.item && (
                    <span style={{ fontSize: "11px", color: "#bbb" }}>{product.item}</span>
                  )}
                </div>
              </div>

              <span style={{ fontSize: "16px", color: "#ddd", flexShrink: 0 }}>›</span>
            </li>
          ))}
        </ul>

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
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fffbee")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Search size={13} style={{ color: "#ffbe00" }} />
          <span style={{ fontSize: "13px", color: "#666" }}>
            Search for <strong style={{ color: "#1a1a1a" }}>"{searchTerm}"</strong>
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

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50 overflow-visible">
        {/* ─── Responsive container: tight on phones, padded on tablets+, wide on desktop ─── */}
        <div className="mx-auto px-3 sm:px-4 md:px-8 lg:px-20 xl:px-24 2xl:px-32 max-w-screen-2xl">
          <div className="flex items-center justify-between h-24">

            {/* ── Left: Hamburger (mobile/tablet) + Logo ── */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Show hamburger on everything below lg */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 sm:p-3 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-7 w-7 sm:h-8 sm:w-8" />
              </button>

              <Link to="/" className="flex-shrink-0">
                <img
                  className="h-9 sm:h-10 md:h-11 lg:h-12 w-auto pr-4 sm:pr-6 lg:pr-10"
                  src={Logo}
                  alt="Prowell"
                />
              </Link>
            </div>

            {/* ── Center: Desktop nav links (lg+) ── */}
            <div className="hidden lg:flex items-center space-x-8 xl:space-x-10 flex-shrink-0">
              <Link to="/" className="text-lg text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap">Home</Link>
              <Link to="/products" className="text-lg text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap">Shop</Link>
              {user?.isAdmin && (
                <Link to="/admin" className="text-lg text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap">Admin</Link>
              )}
            </div>

            {/* ── Desktop Search bar (lg+) ── */}
            <div
              ref={searchRef}
              className="hidden lg:flex flex-1 max-w-sm xl:max-w-md 2xl:max-w-lg mx-6 xl:mx-8 relative overflow-visible"
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
              {isDropdownOpen && suggestions.length > 0 && <SuggestionDropdown />}
            </div>

            {/* ── Right: Icons + User ── */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 xl:space-x-5 flex-shrink-0">
              {/* Wishlist */}
              <button
                onClick={() => navigate("/wishlist")}
                className="relative p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-gray-700" />
                {wishlist.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-black text-xs sm:text-sm font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center"
                    style={{ backgroundColor: "#ffbe00" }}
                  >
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="h-7 w-7 sm:h-8 sm:w-8 text-gray-700" />
                {cart.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-black text-xs sm:text-sm font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center"
                    style={{ backgroundColor: "#ffbe00" }}
                  >
                    {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                  </span>
                )}
              </button>

              {/* User avatar — show text label only on xl+ to prevent overflow */}
              <div
                onClick={() => navigate(user ? "/profile" : "/auth")}
                className="hidden md:flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full text-white font-bold text-base lg:text-lg flex-shrink-0"
                  style={{ backgroundColor: "#ffbe00" }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5 lg:h-6 lg:w-6" />}
                </div>
                {/* Hide the greeting on md/lg to save space; show on xl+ */}
                <span className="hidden xl:block text-gray-700 font-semibold whitespace-nowrap text-sm xl:text-base">
                  {user?.name ? `Hello, ${user.name}` : "Login / Sign Up"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Mobile / Tablet Search bar (below lg) ── */}
          <div ref={mobileSearchRef} className="lg:hidden pb-3 sm:pb-4 relative overflow-visible">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
              className="w-full px-5 py-2.5 sm:py-3 pl-11 sm:pl-12 pr-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbe00]"
            />
            <Search
              onClick={handleSearchClick}
              className="absolute left-4 top-3 sm:top-3.5 h-5 w-5 sm:h-6 sm:w-6 text-gray-400 cursor-pointer"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-3 sm:top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 p-0.5" />
              </button>
            )}
            {isDropdownOpen && suggestions.length > 0 && <SuggestionDropdown isMobile />}
          </div>
        </div>
      </nav>

      {/* ── Mobile / Tablet Drawer Overlay ── */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ── Slide-in Drawer ── */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden
          w-72 sm:w-80 md:w-96
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 sm:py-5 border-b border-gray-200">
          <div
            onClick={() => { navigate(user ? "/profile" : "/auth"); setIsMenuOpen(false); }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div
              className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white font-bold text-lg shadow-md flex-shrink-0"
              style={{ backgroundColor: "#ffbe00" }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-base sm:text-lg">{user?.name || "Guest"}</p>
              <p className="text-xs sm:text-sm text-gray-500">{user ? "View Profile" : "Login / Sign Up"}</p>
            </div>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Drawer nav links */}
        <div className="flex flex-col mt-5 sm:mt-6 space-y-3 sm:space-y-4 px-5 sm:px-6">
          {[
            { to: "/", label: "Home" },
            { to: "/products", label: "Shop" },
            { to: "/cart", label: "Cart" },
            { to: "/wishlist", label: "Wishlist" },
            { to: "/orders", label: "Your Orders" },
            ...(user?.isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsMenuOpen(false)}
              className="text-base sm:text-lg text-gray-700 hover:text-[#ffbe00] transition-colors py-1"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Drawer footer */}
        <div className="absolute bottom-0 left-0 w-full border-t border-gray-200 py-4 px-5 sm:px-6">
          <p className="text-xs sm:text-sm text-gray-500">© {new Date().getFullYear()} Prowell. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}

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