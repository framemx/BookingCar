const bookingSlotController = require('../controllers/bookingSlot.controller');

module.exports = [
  {
    method: 'POST',
    path: '/booking-slots',
    handler: bookingSlotController.createBookingSlot,
  },
  {
    method: 'GET',
    path: '/booking-slots',
    handler: bookingSlotController.getAllBookingSlots,
  },
  {
    method: 'GET',
    path: '/booking-slots/{id}',
    handler: bookingSlotController.getBookingSlotById,
  },
  {
    method: 'DELETE',
    path: '/booking-slots/{id}',
    handler: bookingSlotController.deleteBookingSlot,
  },
  {
    method: 'PUT',
    path: '/booking-slots/{id}',
    handler: bookingSlotController.updateBookingSlot,
  },
];
