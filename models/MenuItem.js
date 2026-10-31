
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    price: {
        type: Number,
        required: true,
        min: 0.01
    },

    category: {
        type: String,
        required: true,
        enum: [
            "Starters",
            "Main Course",
            "Desserts",
            "Beverages"
        ]
    },

    imageUrl: {
        type: String
    },

    isAvailable: {
        type: Boolean,
        default: true
    },

    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
