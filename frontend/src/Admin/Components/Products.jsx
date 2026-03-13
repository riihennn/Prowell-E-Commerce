import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save,
  X,
  ArrowLeft,
  Filter,
  RefreshCw,
  Tag,
  ChevronDown
} from 'lucide-react';
import { getAllAdminProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import Loader from '../../components/Loader';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  // View states
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for Add Product form
  const [newProduct, setNewProduct] = useState({
    title: '',
    item: 'whey protein',
    currentPrice: '',
    image: '',
    subtitle: '',
    originalPrice: '',
    discount: '',
    badge: 'New'
  });

  // State for Edit Product
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllAdminProducts();
      
      // Transform the products data if necessary
      const transformedProducts = data.map(product => ({
        ...product,
        id: product._id || product.id,
        title: product.name || product.title,
        subtitle: product.description || product.subtitle,
        item: product.category || product.item,
        price: product.price || 0,
        originalPriceValue: product.originalPrice || 0
      }));

      setProducts(transformedProducts);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.item?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || product.item === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.item).filter(Boolean))];
    return categories;
  };

  // ADD PRODUCT FUNCTIONS
  const handleAddProduct = () => {
    setCurrentView('add');
    setNewProduct({
      title: '',
      item: 'whey protein',
      currentPrice: '',
      image: '',
      subtitle: '',
      originalPrice: '',
      discount: '',
      badge: 'New'
    });
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const productToAdd = {
        name: newProduct.title,
        description: newProduct.subtitle,
        category: newProduct.item,
        price: parseFloat(newProduct.currentPrice) || 0,
        originalPrice: parseFloat(newProduct.originalPrice) || 0,
        discount: newProduct.discount,
        image: newProduct.image || 'https://via.placeholder.com/300',
        badge: newProduct.badge
      };

      await createProduct(productToAdd);
      
      // Refresh products list
      await fetchProducts();
      
      // Reset form and go back to list
      setCurrentView('list');
      
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`Failed to add product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelAddProduct = () => {
    setCurrentView('list');
  };

  // EDIT PRODUCT FUNCTIONS
  const startEditProduct = (product) => {
    setEditingProduct({
      title: product.title || product.name || '',
      subtitle: product.subtitle || product.description || '',
      item: product.item || product.category || 'whey protein',
      currentPrice: product.price?.toString() || '',
      originalPrice: product.originalPriceValue?.toString() || '',
      discount: product.discount || '',
      image: product.image || '',
      badge: product.badge || 'None',
      id: product.id
    });
    setCurrentView('edit');
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitEditProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const productToUpdate = {
        name: editingProduct.title,
        description: editingProduct.subtitle,
        category: editingProduct.item,
        price: parseFloat(editingProduct.currentPrice) || 0,
        originalPrice: parseFloat(editingProduct.originalPrice) || 0,
        discount: editingProduct.discount,
        image: editingProduct.image,
        badge: editingProduct.badge
      };

      await updateProduct(editingProduct.id, productToUpdate);

      // Refresh products list
      await fetchProducts();
      
      // Reset and go back to list
      setEditingProduct(null);
      setCurrentView('list');
      
    } catch (error) {
      console.error('Error updating product:', error);
      alert(`Failed to update product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEditProduct = () => {
    setEditingProduct(null);
    setCurrentView('list');
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProduct(productId);

      // Refresh products list
      await fetchProducts();
      
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`Failed to delete product: ${error.message}`);
    }
  };

  if (loading && currentView === 'list') {
    return (
      <div className="flex-1 min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#ffbe00]/20 border-t-[#ffbe00] rounded-full animate-spin shadow-sm"></div>
        <p className="mt-6 text-gray-500 font-medium text-lg tracking-wide animate-pulse">Loading products...</p>
      </div>
    );
  }

  if (error && currentView === 'list') {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center transform transition-all hover:scale-105">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <X className="text-rose-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Oops! Something went wrong</h2>
          <p className="text-gray-500 mb-8 font-medium">{error}</p>
          <button 
            onClick={fetchProducts}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#ffbe00] to-[#e6ab00] text-white rounded-xl font-bold tracking-wide hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // ADD / EDIT PRODUCT VIEW FORM
  const renderProductForm = (isEdit = false) => {
    const formData = isEdit ? editingProduct : newProduct;
    const handleChange = isEdit ? handleEditFormChange : handleAddFormChange;
    const handleSubmit = isEdit ? submitEditProduct : submitAddProduct;
    const handleCancel = isEdit ? cancelEditProduct : cancelAddProduct;

    const actionText = isEdit ? 'Update' : 'Add';
    const FormTitle = isEdit ? 'Edit Product' : 'Add New Product';
    const FormSubtitle = isEdit ? 'Update the details of your existing product below.' : 'Fill in the details to add a new product to your store.';

    return (
      <div className="min-h-screen bg-gray-50/50 p-6 sm:p-8 lg:p-10 font-sans max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleCancel}
              className="p-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-2xl transition-all shadow-sm group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{FormTitle}</h1>
              <p className="text-gray-500 mt-1 text-lg">{FormSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Package size={150} />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Split layout for larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Essential Info */}
              <div className="lg:col-span-8 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6 relative">
                    Basic Information
                    <span className="absolute bottom-[-1px] left-0 w-12 h-1 bg-[#ffbe00] rounded-full"></span>
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">Product Title <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-medium text-gray-900 placeholder-gray-400"
                        placeholder="e.g. Premium Whey Protein Isolate"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">Product Subtitle</label>
                      <input
                        type="text"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-medium text-gray-900 placeholder-gray-400"
                        placeholder="e.g. 100% pure isolate, 24g protein per serving"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">Category <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <select
                          name="item"
                          value={formData.item}
                          onChange={handleChange}
                          className="appearance-none w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-bold text-gray-900 cursor-pointer"
                        >
                          <option value="whey protein">Whey Protein</option>
                          <option value="mass gainer">Mass Gainer</option>
                          <option value="pre workout">Pre Workout</option>
                          <option value="creatine">Creatine</option>
                          <option value="vitamins">Vitamins</option>
                          <option value="accessories">Accessories</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing & Media */}
              <div className="lg:col-span-4 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6 relative">
                    Pricing & Setup
                    <span className="absolute bottom-[-1px] left-0 w-12 h-1 bg-[#ffbe00] rounded-full"></span>
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">Sale Price <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium group-focus-within:text-[#ffbe00]">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            name="currentPrice"
                            value={formData.currentPrice}
                            onChange={handleChange}
                            className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-bold text-gray-900"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">Original Price <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium group-focus-within:text-gray-900">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            name="originalPrice"
                            value={formData.originalPrice}
                            onChange={handleChange}
                            className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all font-medium text-gray-900"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">Discount Info</label>
                        <input
                          type="text"
                          name="discount"
                          value={formData.discount}
                          onChange={handleChange}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-medium text-gray-900"
                          placeholder="e.g. 25% Off"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">Badge Status</label>
                        <div className="relative">
                          <select
                            name="badge"
                            value={formData.badge}
                            onChange={handleChange}
                            className="appearance-none w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-bold text-gray-900 cursor-pointer"
                          >
                            <option value="New">New</option>
                            <option value="Sale">Sale</option>
                            <option value="Best Seller">Best Seller</option>
                            <option value="Hot">Hot</option>
                            <option value="Limited">Limited</option>
                            <option value="None">None</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">Product Image URL</label>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-medium text-gray-900"
                        placeholder="https://example.com/image.jpg"
                      />
                      
                      {/* Image Preview */}
                      {formData.image && (
                        <div className="mt-4 p-2 border-2 border-dashed border-gray-200 rounded-2xl flex justify-center bg-white h-48 overflow-hidden group">
                           <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-100 mt-10">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-bold tracking-wide"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-gradient-to-r from-[#ffbe00] to-[#e6ab00] text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 font-bold tracking-wide disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{actionText} Product</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (currentView === 'add') return renderProductForm(false);
  if (currentView === 'edit' && editingProduct) return renderProductForm(true);

  // PRODUCTS LIST VIEW
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 sm:p-8 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Product Catalog</h1>
            <p className="text-gray-500 mt-2 text-lg">Manage full product inventory, pricing, and visibility.</p>
          </div>
          <button 
            onClick={handleAddProduct}
            className="px-6 py-4 bg-gradient-to-r from-[#ffbe00] to-[#e6ab00] text-white rounded-2xl shadow-lg shadow-[#ffbe00]/20 hover:shadow-xl hover:shadow-[#ffbe00]/30 hover:-translate-y-1 transition-all flex items-center gap-2 font-bold tracking-wide group"
          >
            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Products */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package size={150} />
            </div>
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Package size={28} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Products</p>
            <p className="text-4xl font-black text-gray-900 tracking-tight">{products.length}</p>
          </div>

          {/* Active Categories */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Tag size={150} />
            </div>
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              <Tag size={28} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Active Categories</p>
            <p className="text-4xl font-black text-gray-900 tracking-tight">{getCategories().length}</p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-3/5 group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#ffbe00] transition-colors" />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-medium text-gray-700 placeholder-gray-400 tracking-wide"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative w-full lg:w-2/5">
              <Filter className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none pl-14 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#ffbe00]/10 focus:border-[#ffbe00] transition-all font-bold text-gray-700 cursor-pointer text-sm shadow-sm capitalize"
              >
                <option value="All Categories">All Categories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Product Grid / List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {filteredProducts.length > 0 ? (
            <div className="divide-y divide-gray-50/80">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-5 md:p-6 hover:bg-gray-50/50 transition-colors group">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    
                    {/* Image Area */}
                    <div className="w-full sm:w-28 h-40 sm:h-28 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center justify-center p-2 overflow-hidden flex-shrink-0 relative">
                      {product.badge && product.badge !== 'None' && (
                        <div className="absolute top-2 left-0 right-0 flex justify-center z-10">
                          <span className="bg-[#ffbe00] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-sm line-clamp-1 truncate max-w-[80%]">
                            {product.badge}
                          </span>
                        </div>
                      )}
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package className="w-10 h-10 text-gray-300 relative z-0" />
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide capitalize">
                          {product.item}
                        </span>
                        {product.discount && (
                          <span className="text-orange-600 font-bold text-xs bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                            {product.discount}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight truncate mb-1 pr-4">{product.title}</h3>
                      <p className="text-sm font-medium text-gray-500 line-clamp-1 mr-4">{product.subtitle}</p>
                      
                      <div className="mt-4 flex items-end gap-3 sm:hidden">
                        <span className="text-2xl font-black text-gray-900 leading-none">₹{product.price?.toLocaleString('en-IN')}</span>
                        {product.originalPriceValue > product.price && (
                          <span className="text-sm font-bold text-gray-400 line-through leading-none mb-0.5">₹{product.originalPriceValue?.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions and Pricing (Desktop right-aligned) */}
                    <div className="hidden sm:flex flex-col items-end gap-4 w-48 flex-shrink-0 border-l border-gray-100 pl-6 self-stretch justify-center">
                      <div className="text-right w-full">
                        {product.originalPriceValue > product.price && (
                          <div className="text-sm font-bold text-gray-400 line-through mb-1">₹{product.originalPriceValue?.toLocaleString('en-IN')}</div>
                        )}
                        <div className="text-3xl font-black text-[#ffbe00] tracking-tight leading-none">₹{product.price?.toLocaleString('en-IN')}</div>
                      </div>
                      
                      <div className="flex items-center gap-2 justify-end w-full mt-auto">
                        <button 
                          onClick={() => startEditProduct(product)}
                          className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold transition-all shadow-sm flex justify-center items-center gap-2"
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 rounded-xl transition-all shadow-sm"
                          title="Delete Product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Actions Mobile */}
                    <div className="sm:hidden flex items-center gap-2 w-full mt-2">
                       <button 
                          onClick={() => startEditProduct(product)}
                          className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold transition-all shadow-sm flex justify-center items-center gap-2"
                        >
                          <Edit size={16} /> Edit Product
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 size={20} />
                        </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                <Package className="text-gray-300 w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No products found</h3>
              <p className="text-gray-500 font-medium text-lg">Try adjusting your search criteria or add new products.</p>
              {searchTerm || categoryFilter !== 'All Categories' ? (
                 <button 
                  onClick={() => { setSearchTerm(''); setCategoryFilter('All Categories'); }}
                  className="mt-6 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold tracking-wide hover:bg-gray-50 transition-all shadow-sm"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
