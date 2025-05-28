const { z } = require("zod");

// สร้างผู้ใช้ใหม่
const createUserSchema = z.object({
  uName: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

// อัปเดตผู้ใช้
const updateUserSchema = z
  .object({
    uName: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    phone: z.string().optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field to update is required",
  });

// ตรวจสอบ ID (เช่น params.id) ต้องเป็นตัวเลข
const idParamSchema = z.object({
  id: z.coerce.number({
    invalid_type_error: "ID must be a number",
  }),
});

// สำหรับล็อกอินผู้ใช้
const loginUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
  loginUserSchema,
};
