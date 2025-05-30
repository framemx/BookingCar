const bookingServiceService = require("../services/bookingService.service");
const {
  createMultipleBookingServicesSchema,
  getBookingServiceByIdSchema,
  updateBookingServiceSchema,
} = require("../validations/bookingService.validation");

const createMultipleBookingServices = async (request, h) => {
  try {
    const data = createMultipleBookingServicesSchema.parse(request.payload);
    const bookingServices = data.serviceIds.map((serviceId) => ({
      bookingId: data.bookingId,
      serviceId,
    }));

    const result = await bookingServiceService.createBookingServices(
      bookingServices
    );
    return h.response(result).code(201);
  } catch (error) {
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const getAllBookingServices = async (request, h) => {
  const bookingServices = await bookingServiceService.getAllBookingServices({
    include: { booking: true, service: true },
  });
  return h.response(bookingServices);
};


const getBookingServiceById = async (request, h) => {
  try {
    // 1. Parse และ validate params
    const { id } = getBookingServiceByIdSchema.parse(request.params);

    // 2. ดึงข้อมูลพร้อม include ความสัมพันธ์ (ถ้าต้องการ)
    const bookingService = await bookingServiceService.getBookingServiceById(id);

    // 3. เช็คว่าเจอหรือไม่
    if (!bookingService) {
      return h.response({ error: "BookingService not found" }).code(404);
    }

    return h.response(bookingService);
  } catch (error) {
    // 4. เช็คว่าเป็น Prisma error หรือ zod error
    const isZod = Array.isArray(error.errors);
    return h
      .response({
        error: isZod ? error.errors : error.message,
      })
      .code(400);
  }
};


const deleteBookingService = async (request, h) => {
  try {
    const { id } = getBookingServiceByIdSchema.parse(request.params);
    const deleted = await bookingServiceService.deleteBookingService(id);
    return h.response(deleted);
  } catch (error) {
    if (error.code === "P2025") {
      return h.response({ error: "BookingService not found" }).code(404);
    }
    return h.response({ error: error.errors ?? error.message }).code(400);
  }
};

const updateBookingService = async (request, h) => {
  try {
    const id = Number(request.params.id);
    const payload = updateBookingServiceSchema
      .omit({ id: true })
      .parse(request.payload);
    const updated = await bookingServiceService.updateBookingService(
      id,
      payload
    );

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
