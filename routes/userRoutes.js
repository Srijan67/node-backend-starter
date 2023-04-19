const express = require("express");
const router = express.Router();
var { expressjwt: jwt } = require("express-jwt");
const { jwtObj } = require("../config/request");
const multer = require("multer");
const {
  createUser,
  getUser,
  getAdmin,
  login,
  protect,
  restrictTo,
  uploadImage,
  updateUserImage,
  deleteUploadImage,
} = require("../controller/userController");

router.route("/user/new").post(createUser);

// protect the route only login user can access
router.get("/users", protect, getUser);

// protect and restrict to only admin
router.get("/user", protect, restrictTo("admin"), getAdmin);

router.route("/login").post(login);

router.post("/upload", protect, uploadImage, updateUserImage);

router.delete("/deleteUploadImage", protect, deleteUploadImage);

module.exports = router;
