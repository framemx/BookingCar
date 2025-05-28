const { z } = require('zod');

const createBookingSlotSchema = z.object({
  bookingId: z.number().int(),
  slotId: z.number().int(),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format for startTime",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format for endTime",
  }),
});

// ใช้ partial() แล้ว extend() เพิ่ม id สำหรับ update
const updateBookingSlotSchema = createBookingSlotSchema.partial().extend({
  id: z.number().int(),
});

const getBookingSlotByIdSchema = z.object({
  id: z.number().int(),
});

module.exports = {
  createBookingSlotSchema,
  updateBookingSlotSchema,
  getBookingSlotByIdSchema,
};
