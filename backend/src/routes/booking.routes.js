const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Reservation
router.post('/reserve', bookingController.reserveSlot);

router.post('/', bookingController.createBookingWithPayment);
router.post('/checkout', bookingController.endBooking);
router.get('/me', bookingController.getMyBookings);
router.get('/my', bookingController.getMyBookings); // Mobile compatibility alias

module.exports = router;
