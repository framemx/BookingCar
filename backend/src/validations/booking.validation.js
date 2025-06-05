const { z } = require('zod');

const createBookingSchema = z.object({
  userId: z.number().int().positive(),
  bookingDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  status: z.string(),
  description: z.string().optional().nullable(),
  services: z.array(z.number().int().positive()).optional(),
  slots: z.array(z.object({
    slotId: z.number().int().positive(),
    startTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    endTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
  })).optional(),
});

const getBookingByIdSchema = z.object({
  id: z.coerce.number(), // ✅ แปลงเป็น number อัตโนมัติ
})


const updateBookingSchema = z.object({
  status: z.string().optional(),
  bookingDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
  description: z.string().optional().nullable(),
  services: z.array(z.number().int().positive()).optional(),
  slots: z.array(z.object({
    slotId: z.number().int().positive(),
    startTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    endTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
  })).optional(),
});

// ✅ เพิ่ม schema สำหรับอัปเดตสถานะอย่างเดียว
const updateBookingStatusSchema = z.object({
  status: z.string().min(1, { message: 'Status is required' }),
});

module.exports = {
  createBookingSchema,
  getBookingByIdSchema,
  updateBookingSchema,
  updateBookingStatusSchema, // ✅ export เพิ่มตรงนี้
};
