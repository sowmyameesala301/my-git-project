
const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");

const Restaurant =
    mongoose.models.Restaurant ||
    require("../models/Restaurant");

// 1. CREATE MENU ITEM
exports.createMenuItem = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            imageUrl,
            isAvailable,
            restaurant
        } = req.body;

        if (
            !name ||
            typeof name !== "string" ||
            !name.trim() ||
            price === undefined ||
            !category ||
            !restaurant
        ) {
            return res.status(400).json({
                message: "Please provide all required fields"
            });
        }

        if (typeof price !== "number" || price <= 0 || !Number.isFinite(price)) {
            return res.status(400).json({
                message: "Price must be a positive number"
            });
        }

        if (typeof category !== "string" || !category.trim()) {
            return res.status(400).json({
                message: "Valid category is required"
            });
        }

        if (!mongoose.isValidObjectId(restaurant)) {
            return res.status(400).json({
                message: "Invalid restaurant ID"
            });
        }

        const restaurantExists =
            await Restaurant.findById(restaurant);

        if (!restaurantExists) {
            return res.status(404).json({
                message: "Restaurant not found"
            });
        }

        const menuItem = await MenuItem.create({
            name,
            description,
            price,
            category,
            imageUrl,
            isAvailable,
            restaurant
        });

        res.status(201).json({
            message: "Menu item created successfully",
            data: menuItem
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid menu item details"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};


// 2. GET ALL MENU ITEMS
// FILTERING + SORTING + PAGINATION
exports.getAllMenuItems = async (req, res) => {
    try {
        const {
            restaurantId,
            category,
            isAvailable,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        // Validate restaurant ID
        if (
            restaurantId &&
            !mongoose.isValidObjectId(restaurantId)
        ) {
            return res.status(400).json({
                message: "Invalid restaurant ID"
            });
        }

        // Validate availability
        if (
            isAvailable !== undefined &&
            !["true", "false"].includes(isAvailable)
        ) {
            return res.status(400).json({
                message: "isAvailable must be true or false"
            });
        }

        // Validate sorting options
        const sortOptions = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            name_asc: { name: 1 },
            name_desc: { name: -1 }
        };

        if (sort && !sortOptions[sort]) {
            return res.status(400).json({
                message: "Invalid sort option"
            });
        }

        // Validate pagination
        const currentPage = Number(page);
        const pageLimit = Number(limit);

        if (
            !Number.isInteger(currentPage) ||
            !Number.isInteger(pageLimit) ||
            currentPage < 1 ||
            pageLimit < 1 ||
            pageLimit > 50
        ) {
            return res.status(400).json({
                message: "Invalid page or limit. Maximum limit is 50."
            });
        }

        // Build filters
        const filter = {};

        if (restaurantId) {
            filter.restaurant = restaurantId;
        }

        if (category) {
            filter.category = category;
        }

        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === "true";
        }

        // Count total matching items
        const totalItems =
            await MenuItem.countDocuments(filter);

        // Fetch menu items
        const menuItems = await MenuItem.find(filter)
            .populate("restaurant", "name")
            .sort(sortOptions[sort] || { createdAt: -1 })
            .skip((currentPage - 1) * pageLimit)
            .limit(pageLimit);

        res.status(200).json({
            success: true,
            currentPage,
            totalPages: Math.ceil(totalItems / pageLimit),
            totalItems,
            items: menuItems
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch menu items"
        });
    }
};


// 3. GET MENU ITEM BY ID
exports.getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid menu item ID"
            });
        }

        const menuItem = await MenuItem.findById(id)
            .populate("restaurant", "name");

        if (!menuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            data: menuItem
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch menu item"
        });
    }
};


// 4. UPDATE MENU ITEM
exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid menu item ID"
            });
        }

        const allowedFields = [
            "name",
            "description",
            "price",
            "category",
            "imageUrl",
            "isAvailable",
            "restaurant"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (
                Object.prototype.hasOwnProperty.call(req.body, field)
            ) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields to update"
            });
        }

        // Validate updated price
        if (
            updates.price !== undefined &&
            (
                typeof updates.price !== "number" ||
                !Number.isFinite(updates.price) ||
                updates.price <= 0
            )
        ) {
            return res.status(400).json({
                message: "Price must be a positive number"
            });
        }

        // Validate updated name
        if (
            updates.name !== undefined &&
            (
                typeof updates.name !== "string" ||
                !updates.name.trim()
            )
        ) {
            return res.status(400).json({
                message: "Name cannot be empty"
            });
        }

        // Validate updated restaurant
        if (updates.restaurant !== undefined) {
            if (!mongoose.isValidObjectId(updates.restaurant)) {
                return res.status(400).json({
                    message: "Invalid restaurant ID"
                });
            }

            const restaurantExists =
                await Restaurant.exists({
                    _id: updates.restaurant
                });

            if (!restaurantExists) {
                return res.status(404).json({
                    message: "Restaurant not found"
                });
            }
        }

        const menuItem = await MenuItem.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!menuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            message: "Menu item updated successfully",
            data: menuItem
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid menu item update"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};


// 5. DELETE MENU ITEM
exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid menu item ID"
            });
        }

        const menuItem = await MenuItem.findByIdAndDelete(id);

        if (!menuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            message: "Menu item deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete menu item"
        });
    }
};
