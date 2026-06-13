import { prisma } from "@/lib/prisma";

export interface PendingOrderPayload {
  razorpayOrderId: string;
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    customTailoring?: any;
    measurementProfileId?: string;
  }>;
  shippingForm: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    giftDraping: boolean;
  };
  totalAmountInPaise: number;
}

export const PendingOrderStore = {
  async save(razorpayOrderId: string, payload: PendingOrderPayload) {
    await prisma.pendingOrder.upsert({
      where: { razorpayOrderId },
      create: {
        razorpayOrderId,
        payload: payload as any,
      },
      update: {
        payload: payload as any,
      },
    });
  },

  async get(razorpayOrderId: string): Promise<PendingOrderPayload | null> {
    const record = await prisma.pendingOrder.findUnique({
      where: { razorpayOrderId },
    });
    if (!record) return null;
    return record.payload as unknown as PendingOrderPayload;
  },

  async delete(razorpayOrderId: string) {
    try {
      await prisma.pendingOrder.delete({
        where: { razorpayOrderId },
      });
    } catch (e) {
      // Ignore if record already deleted or not found
    }
  }
};
