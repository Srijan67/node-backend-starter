const User = require("../models/user");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const { TableFilterQuery } = require("sz-node-utils");

exports.createUser = catchAsyncErrors(async (req, res, next) => {
  let data = await User.create(req.body);
  if (data) {
    return res.status(200).json({
      data,
      success: true,
    });
  } else {
    return next(ErrorHandler("User Not Registered", 404));
  }
});
exports.getUser = catchAsyncErrors(async (req, res) => {
  //   let data = await User.find();
  let data = await TableFilterQuery(User, { userType: "admin", ...req.query });
  res.status(200).json({
    ...data,
  });
});
exports.getAdmin = catchAsyncErrors(async (req, res, next) => {
  let data = await User.find({ userType: "admin" });
  res.status(200).json({
    data,
    total: data.length,
    success: true,
  });
});
