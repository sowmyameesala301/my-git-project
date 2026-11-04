
const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

// Protect all order routes
router.use(authMiddleware);

// Place Order
router.post("/", orderController.placeOrder);

// Get Order History
router.get("/", orderController.getOrders);

// Get Order Details
router.get("/:id", orderController.getOrderById);

module.exports = router;
