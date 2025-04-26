const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  updateShipmentStatus,
  cancelOrder,
  updateDeliveryStatus,
  confirmDelivery,
  getDriverOrders,
  assignDriver,
  createInvoice,
  getOrderByTrackingId,
  getAllOrders,
  getCustomerOrders
} = require("../controllers/orderController");

const router = express.Router();
router.post("/", protect, createOrder); // ✅ Ensure this route exists
router.get("/", protect, authorize("admin", "warehouse_manager"), getAllOrders);
router.get("/user", protect, getCustomerOrders);
// router.get("/user", protect, getUserOrders);

// router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/cancel", protect, authorize("admin", "customer"), cancelOrder);

// Admins & Warehouse Managers can update order status (including cancellations)
router.put("/:id", protect, authorize("admin", "warehouse_manager"), updateOrderStatus);
router.get("/invoice/:id", createInvoice);
// Drivers can also update shipment status
router.put(
  "/shipment/update/:shipmentId",
  protect,
  authorize("admin", "warehouseManager", "driver"),
  updateShipmentStatus
);

router.put("/assign-driver", protect, authorize("admin"), assignDriver);

router.get("/driver/orders", protect, authorize("driver"), getDriverOrders);

router.put("/driver/update/:orderId", protect, authorize("driver"), updateDeliveryStatus);

router.post("/confirm-delivery", protect, confirmDelivery);

router.get("/track/:trackingId", getOrderByTrackingId);
router.get("/invoice/send/:orderId", createInvoice);
module.exports = router;
