const bookingService = require('../services/booking.service');
const {
  createBookingSchema,
  getBookingByIdSchema,
  updateBookingSchema,
  updateBookingStatusSchema, // ✅ เพิ่ม schema สำหรับ PATCH
} = require('../validations/booking.validation');

// ✅ Create Booking
const createBooking = async (request, h) => {
  try {
    const data = createBookingSchema.parse(request.payload);
    const booking = await bookingService.createBooking(data);
    return h.response(booking).code(201);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

// ✅ Get All Bookings
const getAllBookings = async (request, h) => {
  const bookings = await bookingService.getAllBookings();
  return h.response(bookings);
};

// ✅ Get Booking by ID
const getBookingById = async (request, h) => {
  try {
    const { id } = getBookingByIdSchema.parse(request.params);
    const booking = await bookingService.getBookingById(id);
    if (!booking) return h.response({ error: 'Booking not found' }).code(404);
    return h.response(booking);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

// ✅ Update Booking (full update)
const updateBooking = async (request, h) => {
  try {
    const { id } = getBookingByIdSchema.parse(request.params);
    const data = updateBookingSchema.parse(request.payload);
    const updatedBooking = await bookingService.updateBooking(id, data);
    return h.response(updatedBooking);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

// ✅ Delete Booking
const deleteBooking = async (request, h) => {
  try {
    const { id } = getBookingByIdSchema.parse(request.params);
    const deleted = await bookingService.deleteBooking(id);
    return h.response(deleted);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

// ✅ NEW: Update Booking Status (PATCH)
const updateBookingStatus = async (request, h) => {
  try {
    const { id } = getBookingByIdSchema.parse(request.params);
    const { status } = updateBookingStatusSchema.parse(request.payload);
    const updatedBooking = await bookingService.updateBooking(id, { status });
    return h.response(updatedBooking);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};


// ✅ Export
module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateBookingStatus, // เพิ่มเข้า module exports
};
