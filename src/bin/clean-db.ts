import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🧼 Cleaning up database records...");

  // 1. Delete all Orders, OrderItems, Payments from PostgreSQL
  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`- Deleted ${deletedPayments.count} payment records`);

  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  console.log(`- Deleted ${deletedOrderItems.count} order item records`);

  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`- Deleted ${deletedOrders.count} order records`);

  // 2. Delete all ConsultationRequests from PostgreSQL
  const deletedConsultations = await prisma.consultationRequest.deleteMany({});
  console.log(`- Deleted ${deletedConsultations.count} consultation request records`);

  // 3. Clean up the JSON files in the data directory
  const DATA_DIR = path.join(process.cwd(), "data");
  const filesToClear = ["orders.json", "inquiries.json", "bookings.json"];

  for (const file of filesToClear) {
    const filePath = path.join(DATA_DIR, file);
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf8");
      console.log(`- Reset ${file} to empty array`);
    }
  }

  console.log("✅ Cleanup completed successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
