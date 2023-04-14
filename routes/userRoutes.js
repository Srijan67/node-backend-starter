const express = require("express");
const router = express.Router();
var { expressjwt: jwt } = require("express-jwt");
const { jwtObj } = require("../config/request");
const {
  createUser,
  getUser,
  getAdmin,
} = require("../controller/userController");
router.route("/user/new").post(createUser);
router.route("/users").get(getUser);
router.route("/user").get(getAdmin);
module.exports = router;
