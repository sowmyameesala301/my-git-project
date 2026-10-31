
const express = require("express");

const router = express.Router();

const {
    createMenuItem,
    getAllMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem
} = require("../controllers/menuItemController");

// CREATE MENU ITEM
router.post("/", createMenuItem);

// GET ALL MENU ITEMS
router.get("/", getAllMenuItems);

// GET MENU ITEM BY ID
router.get("/:id", getMenuItemById);

// UPDATE MENU ITEM
router.patch("/:id", updateMenuItem);

// DELETE MENU ITEM
router.delete("/:id", deleteMenuItem);

module.exports = router;
