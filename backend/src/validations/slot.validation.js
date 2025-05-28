const { z } = require('zod');

const createSlotSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const updateSlotSchema = z.object({
  name: z.string().min(1).optional(),
});

const getSlotByIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

module.exports = {
  createSlotSchema,
  updateSlotSchema,
  getSlotByIdSchema,
};
