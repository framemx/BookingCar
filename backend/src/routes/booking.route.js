const bookingController = require('../controllers/booking.controller');

module.exports = [
  {
    method: 'POST',
    path: '/bookings',
    handler: bookingController.createBooking,
  },
  {
    method: 'GET',
    path: '/bookings',
    handler: bookingController.getAllBookings,
  },
  {
    method: 'GET',
    path: '/bookings/{id}',
    handler: bookingController.getBookingById,
  },
  {
    method: 'PUT',
    path: '/bookings/{id}',
    handler: bookingController.updateBooking,
  },
  {
    method: 'PATCH',
    path: '/bookings/{id}',
    handler: bookingController.updateBookingStatus, // ✅ เพิ่มฟังก์ชันนี้ใน controller
  },
  {
    method: 'DELETE',
    path: '/bookings/{id}',
    handler: bookingController.deleteBooking,
  },
];
