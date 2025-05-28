const bookingServiceController = require('../controllers/bookingService.controller');

module.exports = [
  {
    method: 'POST',
    path: '/booking-services',
    handler: bookingServiceController.createMultipleBookingServices,
  },
  {
    method: 'GET',
    path: '/booking-services',
    handler: bookingServiceController.getAllBookingServices,
  },
  {
    method: 'GET',
    path: '/booking-services/{id}',
    handler: bookingServiceController.getBookingServiceById,
  },
  {
    method: 'DELETE',
    path: '/booking-services/{id}',
    handler: bookingServiceController.deleteBookingService,
  },
  {
    method: 'PUT',
    path: '/booking-services/{id}',
    handler: bookingServiceController.updateBookingService,
  },
];
