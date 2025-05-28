const bookingServiceService = require('../services/bookingService.service');
const {
  createMultipleBookingServicesSchema,
  getBookingServiceByIdSchema,
  updateBookingServiceSchema,
} = require('../validations/bookingService.validation');

const createMultipleBookingServices = async (request, h) => {
  try {
    const data = createMultipleBookingServicesSchema.parse(request.payload);
    const bookingServices = data.serviceIds.map(serviceId => ({
      bookingId: data.bookingId,
      serviceId,
    }));

    const result = await bookingServiceService.createBookingServices(bookingServices);
    return h.response(result).code(201);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const getAllBookingServices = async (request, h) => {
  const bookingServices = await bookingServiceService.getAllBookingServices();
  return h.response(bookingServices);
};

const getBookingServiceById = async (request, h) => {
  try {
    const { id } = getBookingServiceByIdSchema.parse(request.params);
    const bookingService = await bookingServiceService.getBookingServiceById(id);
    if (!bookingService) return h.response({ error: 'BookingService not found' }).code(404);
    return h.response(bookingService);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const deleteBookingService = async (request, h) => {
  try {
    const { id } = getBookingServiceByIdSchema.parse(request.params);
    const deleted = await bookingServiceService.deleteBookingService(id);
    return h.response(deleted);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const updateBookingService = async (request, h) => {
  try {
    const data = updateBookingServiceSchema.parse({ id: Number(request.params.id), ...request.payload });
    const updated = await bookingServiceService.updateBookingService(data.id, data);
    return h.response(updated);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

module.exports = {
  createMultipleBookingServices,
  getAllBookingServices,
  getBookingServiceById,
  deleteBookingService,
  updateBookingService,
};
