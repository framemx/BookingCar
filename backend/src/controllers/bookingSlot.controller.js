const bookingSlotService = require('../services/bookingSlot.service');
const { createBookingSlotSchema, getBookingSlotByIdSchema, updateBookingSlotSchema } = require('../validations/bookingSlot.validation');

const createBookingSlot = async (request, h) => {
  try {
    const data = createBookingSlotSchema.parse(request.payload);
    const bookingSlot = await bookingSlotService.createBookingSlot(data);
    return h.response(bookingSlot).code(201);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const getAllBookingSlots = async (request, h) => {
  const bookingSlots = await bookingSlotService.getAllBookingSlots();
  return h.response(bookingSlots);
};

const getBookingSlotById = async (request, h) => {
  try {
    const { id } = getBookingSlotByIdSchema.parse(request.params);
    const bookingSlot = await bookingSlotService.getBookingSlotById(id);
    if (!bookingSlot) return h.response({ error: 'BookingSlot not found' }).code(404);
    return h.response(bookingSlot);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const deleteBookingSlot = async (request, h) => {
  try {
    const { id } = getBookingSlotByIdSchema.parse(request.params);
    const deleted = await bookingSlotService.deleteBookingSlot(id);
    return h.response(deleted);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const updateBookingSlot = async (request, h) => {
  try {
    const data = updateBookingSlotSchema.parse({ id: Number(request.params.id), ...request.payload });
    const updated = await bookingSlotService.updateBookingSlot(data.id, data);
    return h.response(updated);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

module.exports = {
  createBookingSlot,
  getAllBookingSlots,
  getBookingSlotById,
  deleteBookingSlot,
  updateBookingSlot,
};
