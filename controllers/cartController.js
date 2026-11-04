
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");

// GET CART
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({
            user: req.user.id
        }).populate("items.menuItem");

        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }

        res.status(200).json({
            message: "Cart fetched successfully",
            cart
        });

} catch (error) {
    console.error("GET CART ERROR:", error);

    res.status(500).json({
        success: false,
        message: "Failed to fetch cart",
        error: error.message
    });
}
};

// ADD ITEM
exports.addItem = async (req, res) => {
    try {
        const { menuItemId, quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive integer"
            });
        }

        const menuItem = await MenuItem.findById(menuItemId);

        if (!menuItem || !menuItem.isAvailable) {
            return res.status(404).json({
                message: "Menu item unavailable"
            });
        }

        let cart = await Cart.findOne({
            user: req.user.id
        });

        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        const existingItem = cart.items.find(
            item => item.menuItem.toString() === menuItemId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                menuItem: menuItemId,
                quantity
            });
        }

        await cart.save();
        await cart.populate("items.menuItem");

        res.status(200).json({
            message: "Item added successfully",
            cart
        });

    } catch (error) {
        console.error("ADD ITEM ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add item",
            error: error.message
        });
    }
};


// UPDATE QUANTITY
exports.updateItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { menuItemId } = req.params;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: "Invalid quantity"
            });
        }

        const cart = await Cart.findOne({
            user: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            item => item.menuItem.toString() === menuItemId
        );

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        item.quantity = quantity;
        await cart.save();

        res.status(200).json({
            message: "Quantity updated successfully",
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update quantity"
        });
    }
};

// REMOVE ITEM
exports.removeItem = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        cart.items = cart.items.filter(
            item => item.menuItem.toString() !== req.params.menuItemId
        );

        await cart.save();

        res.status(200).json({
            message: "Item removed successfully",
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to remove item"
        });
    }
};

// CLEAR CART
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            message: "Cart cleared successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to clear cart"
        });
    }
};
