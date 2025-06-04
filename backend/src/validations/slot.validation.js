const { z } = require('zod');

const createSlotSchema = z.object({
  slotName: z.string().min(1, "Slot name is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid start time format (must be HH:mm)",
  }),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid end time format (must be HH:mm)",
  }),
  status: z.enum(["AVAILABLE", "BOOKED"]).optional(),
});

const updateSlotSchema = z.object({
  slotName: z.string().min(1).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid start time format (must be HH:mm)",
  }).optional(),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid end time format (must be HH:mm)",
  }).optional(),
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