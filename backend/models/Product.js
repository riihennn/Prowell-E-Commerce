const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  price: {
    type: Number,
    required: true
  },

  originalPrice: {
    type: Number
  },

  discount: {
    type: String
  },

  badge: {
    type: String
  },

  image: {
    type: String
  },

  category: {
    type: String
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);