/**
 * Pehnawa — Admin Orders Workflow Test Suite
 *
 * Execution:
 *   npx tsx scratch/test-admin-orders.ts
 *
 * Tests:
 * 1. Order Status Lifecycle Progression & Auto-timestamps
 * 2. Shipping Details Update (Without Status Change)
 * 3. Order Cancellation Requirements
 */

import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { OrderService } from "../src/services/order.service";
import { OrderStatus, PaymentStatus } from "../src/generated/client";

async function runTests() {
  console.log("🧪 Starting Admin Orders Workflow Test Suite...\n");

  const testUserEmail = "test_admin_orders_buyer@pehnawa.com";
  let testProductId = "";

  // 1. Get test product
  const product = await prisma.product.findFirst({
    where: { status: "PUBLISHED", price: { not: null } },
  });

  if (!product) {
    console.error("❌ Aborting tests: No PUBLISHED product found. Please run seed script first.");
    process.exit(1);
  }
  testProductId = product.id;
  console.log(`📦 Using test product: "${product.title}"`);

  // Clean up any stale test records from previous run
  await prisma.payment.deleteMany({ where: { razorpayOrderId: "order_admin_test_123" } }).catch(() => {});
  await prisma.order.deleteMany({ where: { user: { email: testUserEmail } } }).catch(() => {});
  await prisma.address.deleteMany({ where: { user: { email: testUserEmail } } }).catch(() => {});
  await prisma.user.deleteMany({ where: { email: testUserEmail } }).catch(() => {});

  // 2. Setup a test user, address, and order
  const user = await prisma.user.create({
    data: {
      clerkId: "clerk_admin_test_user",
      email: testUserEmail,
      name: "Admin Orders Tester",
      phone: "+91 98765 43210",
    },
  });

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      name: "Admin Orders Tester",
      phone: "+91 98765 43210",
      line1: "456 Fashion Boulevard",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    },
  });

  const orderNumber = `PEH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: user.id,
      addressId: address.id,
      status: OrderStatus.NEW,
      subtotal: product.price!,
      total: product.price!,
      items: {
        create: {
          productId: testProductId,
          productTitle: product.title,
          productSlug: product.slug,
          unitPrice: product.price!,
          quantity: 1,
          size: "M",
        },
      },
    },
    include: {
      items: true,
      payment: true,
      address: true,
      user: true,
    },
  });

  console.log(`✅ Order created successfully: ${order.orderNumber} (Database ID: ${order.id})`);

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 1: Order Status Lifecycle Progression & Auto-timestamps
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n--- TEST 1: Lifecycle Transitions & Timestamps ---");

  // A. Transition NEW -> ACCEPTED
  console.log("-> Transitioning to ACCEPTED...");
  const acceptedOrder = await OrderService.updateStatus(order.id, OrderStatus.ACCEPTED);
  if (acceptedOrder.status === OrderStatus.ACCEPTED && acceptedOrder.acceptedAt) {
    console.log(`✅ Successfully accepted at: ${acceptedOrder.acceptedAt.toISOString()}`);
  } else {
    throw new Error("Failed to transition to ACCEPTED or timestamp was not stored!");
  }

  // B. Transition ACCEPTED -> IN_STITCHING
  console.log("-> Transitioning to IN_STITCHING...");
  const stitchingOrder = await OrderService.updateStatus(order.id, OrderStatus.IN_STITCHING);
  if (stitchingOrder.status === OrderStatus.IN_STITCHING && stitchingOrder.stitchingAt) {
    console.log(`✅ Successfully stitching at: ${stitchingOrder.stitchingAt.toISOString()}`);
  } else {
    throw new Error("Failed to transition to IN_STITCHING!");
  }

  // C. Transition IN_STITCHING -> READY_TO_SHIP
  console.log("-> Transitioning to READY_TO_SHIP...");
  const readyOrder = await OrderService.updateStatus(order.id, OrderStatus.READY_TO_SHIP);
  if (readyOrder.status === OrderStatus.READY_TO_SHIP && readyOrder.readyAt) {
    console.log(`✅ Successfully ready for shipping at: ${readyOrder.readyAt.toISOString()}`);
  } else {
    throw new Error("Failed to transition to READY_TO_SHIP!");
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 2: Shipping Details Update (Without Status Change)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n--- TEST 2: Shipping Details Update (Status Unchanged) ---");
  const carrier = "Delhivery Express";
  const code = "DEL1293848123";
  const url = "https://www.delhivery.com/track/DEL1293848123";

  console.log("-> Updating shipping credentials (no status change)...");
  const shippingUpdatedOrder = await OrderService.updateStatus(order.id, undefined, {
    shippingCarrier: carrier,
    trackingCode: code,
    trackingUrl: url,
  });

  if (
    shippingUpdatedOrder.status === OrderStatus.READY_TO_SHIP &&
    shippingUpdatedOrder.shippingCarrier === carrier &&
    shippingUpdatedOrder.trackingCode === code &&
    shippingUpdatedOrder.trackingUrl === url
  ) {
    console.log("✅ Shipping details stored perfectly.");
    console.log(`✅ Carrier: ${shippingUpdatedOrder.shippingCarrier}`);
    console.log(`✅ Code: ${shippingUpdatedOrder.trackingCode}`);
    console.log(`✅ URL: ${shippingUpdatedOrder.trackingUrl}`);
  } else {
    throw new Error("Failed to update shipping details without changing status!");
  }

  // Transition READY_TO_SHIP -> SHIPPED
  console.log("-> Transitioning to SHIPPED...");
  const shippedOrder = await OrderService.updateStatus(order.id, OrderStatus.SHIPPED);
  if (shippedOrder.status === OrderStatus.SHIPPED && shippedOrder.shippedAt) {
    console.log(`✅ Successfully shipped at: ${shippedOrder.shippedAt.toISOString()}`);
  } else {
    throw new Error("Failed to transition to SHIPPED!");
  }

  // Transition SHIPPED -> DELIVERED
  console.log("-> Transitioning to DELIVERED...");
  const deliveredOrder = await OrderService.updateStatus(order.id, OrderStatus.DELIVERED);
  if (deliveredOrder.status === OrderStatus.DELIVERED && deliveredOrder.deliveredAt) {
    console.log(`✅ Successfully delivered at: ${deliveredOrder.deliveredAt.toISOString()}`);
  } else {
    throw new Error("Failed to transition to DELIVERED!");
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 3: Order Cancellation Requirements
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n--- TEST 3: Order Cancellation & Reasons ---");

  // Create a second order to test cancellation
  const cancelOrderNumber = `PEH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderForCancel = await prisma.order.create({
    data: {
      orderNumber: cancelOrderNumber,
      userId: user.id,
      addressId: address.id,
      status: OrderStatus.NEW,
      subtotal: product.price!,
      total: product.price!,
    },
  });

  console.log(`-> Cancelling order ${orderForCancel.orderNumber}...`);
  const reason = "Fabric stockout / dye variance mismatch";
  const cancelledOrder = await OrderService.updateStatus(orderForCancel.id, OrderStatus.CANCELLED, {
    cancellationReason: reason,
  });

  if (
    cancelledOrder.status === OrderStatus.CANCELLED &&
    cancelledOrder.cancelledAt &&
    cancelledOrder.cancellationReason === reason
  ) {
    console.log("✅ Order cancelled successfully.");
    console.log(`✅ Cancel Reason: "${cancelledOrder.cancellationReason}"`);
    console.log(`✅ Cancel Timestamp: ${cancelledOrder.cancelledAt.toISOString()}`);
  } else {
    throw new Error("Failed to cancel order or record reason/timestamp!");
  }

  // Cleanup test database entries
  console.log("\n🧹 Cleaning up test database records...");
  await prisma.orderItem.deleteMany({ where: { orderId: { in: [order.id, orderForCancel.id] } } });
  await prisma.order.deleteMany({ where: { id: { in: [order.id, orderForCancel.id] } } });
  await prisma.address.delete({ where: { id: address.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log("🧹 Cleanup complete.");

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! Order management workflow is fully validated and functional.");
}

runTests().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
