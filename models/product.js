const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter product name"],
    },
    description: {
      type: String,
      required: [true, "Please Enter product description"],
    },
    price: {
      type: Number,
      required: [true, "Please Enter product price"],
      maxLength: [8, "Price cannot exceed 8 digits"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Please Enter Product Category"],
    },
    stock: {
      type: Number,
      required: [true, "Please Enter Stock"],
      default: 1,
      maxLength: [4, "Stock cannot exceed 4 digits"],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamp: true,
  }
);
module.exports = mongoose.model("Product", ProductSchema);
