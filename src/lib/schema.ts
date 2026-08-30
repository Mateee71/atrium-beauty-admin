import z from "zod";

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const formSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(50),
  
  email: z.string().email(),
  
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return /^(\+?\d{10,15})$/.test(val);
    }, { message: "Invalid phone number format!" }),
  
  role: z.string().optional(),
  
  image: z.string().optional(),

  bio: z.string().max(500).optional(),
});

const appointmentSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return /^(\+?\d{10,15})$/.test(val);
    }, { message: "Invalid phone number format!" }),
  dateTime: z.string(),
  stylist_id: z.string(),
  service_category_id: z.string().min(1),
  service_ids: z.array(z.string()).min(1),
  status: z.string().default("pending"),
  note: z.string().max(1000).optional(),
});

const appointmentUpdateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  dateTime: z.string(),
  stylist_id: z.string(),
  service_ids: z.array(z.string()),
  service_category_id: z.string(),
  status: z.string(),
  note: z.string().max(1000).optional(),
});

export { registerSchema, loginSchema, formSchema, appointmentSchema, appointmentUpdateSchema };
