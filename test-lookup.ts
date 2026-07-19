import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Executing test query...");
  try {
    const email = "test@example.com";
    const phone = "1234567890";

    const userOrConditions: any[] = [];
    if (email) {
      userOrConditions.push({ email: { equals: email, mode: "insensitive" } });
    }
    if (phone) {
      userOrConditions.push({ phone: { equals: phone } });
    }

    const orders = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
        user: {
          OR: userOrConditions as any,
        },
      },
      include: {
        items: true,
      },
    });

    console.log("Query completed successfully. Orders found:", orders.length);
  } catch (err: any) {
    console.error("Query failed with error:", err.message);
    console.error(err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
