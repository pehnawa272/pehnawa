import { z } from "zod";
import { ConsultationStatus, ConsultationType } from "@/generated/client";

export const CreateConsultationSchema = z.object({
  clerkId:       z.string().optional(),
  clientName:    z.string().min(1).max(100),
  clientEmail:   z.string().email(),
  clientPhone:   z.string().regex(/^\+?[0-9\s\-().]{7,20}$/, "Invalid phone number"),
  type:          z.nativeEnum(ConsultationType).default(ConsultationType.VIRTUAL),
  requestedDate: z.string().datetime({ offset: true }).optional(),
  requestedTime: z.string().max(20).optional(),
  message:       z.string().max(1000).optional(),
});

export const UpdateConsultationSchema = z.object({
  status:          z.nativeEnum(ConsultationStatus).optional(),
  scheduledAt:     z.string().datetime({ offset: true }).optional(),
  adminNotes:      z.string().max(1000).optional(),
  convertedOrderId: z.string().cuid().optional(),
});

export type CreateConsultationInput = z.infer<typeof CreateConsultationSchema>;
export type UpdateConsultationInput = z.infer<typeof UpdateConsultationSchema>;
