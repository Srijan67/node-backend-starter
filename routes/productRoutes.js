const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
} = require("../controller/productController");
const router = express.Router();
var { expressjwt: jwt } = require("express-jwt");
const { jwtObj } = require("../config/request");
/**
 * @swagger
 * /api/v1/products:
 *  get:
 *    summary: To get all products
 *    description: this api is use to fetch data from mongodb
 *    responses:
 *      200:
 *        description: success
 */
router.route("/products").get(getAllProducts);
router.route("/product/new").post(createProduct);
router
  .route("/product/:id")
  .put(updateProduct)
  .delete(deleteProduct)
  .get(getProduct);
module.exports = router;
router.route("/test").get(async (req, res, next) => {
  return res.send("API is Running...v1.0!");
});
//express-jwt implementation example
router.route("/testAuth").get(jwt(jwtObj), async (req, res, next) => {
  return res.send("API is Running...");
});
