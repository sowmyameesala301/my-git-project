
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const calculateOrderTotal = require("../utils/calculateOrderTotal");

// PLACE ORDER
exports.placeOrder = async (req, res) => {
    try {
        console.log("PLACE ORDER CONTROLLER HIT");

        const { deliveryAddress } = req.body;

        if (!deliveryAddress || !deliveryAddress.trim()) {
            return res.status(400).json({
                success: false,
                message: "Delivery address is required"
            });
        }

        // Find user's cart
        const cart = await Cart.findOne({
            user: req.user.id
        }).populate("items.menuItem");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        // Check item availability
        for (const item of cart.items) {
            if (!item.menuItem || !item.menuItem.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: "One or more items are unavailable"
                });
            }
        }

        // Check restaurant
        const restaurantIds = [
            ...new Set(
                cart.items.map(item =>
                    item.menuItem.restaurant.toString()
                )
            )
        ];

        if (restaurantIds.length > 1) {
            return res.status(400).json({
                success: false,
                message: "Items must belong to one restaurant"
            });
        }

        // Calculate order total
        const orderItems = cart.items.map(item => {
    const menu = item.menuItem;

    return {
        menuItem: menu._id,
        itemName: menu.name,
        unitPrice: menu.price,
        quantity: item.quantity,
        lineTotal: menu.price * item.quantity
    };
});

const subtotal = orderItems.reduce(
    (sum, item) => sum + item.lineTotal,
    0
);

const total = subtotal;
            console.log("CART ITEMS:", JSON.stringify(cart.items, null, 2));
            console.log("ORDER ITEMS:", JSON.stringify(orderItems, null, 2));

        console.log("GENERATED ORDER ITEMS:", orderItems);

        // Validate generated items
        if (!orderItems.length || orderItems.some(item =>
            !item.itemName ||
            item.unitPrice == null ||
            item.lineTotal == null
        )) {
            return res.status(400).json({
                success: false,
                message: "Invalid order items"
            });
        }

        // Create order
        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            subtotal,
            total,
            deliveryAddress
        });

        // Clear cart after successful order
        cart.items = [];
        await cart.save();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        console.error("PLACE ORDER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to place order",
            error: error.message
        });
    }
};

// GET ORDER HISTORY
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("GET ORDERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};

// GET SINGLE ORDER
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user.id
        }).populate("items.menuItem");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("GET SINGLE ORDER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch order",
            error: error.message
        });
    }
};
