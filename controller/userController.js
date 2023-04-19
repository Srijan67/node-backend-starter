const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const bcrypt = require("bcryptjs");
const multer = require("multer");

// config mutlterstroage and multerfilter

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
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
    { _id: req.user._id },
    { image: req.file.filename },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "image upload successfully",
    user,
  });
});

exports.deleteUploadImage = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { image: "default.jpeg" },
    { new: true }
  );

  res.status(200).json({
    message: "image deleted successfully",
  });
});

exports.createUser = catchAsyncErrors(async (req, res, next) => {
  let data = await User.create(req.body);
  const token = jwt.sign({ id: data._id }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRY,
  });
  if (data) {
    return res.status(200).json({
      success: true,
      message: "user created successfully",
      token,
      data,
    });
  } else {
    return next(ErrorHandler("User Not Registered", 404));
  }
});
exports.getUser = catchAsyncErrors(async (req, res) => {
  let data = await User.find();

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
    status: "success",
    token,
    message: "login successfully",
    data: {
      user,
    },
  });
});

exports.protect = catchAsyncErrors(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // console.log("🔥", req.headers.authorization);
    token = req.headers.authorization.split(" ")[2];
  }

  if (!token) {
    return next(
      new ErrorHandler(
        "You are not logged in! Please log in to get access.",
        401
      )
    );
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.SECRET_KEY);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new ErrorHandler(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...userTypes) => {
  return (req, res, next) => {
    // roles ['admin', 'user','operator']
    if (!userTypes.includes(req.user.userType)) {
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
