const express = require("express");
const router = express.Router();
const { jwtObj } = require("../config/request");
const { expressjwt: jwt } = require("express-jwt");

const {
  createUser,
  getAllUser,
  getAdmin,
  login,
  restrictTo,
  uploadImage,
  updateUserImage,
  deleteUploadImage,
  updateUser,
  updateUserPassword,
  deleteUser,
} = require("../controller/userController");

router.route("/user/new").post(createUser);
router.route("/login").post(login);

router.get("/users", getAllUser);

// protected routes
router.use(jwt({ ...jwtObj }));

// protect the route only login user can access
router.patch("/updateUser", updateUser);
router.patch("/updateUserPassword", updateUserPassword);
router.post("/upload", uploadImage, updateUserImage);
router.delete("/deleteUser", deleteUser);
router.delete("/deleteUploadImage", deleteUploadImage);

// protect and restrict to only admin
router.get("/user", restrictTo("admin"), getAdmin);

module.exports = router;
