import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

import { addToCart } from "../services/cartService";
import { addToWishlist, removeFromWishlist } from "../services/wishlistService";
import { getProductCategories, getProductsPaginated } from "../services/productService";
import { UserContext } from "../Context/UserContext";
import { AllProductsSkeleton } from "../components/Skeletons";

// ─── Constants ────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "", label: "Featured (Newest)" },
  { value: "price", label: "Price: Low → High" },
  { value: "-price", label: "Price: High → Low" },
  { value: "name", label: "Name: A → Z" },
  { value: "-name", label: "Name: Z → A" },
];
const LIMIT = 12;

const getDiscount = (price, original) => {
  if (!original || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AllProducts() {
  const navigate = useNavigate();
  const { user, cart, setCart, wishlist, setWishlist } = useContext(UserContext);

  // ── URL state (single source of truth for filters) ──────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const search    = searchParams.get("search")   || "";
  const category  = searchParams.get("category") || "all";
  const sort      = searchParams.get("sort")     || "";

  // ── Local UI state ───────────────────────────────────────────────────────────
  const [products,       setProducts]       = useState([]);
  const [categories,     setCategories]     = useState([]);  // fetched from DB
  const [total,          setTotal]          = useState(0);
  const [totalPages,     setTotalPages]     = useState(1);
  const [page,           setPage]           = useState(1);
  const [loading,        setLoading]        = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore,        setHasMore]        = useState(true);
  const [error,          setError]          = useState(null);
  const [addedMap,       setAddedMap]       = useState({});
  const [showSort,       setShowSort]       = useState(false);

  // Observer ref for infinite scroll
  const observer = useRef();
  const lastElementRef = (node) => {
    if (loading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        goToPage(page + 1);
      }
    });
    if (node) observer.current.observe(node);
  };

  // Debounce ref for search input
  const searchDebounce = useRef(null);

  // ── param helpers ────────────────────────────────────────────────────────────
  const setParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    });
    setPage(1); // reset page on filter change
  };

  const goToPage = (p) => {
    setPage(p);
  };

  // ── Fetch categories from DB (once on mount) ─────────────────────────────────
  const FALLBACK_CATEGORIES = ["creatine", "whey protein", "preworkout"];

  useEffect(() => {
    getProductCategories()
      .then((data) => {
        const cats = data.categories || [];
        setCategories(cats.length > 0 ? cats : FALLBACK_CATEGORIES);
      })
      .catch((err) => {
        console.error("Failed to fetch categories from DB, using fallback:", err.message);
        setCategories(FALLBACK_CATEGORIES);
      });
  }, []);

  // ── Fetch on URL change ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      if (page === 1) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      setError(null);
      try {
        const queryParams = { limit: LIMIT };
        if (search) queryParams.search = search;
        if (category && category !== "all") queryParams.category = category;
        if (sort) queryParams.sort = sort;
        if (page > 1) queryParams.page = page;

        const data = await getProductsPaginated(queryParams);
        
        const newProducts = data.products || [];
        setProducts((prev) => (page === 1 ? newProducts : [...prev, ...newProducts]));
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setHasMore(page < (data.totalPages || 1));
      } catch (e) {
        setError(e.message);
        if (page === 1) setProducts([]);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    };
    fetch();
  }, [search, category, sort, page]);

  // ── Wishlist ─────────────────────────────────────────────────────────────────
  const wishlistIds = new Set((wishlist || []).map((i) => i._id));

  const toggleWishlist = async (product) => {
    if (!user) return navigate("/login");
    const exists = wishlistIds.has(product._id);
    setWishlist(
      exists ? wishlist.filter((i) => i._id !== product._id) : [...wishlist, product]
    );
    try { exists ? await removeFromWishlist(product._id) : await addToWishlist(product._id); } catch {}
  };

  // ── Add to Cart ──────────────────────────────────────────────────────────────
  const handleAddToCart = async (product) => {
    if (!user) return navigate("/login");
    try {
      await addToCart(product._id, 1);
      const existing = cart.find((i) => i._id === product._id);
      setCart(
        existing
          ? cart.map((i) => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...cart, { ...product, quantity: 1 }]
      );
      setAddedMap((p) => ({ ...p, [product._id]: true }));
      setTimeout(() => setAddedMap((p) => ({ ...p, [product._id]: false })), 1600);
    } catch {}
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex items-center justify-center min-h-screen text-red-500 text-sm">{error}</div>
  );

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Hero ── */}
      <div className="relative bg-zinc-950 overflow-hidden">
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #ffbe00 0%, transparent 65%)", opacity: 0.1 }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <p className="text-yellow-400 text-[11px] font-extrabold tracking-[0.22em] uppercase mb-2">Fuel Your Gains</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            All <span className="text-yellow-400">Products</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            {loading && page === 1 ? "Loading..." : `${total} product${total !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      {/* ── Sticky Controls ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-200 transition-colors"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">
                {SORT_OPTIONS.find((o) => o.value === sort)?.label || "Sort"}
              </span>
              <span className="sm:hidden">Sort</span>
            </button>

            {showSort && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden z-50">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => { setParam("sort", o.value); setShowSort(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                        sort === o.value
                          ? "bg-yellow-400 text-zinc-900 font-bold"
                          : "text-stone-600 hover:bg-stone-50"
                      }`}
                    >{o.label}</button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span className="hidden sm:block text-xs text-stone-400 ml-auto font-medium">
            {total} items
          </span>
        </div>

        {/* Category Pills — fetched dynamically from DB */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex gap-2 flex-wrap">
          {/* All pill always first */}
          <button
            onClick={() => setParam("category", "all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
              category === "all"
                ? "bg-zinc-900 text-yellow-400"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800"
            }`}
          >
            All
          </button>

          {/* Dynamic categories from DB */}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setParam("category", cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                category === cat
                  ? "bg-zinc-900 text-yellow-400"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading && page === 1 ? (
          <AllProductsSkeleton count={12} />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-stone-700 mb-1">No products found</h3>
            <p className="text-stone-400 text-sm">Try a different search or category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {products.map((product, index) => {
                const liked    = wishlistIds.has(product._id);
                const discount = getDiscount(product.price, product.originalPrice);
                const isAdded  = addedMap[product._id];

                return (
                  <div
                    key={`${product._id}-${index}`}
                    ref={index === products.length - 1 ? lastElementRef : null}
                    onClick={() => navigate(`/productpage/${product._id}`)}
                    className="group bg-white rounded-2xl border border-stone-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative bg-stone-50 flex items-center justify-center p-5 min-h-[164px]">
                      {discount && (
                        <span className="absolute top-3 left-3 z-10 bg-zinc-900 text-yellow-400 text-[10px] font-black px-2.5 py-1 rounded-lg tracking-wider">
                          {discount}% OFF
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border transition-all ${
                          liked ? "bg-red-50 border-red-200" : "bg-white border-stone-200 hover:border-red-300 hover:bg-red-50"
                        }`}
                      >
                        <Heart size={14} className={liked ? "fill-red-500 text-red-500" : "text-stone-400"} />
                      </button>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-36 w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Body */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-[15px] font-bold text-zinc-900 leading-snug line-clamp-2">{product.name}</h3>
                      {product.variant && <p className="text-sm text-stone-400 mt-0.5">{product.variant}</p>}
                      {product.description && (
                        <p className="text-xs text-stone-400 mt-1 mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                      )}
                      {!product.description && <div className="mb-3" />}

                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <span className="text-xl font-black text-zinc-900">₹{product.price?.toLocaleString("en-IN")}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-stone-400 line-through">₹{product.originalPrice?.toLocaleString("en-IN")}</span>
                        )}
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        className={`w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 mt-auto ${
                          isAdded ? "bg-zinc-900 text-yellow-400" : "bg-yellow-400 text-zinc-900 hover:bg-yellow-500"
                        }`}
                      >
                        {isAdded ? "✓ Added to Cart" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Loading More Indicator */}
            {isFetchingMore && (
              <div className="mt-5">
                <AllProductsSkeleton count={4} />
              </div>
            )}

            {/* End of results message */}
            {!hasMore && products.length > 0 && (
              <div className="text-center py-12 text-stone-400 text-sm font-medium italic">
                You've reached the end of our current selection
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}