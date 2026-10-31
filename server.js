
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors());

// ==================== DATABASE CONNECTION ====================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// ==================== RESTAURANT MODEL ====================
const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    cuisineTypes: {
      type: [String],
      default: []
    },
    address: {
      type: String,
      required: [true, 'Restaurant address is required'],
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const menuItemRoutes = require('./routes/menuItemRoutes');

// ==================== CONTROLLERS & ROUTES ====================
const router = express.Router();

// Create Restaurant
router.post('/', async (req, res) => {
  try {
    const { name, description, cuisineTypes, address, phone, isActive } = req.body;
    if (!name || !address) {
      return res.status(400).json({ success: false, message: 'Name and address are required fields.' });
    }
    const restaurant = await Restaurant.create({ name, description, cuisineTypes, address, phone, isActive });
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get All Restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get Restaurant By ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Malformed restaurant ID.' });
    }
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update Restaurant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Malformed restaurant ID.' });
    }
    const allowedFields = ['name', 'description', 'cuisineTypes', 'address', 'phone', 'isActive'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    const restaurant = await Restaurant.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Delete Restaurant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Malformed restaurant ID.' });
    }
    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }
    res.status(200).json({ success: true, message: 'Restaurant deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.use('/api/restaurants', router);
app.use('/api/menu-items', menuItemRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to FoodieGo API - Assignment 2' });
});

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});