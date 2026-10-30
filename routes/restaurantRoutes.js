
const express = require('express');
const router = express.Router();

const restaurantController = require('../controllers/restaurantController');

// CREATE restaurant
router.post('/', restaurantController.createRestaurant);

// GET all restaurants
router.get('/', restaurantController.getRestaurants);

// GET restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// UPDATE restaurant by ID
router.put('/:id', restaurantController.updateRestaurant);

// DELETE restaurant by ID
router.delete('/:id', restaurantController.deleteRestaurant);

module.exports = router;
