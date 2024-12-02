const express = require('express');
const {
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    getAllAppointments,
    getUserAppointments,
    getSingleAppointment,
    deleteAppointment,
} = require('../controllers/appointments');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Public route to book an appointment
router.post('/book', bookAppointment);

// Protected route for users to get their appointments by email
router.get('/user', protect, getUserAppointments);

// Admin-protected route to get all appointments
router.get('/', protect, admin, getAllAppointments);

// Protected route to get a single appointment
router.get('/:id', protect, getSingleAppointment);

// Admin or user-protected route to reschedule an appointment
router.put('/reschedule/:id', rescheduleAppointment);

// Admin or user-protected route to cancel an appointment
router.patch('/cancel/:id', protect, cancelAppointment);

// Admin-protected route to delete an appointment
router.delete('/:id', protect, admin, deleteAppointment);

module.exports = router;
