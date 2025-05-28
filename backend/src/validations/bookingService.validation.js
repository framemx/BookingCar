const { z } = require('zod');

const createMultipleBookingServicesSchema = z.object({
  bookingId: z.number().int(),
  serviceIds: z.array(z.number().int()).nonempty("ต้องเลือกอย่างน้อย 1 service"),
});

const getBookingServiceByIdSchema = z.object({
  id: z.coerce.number().int(),
});

const updateBookingServiceSchema = z.object({
  id: z.number().int(),
  bookingId: z.number().int().optional(),
  serviceId: z.number().int().optional(),
});

module.exports = {
  createMultipleBookingServicesSchema,
  getBookingServiceByIdSchema,
  updateBookingServiceSchema,
};
