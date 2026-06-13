import { z } from "zod";

const inchesField = z.number().positive().max(120).multipleOf(0.25).optional();

export const CreateMeasurementSchema = z.object({
  label:     z.string().min(1).max(100).default("My Measurements"),
  isDefault: z.boolean().default(false),
  bust:      inchesField,
  waist:     inchesField,
  hips:      inchesField,
  height:    inchesField,
  shoulder:  inchesField,
  sleeveLen: inchesField,
  inseam:    inchesField,
  notes:     z.string().max(500).optional(),
});

export const UpdateMeasurementSchema = CreateMeasurementSchema.partial();

export type CreateMeasurementInput = z.infer<typeof CreateMeasurementSchema>;
export type UpdateMeasurementInput = z.infer<typeof UpdateMeasurementSchema>;
