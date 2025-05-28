const { z } = require('zod');

const createBookingSchema = z.object({
  userId: z.number().int().positive(),
  bookingDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  status: z.string(),
  description: z.string().optional().nullable(), // 👈 เพิ่มตรงนี้
  services: z.array(z.number().int().positive()).optional(), // serviceIds
  slots: z.array(z.object({
    slotId: z.number().int().positive(),
    startTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    endTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  })).optional(),
});

const getBookingByIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Id must be a number string").transform(Number),
});

const updateBookingSchema = z.object({
  status: z.string().optional(),
  bookingDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  description: z.string().optional().nullable(), // 👈 เพิ่มตรงนี้
  services: z.array(z.number().int().positive()).optional(),
  slots: z.array(z.object({
    slotId: z.number().int().positive(),
    startTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    endTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  })).optional(),
});

module.exports = {
  createBookingSchema,
  getBookingByIdSchema,
  updateBookingSchema,
};
