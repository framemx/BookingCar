const { z } = require('zod');

const createSlotSchema = z.object({
  slotName: z.string().min(1, "Slot name is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start time format",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end time format",
  }),
  status: z.enum(["AVAILABLE", "BOOKED"]).optional(), // หรือใช้ z.string() ก็ได้ถ้าไม่ต้องการ strict
});

const updateSlotSchema = z.object({
  slotName: z.string().min(1).optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(["AVAILABLE", "BOOKED"]).optional(),
});

const getSlotByIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

module.exports = {
  createSlotSchema,
  updateSlotSchema,
  getSlotByIdSchema,
};
