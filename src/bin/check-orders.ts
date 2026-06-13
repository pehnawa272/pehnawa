import { prisma } from "../lib/prisma";

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      payment: true,
    }
  });
  console.log("Total orders in database:", orders.length);
  for (const o of orders) {
    console.log({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      deletedAt: o.deletedAt,
      createdAt: o.createdAt,
      user: o.user ? { name: o.user.name, email: o.user.email } : null,
      payment: o.payment ? { status: o.payment.status, method: o.payment.method } : null,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
