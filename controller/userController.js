const User = require("../models/user");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const bcrypt = require("bcryptjs");
const multer = require("multer");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// config mutlterstroage and multerfilter
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.auth.id}-${Date.now()}.${ext}`);
  },
});

// check the uploads file whether it is image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ErrorHandler("Not a Image!Please provide valid image", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImage = upload.single("image");

exports.updateUserImage = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.file);

  const user = await User.findOneAndUpdate(
    { _id: req.auth.id },
    { image: req.file.filename },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "image upload successfully",
    user,
  });
});

exports.deleteUploadImage = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.auth.id },
    { image: "default.jpeg" },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "image deleted successfully",
  });
});

exports.createUser = catchAsyncErrors(async (req, res, next) => {
  const data = await User.create(req.body);

  if (data) {
    return res.status(200).json({
      success: true,
      message: "user created successfully",
      data,
    });
  } else {
    return next(ErrorHandler("User Not Registered", 404));
  }
});
exports.getAllUser = catchAsyncErrors(async (req, res) => {
  let data = await User.find();

  res.status(200).json({
    ...data,
  });
});
exports.getAdmin = catchAsyncErrors(async (req, res, next) => {
  let data = await User.find({ userType: "admin" });
  res.status(200).json({
    success: true,
    data,
    total: data.length,
  });
});

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password) {
    return next(
      new ErrorHandler(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    "name",
    "email",
    "userName",
    "mobile"
  );
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.auth.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!bcrypt.compareSync(req.body.passwordCurrent, user.password)) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  await user.save();

  res.status(201).json({
    success: true,
    message: "password updated successfully",
  });
});

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  await User.findByIdAndDelete(req.auth.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, userName, mobile, password } = req.body;

  // Check if email/username/phone exists in users array
  const user = await User.findOne({
    $or: [{ email }, { userName }, { mobile }],
  });

  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  // Check if password is correct
  if (!bcrypt.compareSync(password, user.password)) {
    return next(new ErrorHandler("Invalid  password", 400));
  }

  // Generate JWT token
  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  // Return token to client
  return res.json({
    success: true,
    message: "login successfully",
    token,
    user,
  });
});

exports.restrictTo = (...userTypes) => {
  return async (req, res, next) => {
    const currentUser = await User.findById(req.auth.id);

    console.log(currentUser);
    if (!currentUser) {
      return next(
        new ErrorHandler(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }

    if (!userTypes.includes(currentUser.userType)) {
      return next(
        new ErrorHandler(
          "You do not have permission to perform this action",
          403
        )
      );
    }
    next();
  };
};
