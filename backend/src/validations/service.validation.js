const { z } = require("zod");

// Schema สำหรับสร้าง Service ใหม่
const createServiceSchema = z.object({
  sName: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  durationMinutes: z.number().int().positive("Duration must be a positive integer"),
});

// Schema สำหรับแก้ไข Service (เหมือน create แต่ทุกฟิลด์ optional)
const updateServiceSchema = createServiceSchema.partial();

// Schema สำหรับพารามิเตอร์ id (ใน path)
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
});

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  idParamSchema,
};
