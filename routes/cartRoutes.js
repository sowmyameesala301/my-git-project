
const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

// Protect all cart routes
router.use(authMiddleware);

// Get Cart
router.get("/", cartController.getCart);

// Add Item
router.post("/items", cartController.addItem);

// Update Quantity
router.patch("/items/:menuItemId", cartController.updateItem);

// Remove Item
router.delete("/items/:menuItemId", cartController.removeItem);

// Clear Cart
router.delete("/", cartController.clearCart);

module.exports = router;
