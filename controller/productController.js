const Product = require("../models/product");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
//create a product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//get all products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  const apiFeature = new ApiFeatures(Product.find(), req.query).search();
  const product = await apiFeature.query;
  res.status(200).json({ success: true, product });
});

//update product
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("No Product Found", 404));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({ success: true, product });
});

//delete a product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("No Product Found", 404));
  }
  await product.remove();
  res.status(200).json({
    success: true,
    message: "Product deleted successfully!",
  });
});

//get single product
exports.getProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("No Product Found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});
