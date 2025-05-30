const { z } = require('zod');

const createBookingSlotSchema = z.object({
  bookingId: z.number(),
  slotId: z.number(),
});

const getBookingSlotByIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number'),
});

const updateBookingSlotSchema = z.object({
  id: z.number(),
  bookingId: z.number().optional(),
  slotId: z.number().optional(),
});

module.exports = {
  createBookingSlotSchema,
  getBookingSlotByIdSchema,
  updateBookingSlotSchema,
};
