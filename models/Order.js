
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem"
        },

        itemName: {
          type: String,
          required: true
        },

        unitPrice: {
          type: Number,
          required: true
        },

        quantity: {
          type: Number,
          required: true,
          min: 1
        },

        lineTotal: {
          type: Number,
          required: true
        }
      }
    ],

    subtotal: {
      type: Number,
      required: true
    },

    total: {
      type: Number,
      required: true
    },

    deliveryAddress: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled"
      ],
      default: "placed"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", orderSchema);
