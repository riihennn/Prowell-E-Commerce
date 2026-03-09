const Product = require("../models/Product");

// GET all products — supports ?search=&category=&sort=&page=&limit=
exports.getProducts = async (req, res) => {
  try {
    const resultPerPage = Number(req.query.limit) || 12;
    const currentPage  = Number(req.query.page)  || 1;

    // Pull out control params, everything left in `rest` goes to filter
    const { search, category, page, limit, sort, ...rest } = req.query;

    // Start with any remaining fields (e.g. price[gte], price[lte])
    let filterObj = { ...rest };

    // Convert price[gte]/price[lte] → MongoDB $gte/$lte operators
    let filterStr = JSON.stringify(filterObj);
    filterStr = filterStr.replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`);
    filterObj = JSON.parse(filterStr);

    // Case-insensitive category filter (handles DB typo where field is "category:")
    if (category) {
      const regex = { $regex: `^${category}$`, $options: "i" };
      // User's DB has a typo where the key is "category:" instead of "category"
      // We use $or so it works now, and still works if they fix the DB later
      filterObj.$or = [
        { category: regex },
        { "category:": regex }
      ];
    }

    // Case-insensitive name search
    if (search) {
      filterObj.name = { $regex: search, $options: "i" };
    }

    // Count filtered total (for pagination)
    const total = await Product.countDocuments(filterObj);

    // Sort
    let sortObj = { createdAt: -1 };
    if (sort) {
      sortObj = {};
      sort.split(",").forEach((field) => {
        sortObj[field.replace(/^-/, "")] = field.startsWith("-") ? -1 : 1;
      });
    }

    const products = await Product.find(filterObj)
      .sort(sortObj)
      .limit(resultPerPage)
      .skip(resultPerPage * (currentPage - 1));

    console.log(`[getProducts] category=${category} search=${search} total=${total} returned=${products.length}`);

    res.json({
      success: true,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / resultPerPage),
      limit: resultPerPage,
      products,
    });
  } catch (error) {
    console.error("getProducts error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// GET distinct categories from DB
exports.getCategories = async (req, res) => {
  try {
    // Check both standard 'category' and typo 'category:'
    const categories1 = await Product.distinct("category");
    
    // Mongoose schema doesn't define "category:", so we use the raw collection
    const categories2 = await Product.collection.distinct("category:");
    
    // Merge, filter out nulls/empties, sort alphabetically, and make unique
    const merged = Array.from(new Set([...categories1, ...categories2]));
    const sorted = merged.filter(Boolean).sort();
    
    console.log("[getCategories] returning:", sorted);
    res.json({ success: true, categories: sorted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single product
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};