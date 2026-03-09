import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save,
  X,
  ArrowLeft
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  // View states
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit'
  
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
      const baseUrl = "http://localhost:8000/api";
      const response = await fetch(`${baseUrl}/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the products data
      const transformedProducts = data.map(product => ({
        ...product,
        price: parseInt(product.currentPrice),
        originalPriceValue: parseInt(product.originalPrice)
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || product.item === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.item))];
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
    
    try {
      const productToAdd = {
        title: newProduct.title,
        subtitle: newProduct.subtitle,
        item: newProduct.item,
        currentPrice: (parseFloat(newProduct.currentPrice) * 100).toString(),
        originalPrice: (parseFloat(newProduct.originalPrice) * 100).toString(),
        discount: newProduct.discount,
        image: newProduct.image || '/api/placeholder/80/80',
        badge: newProduct.badge
      };

      const baseUrl = "http://localhost:8000/api";
      const response = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productToAdd)
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      const addedProduct = await response.json();
      
      // Refresh products list
      await fetchProducts();
      
      // Reset form and go back to list
      setCurrentView('list');
      alert('Product added successfully!');
      
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const cancelAddProduct = () => {
    setCurrentView('list');
  };

  // EDIT PRODUCT FUNCTIONS
  const startEditProduct = (product) => {
    setEditingProduct({
      ...product,
      currentPrice: (product.price).toString(),
      originalPrice: (product.originalPriceValue).toString()
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
    
    try {
      const productToUpdate = {
        title: editingProduct.title,
        subtitle: editingProduct.subtitle,
        item: editingProduct.item,
        currentPrice: (parseFloat(editingProduct.currentPrice) * 100).toString(),
        originalPrice: (parseFloat(editingProduct.originalPrice) * 100).toString(),
        discount: editingProduct.discount,
        image: editingProduct.image,
        badge: editingProduct.badge
      };

      const baseUrl = "http://localhost:8000/api";
      const response = await fetch(`${baseUrl}/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productToUpdate)
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      // Refresh products list
      await fetchProducts();
      
      // Reset and go back to list
      setEditingProduct(null);
      setCurrentView('list');
      alert('Product updated successfully!');
      
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const cancelEditProduct = () => {
    setEditingProduct(null);
    setCurrentView('list');
  };

  // DELETE PRODUCT
  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const baseUrl = "http://localhost:8000/api";
      const response = await fetch(`${baseUrl}/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Refresh products list
      await fetchProducts();
      alert('Product deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2eb4ac] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Products</h2>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // ADD PRODUCT VIEW
  if (currentView === 'add') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={cancelAddProduct}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600">Fill in the details to add a new product</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={submitAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  name="title"
                  value={newProduct.title}
                  onChange={handleAddFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={newProduct.subtitle}
                  onChange={handleAddFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="item"
                  value={newProduct.item}
                  onChange={handleAddFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                >
                  <option value="whey protein">Whey Protein</option>
                  <option value="mass gainer">Mass Gainer</option>
                  <option value="pre workout">Pre Workout</option>
                  <option value="creatine">Creatine</option>
                  <option value="vitamins">Vitamins</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="currentPrice"
                  value={newProduct.currentPrice}
                  onChange={handleAddFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="originalPrice"
                  value={newProduct.originalPrice}
                  onChange={handleAddFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                <input
                  type="text"
                  name="discount"
                  placeholder="e.g., 20% off"
                  value={newProduct.discount}
                  onChange={handleAddFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                <select
                  name="badge"
                  value={newProduct.badge}
                  onChange={handleAddFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                >
                  <option value="New">New</option>
                  <option value="Sale">Sale</option>
                  <option value="Hot">Hot</option>
                  <option value="">None</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={newProduct.image}
                  onChange={handleAddFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-[#2eb4ac] text-white rounded-lg hover:bg-[#269c94] transition-colors flex items-center space-x-2 font-medium"
              >
                <Save size={20} />
                <span>Add Product</span>
              </button>
              <button
                type="button"
                onClick={cancelAddProduct}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 font-medium"
              >
                <X size={20} />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // EDIT PRODUCT VIEW
  if (currentView === 'edit' && editingProduct) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={cancelEditProduct}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product details</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={submitEditProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  name="title"
                  value={editingProduct.title}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={editingProduct.subtitle}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="item"
                  value={editingProduct.item}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                >
                  {getCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="currentPrice"
                  value={editingProduct.currentPrice}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="originalPrice"
                  value={editingProduct.originalPrice}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                <input
                  type="text"
                  name="discount"
                  value={editingProduct.discount}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                <select
                  name="badge"
                  value={editingProduct.badge}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                >
                  <option value="New">New</option>
                  <option value="Sale">Best Seller</option>
                  <option value="Hot">Best On Demand</option>
                  <option value="">None</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={editingProduct.image}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-[#2eb4ac] text-white rounded-lg hover:bg-[#269c94] transition-colors flex items-center space-x-2 font-medium"
              >
                <Save size={20} />
                <span>Update Product</span>
              </button>
              <button
                type="button"
                onClick={cancelEditProduct}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 font-medium"
              >
                <X size={20} />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // PRODUCTS LIST VIEW
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory and listings</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="px-4 py-2 bg-[#2eb4ac] text-white rounded-lg hover:bg-[#269c94] transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <Package size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {getCategories().length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <Package size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb4ac] focus:border-transparent"
            >
              <option>All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                          <div className="text-sm text-gray-500">{product.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.item}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{product.price}</div>
                      {product.originalPriceValue > product.price && (
                        <div className="text-sm text-gray-500 line-through">₹{product.originalPriceValue}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => startEditProduct(product)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No products found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;

