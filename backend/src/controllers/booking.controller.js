// src/controllers/booking.controller.js
const bookingService = require('../services/booking.service');
const {
  createBookingSchema,
  getBookingByIdSchema,
  updateBookingSchema,
  updateBookingStatusSchema,
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
  const { userEmail, userId } = request.query;

  if (userEmail) {
    return await bookingService.getBookingsByEmail(userEmail);
  }

  if (userId) {
    return await bookingService.getBookingsByUserId(Number(userId));
  }

  return await bookingService.getAllBookings();
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
    const { id } = getBookingByIdSchema.parse({
      id: request.params.id, // 👈 parse ใหม่ตรงๆ
    });

    const deleted = await bookingService.deleteBooking(id);
    return h.response(deleted);
  } catch (error) {
    console.error("Error deleting:", error); // 👈 log เพื่อ debug
    return h
      .response({ error: error.errors ?? error.message })
      .code(400);
  }
};


// ✅ Update Booking Status (PATCH)
const updateBookingStatus = async (request, h) => {
  try {
    const { id } = getBookingByIdSchema.parse({ id: Number(request.params.id) });

    const { status } = updateBookingStatusSchema.parse(request.payload);
    const updatedBooking = await bookingService.updateBooking(id, { status });
    return h.response(updatedBooking);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
};