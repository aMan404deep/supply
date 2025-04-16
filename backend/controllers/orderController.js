const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { io } = require("../server"); // Import WebSocket instance
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const sendEmail = require("../utils/sendEmail");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require("qrcode");
const path = require('path');
const generateInvoice = require("../utils/generateInvoice");
// Order Status Constants
const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// 📌 Create Order with Atomic Transactions
const createOrder = asyncHandler(async (req, res) => {
  const { items, totalAmount, shippingAddress } = req.body;
  
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("Order must include at least one product.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trackingId = uuidv4();
    const trackingUrl = `http://localhost:5000/api/orders/track/${trackingId}`; // Replace with real domain

    // Generate QR Code for Tracking
    const qrCodeData = await QRCode.toDataURL(trackingUrl);
    // console.log("Generated QR Code:", qrCodeData);
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) throw new Error(`Product not found: ${item.product}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for: ${product.name}`);

      // Reduce stock and save
      product.stock -= item.quantity;
      await product.save({ session });

      // Send stock alert if low
      if (product.stock <= product.lowStockThreshold) {
        await sendEmail(
          process.env.ADMIN_EMAIL,
          "Stock Alert: Replenishment Needed",
          `The stock for ${product.name} is low (Remaining: ${product.stock}). Please restock it.`
        );
      }
    }

    // Create Order
    const order = new Order({
      customer: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      orderStatus: "Pending",
      trackingId,
      qrCode: qrCodeData, // Store QR Code in order
    });

    const createdOrder = await order.save({ session });
    // console.log("Generated QR Code:", order.qrCode);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400);
    throw new Error(error.message);
  }
});
// const createOrder = asyncHandler(async (req, res) => {
//   const { items, totalAmount, shippingAddress } = req.body;
//   if (!items || items.length === 0) {
//     res.status(400);
//     throw new Error("Order must include at least one product.");
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const trackingId = uuidv4();

//     for (const item of items) {
//       const product = await Product.findById(item.product).session(session);

//       if (!product) throw new Error(`Product not found: ${item.product}`);
//       if (product.stock < item.quantity) throw new Error(`Insufficient stock for: ${product.name}`);

//       // Reduce stock and save
//       product.stock -= item.quantity;
//       await product.save({ session });

//       // Send stock alert if low
//       if (product.stock <= product.lowStockThreshold) {
//         await sendEmail(
//           process.env.ADMIN_EMAIL,
//           "Stock Alert: Replenishment Needed",
//           `The stock for ${product.name} is low (Remaining: ${product.stock}). Please restock it.`
//         );
//       }
//     }

//     // Create Order
//     const order = new Order({
//       customer: req.user._id,
//       items,
//       totalAmount,
//       shippingAddress,
//       orderStatus: "Pending",
//       trackingId,
//     });

//     const createdOrder = await order.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json(createdOrder);
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(400);
//     throw new Error(error.message);
//   }
// });

const createInvoice = async (req, res) => {
  try {
    const { id: orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId in URL" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const order = await Order.findById(orderId)
      .populate("customer", "name email")
      .populate("items.product", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Ensure invoices directory exists
    const invoiceDir = path.resolve(__dirname, "../invoices");
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const filePath = path.join(invoiceDir, `invoice_${order._id}.pdf`);

    // 🧾 Generate the PDF
    await generateInvoice(order, filePath);

    // 📧 Email it (optional)
    const customerEmail = order.customer?.email;
    if (customerEmail) {
      const subject = `Your Invoice for Order #${order._id}`;
      const body = `Hi ${order.customer.name},\n\nAttached is your invoice for Order #${order._id}.\n\nThank you!`;
      await sendEmail(customerEmail, subject, body, filePath);
    }

    // 🔐 Allow frontend to view PDF inline
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=invoice_${order._id}.pdf`);

    // ✅ Use absolute path with `sendFile`
    return res.sendFile(filePath, (err) => {
      if (err) {
        console.error("❌ Error sending invoice:", err.message);
        res.status(500).json({ message: "Failed to send invoice" });
      }
    });

  } catch (error) {
    console.error("❌ Invoice generation error:", error);
    res.status(500).json({
      message: "Error generating invoice",
      error: error.message || error,
    });
  }
};


const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email") // Include customer details
      .populate("items.product", "name price"); // Include product details

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// 📌 Get user orders
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort("-createdAt");
  res.json(orders);
});

// 📌 Update Order Status (Including Cancellation & Stock Restoration)

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // ✅ Ensure request contains `status`
  
  if (!status) {
    return res.status(400).json({ message: "Order status is required." });
  }

  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  order.orderStatus = status;
  await order.save();

  res.status(200).json({ message: "Order status updated successfully.", order });
});

// 📌 Update Shipment Status & Notify Clients
const updateShipmentStatus = asyncHandler(async (req, res) => {
  const { shipmentId } = req.params;
  const { status, location } = req.body;

  const order = await Order.findById(shipmentId);
  if (!order) {
    res.status(404);
    throw new Error("Shipment not found.");
  }

  order.orderStatus = status;
  order.location = location;
  await order.save();

  io.emit("shipmentUpdated", {
    shipmentId,
    status,
    location,
  });

  res.json({
    message: "Shipment updated successfully",
    shipmentId,
    status,
    location,
  });
});

// const cancelOrder = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const order = await Order.findById(id).populate("customer", "email name");

//   if (!order) {
//     res.status(404);
//     throw new Error("Order not found.");
//   }

//   if (order.orderStatus !== "Pending" && order.orderStatus !== "Processing") {
//     res.status(400);
//     throw new Error("Order cannot be canceled at this stage.");
//   }

//   let refundMessage = "";
//   let refundDetails = {};

//   // Refund process for online payments
//   if (order.paymentMode === "Online" && order.paymentStatus === "Paid") {
//     try {
//       const refundResponse = await processRefund(order.paymentId, order.totalAmount); // Simulated refund API call
      
//       refundDetails = {
//         status: "Processed",
//         refundId: refundResponse.refundId,
//         refundAmount: order.totalAmount,
//         refundDate: new Date(),
//       };

//       order.paymentStatus = "Refunded";
//       order.refund = refundDetails;
//       refundMessage = `Your refund (₹${order.totalAmount}) has been successfully processed. Refund ID: ${refundResponse.refundId}.`;
//     } catch (error) {
//       refundDetails = { status: "Failed", refundAmount: order.totalAmount };
//       order.refund = refundDetails;
//       res.status(500);
//       throw new Error("Failed to process refund. Please try again.");
//     }
//   }

//   // Update order status
//   order.orderStatus = "Canceled";
//   await order.save();

//   // 📩 **Send email to the customer**
//   await sendEmail(
//     order.customer.email,
//     "Your Order Has Been Canceled",
//     `
//       Hi ${order.customer.name},

//       Your order with Tracking ID: ${order.trackingId} has been successfully canceled.
//       ${refundMessage ? refundMessage : "Since this was a cash-on-delivery order, no refund is required."}

//       If you have any questions, feel free to contact our support.

//       Regards,  
//       Your Company Name
//     `
//   );

//   // 📩 **Send email to the admin**
//   await sendEmail(
//     process.env.ADMIN_EMAIL,
//     "Order Cancellation Alert",
//     `
//       Alert! An order has been canceled.

//       Order ID: ${order._id}  
//       Customer: ${order.customer.name} (${order.customer.email})  
//       Total Amount: ₹${order.totalAmount}  
//       Payment Mode: ${order.paymentMode}  
//       Refund Status: ${refundDetails.status || "N/A"}  

//       Please review the cancellation and update inventory if needed.
//     `
//   );

//   // 🔄 **Emit WebSocket event**
//   io.emit("orderCancelled", {
//     orderId: order._id,
//     status: "Canceled",
//     refundStatus: refundDetails.status || "N/A",
//   });

//   res.json({ message: "Order canceled successfully. Notifications sent.", order });
// });

const cancelOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📢 Cancel Order Request for ID:", id);

    const order = await Order.findById(id).populate("customer", "email name");
    if (!order) {
      console.log("❌ Order not found.");
      return res.status(404).json({ message: "Order not found." });
    }

    console.log("🔹 Current Order Status:", order.orderStatus);

    if (!["Pending", "Processing"].includes(order.orderStatus)) {
      console.log("❌ Order cannot be cancelled at this stage.");
      return res.status(400).json({ message: "Order cannot be cancelled at this stage." });
    }

    let refundMessage = "";
    let refundDetails = {};

    if (order.paymentMode === "Online" && order.paymentStatus === "Paid") {
      try {
        const refundResponse = { refundId: `REF-${Date.now()}` };

        refundDetails = {
          status: "Processed",
          refundId: refundResponse.refundId,
          refundAmount: order.totalAmount,
          refundDate: new Date(),
        };

        order.paymentStatus = "Refunded";
        order.refund = refundDetails;
        refundMessage = `Refund of ₹${order.totalAmount} processed successfully. Refund ID: ${refundResponse.refundId}.`;
      } catch (error) {
        refundDetails = { status: "Failed", refundAmount: order.totalAmount };
        order.refund = refundDetails;
        console.log("❌ Refund processing failed:", error);
        return res.status(500).json({ message: "Failed to process refund. Please try again." });
      }
    }

    order.orderStatus = "Cancelled";
    await order.save();

    console.log("✅ Order Cancelled Successfully");

    await sendEmail(
      order.customer.email,
      "Order Cancellation Confirmation",
      `Hi ${order.customer.name},\n\nYour order with Tracking ID: ${order.trackingId} has been successfully cancelled.\n${refundMessage ? refundMessage : "Since this was a cash-on-delivery order, no refund is required."}\n\nIf you have any questions, feel free to contact our support.\n\nBest regards,\nYour Company`
    );

    await sendEmail(
      process.env.ADMIN_EMAIL,
      "Order Cancellation Alert",
      `Alert! An order has been cancelled.\n\nOrder ID: ${order._id}\nCustomer: ${order.customer.name} (${order.customer.email})\nTotal Amount: ₹${order.totalAmount}\nPayment Mode: ${order.paymentMode}\nRefund Status: ${refundDetails.status || "N/A"}\n\nPlease review the cancellation and update inventory if needed.`
    );

    res.json({ message: "Order cancelled successfully. Notifications sent.", order });
  } catch (error) {
    console.error("❌ Error in cancelOrder:", error);
    res.status(500).json({ message: "Error cancelling order. Please try again." });
  }
});

//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id).populate("customer", "email name");

//     if (!order) {
//       return res.status(404).json({ message: "Order not found." });
//     }

//     if (order.orderStatus !== "Pending" && order.orderStatus !== "Processing") {
//       return res.status(400).json({ message: "Order cannot be canceled at this stage." });
//     }

//     let refundMessage = "";
//     let refundDetails = {};

//     // Handle refund if the order was paid online
//     if (order.paymentMode === "Online" && order.paymentStatus === "Paid") {
//       try {
//         // Simulate refund processing (Replace with real payment gateway API call)
//         const refundResponse = { refundId: `REF-${Date.now()}` };

//         refundDetails = {
//           status: "Processed",
//           refundId: refundResponse.refundId,
//           refundAmount: order.totalAmount,
//           refundDate: new Date(),
//         };

//         order.paymentStatus = "Refunded";
//         order.refund = refundDetails;
//         refundMessage = `Refund of ₹${order.totalAmount} has been processed. Refund ID: ${refundResponse.refundId}.`;
//       } catch (error) {
//         refundDetails = { status: "Failed", refundAmount: order.totalAmount };
//         order.refund = refundDetails;
//         return res.status(500).json({ message: "Failed to process refund. Please try again." });
//       }
//     }

//     // Update order status to cancelled
//     order.orderStatus = "Cancelled";
//     await order.save();

//     // Send email notifications
//     await sendEmail(
//       order.customer.email,
//       "Your Order Has Been Canceled",
//       `Hello ${order.customer.name},\n\nYour order with Tracking ID: ${order.trackingId} has been successfully canceled.\n${refundMessage}\n\nIf you have any questions, contact support.\n\nThank you!`
//     );

//     await sendEmail(
//       process.env.ADMIN_EMAIL,
//       "Order Cancellation Alert",
//       `Admin Alert!\n\nAn order has been canceled.\nOrder ID: ${order._id}\nCustomer: ${order.customer.name} (${order.customer.email})\nTotal Amount: ₹${order.totalAmount}\nRefund Status: ${refundDetails.status || "N/A"}`
//     );

//     // Emit WebSocket event for real-time update
//     io.emit("orderCancelled", { orderId: order._id, status: "Cancelled", refundStatus: refundDetails.status || "N/A" });

//     res.json({ message: "Order canceled successfully. Notifications sent.", order });
//   } catch (error) {
//     console.error("❌ Error in cancelOrder:", error);
//     res.status(500).json({ message: "Error cancelling order. Please try again." });
//   }
// });




// 📌 Assign a driver to an order (Admin Only)
const assignDriver = asyncHandler(async (req, res) => {
  const { orderId, driverId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  const driver = await User.findById(driverId);
  if (!driver || driver.role !== "driver") {
    res.status(400);
    throw new Error("Invalid driver.");
  }

  order.assignedDriver = driverId;
  order.orderStatus = "Shipped"; // Move order to "Shipped" status
  await order.save();

  // Notify the driver in real-time
  io.emit("driverAssigned", { orderId, driverId });

  res.json({ message: "Driver assigned successfully", order });
});

// 📌 Get Orders Assigned to a Driver
const getDriverOrders = asyncHandler(async (req, res) => {
  const driverId = req.user._id;

  const orders = await Order.find({ assignedDriver: driverId }).sort("-createdAt");

  res.json(orders);
});

// 📌 Driver Updates Order Status (Out for Delivery / Delivered)
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, confirmation } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  if (order.assignedDriver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Unauthorized: You are not assigned to this order.");
  }

  if (status === "Delivered" && !confirmation) {
    res.status(400);
    throw new Error("Delivery confirmation (OTP/signature) is required.");
  }

  order.orderStatus = status;
  if (confirmation) order.deliveryConfirmation = confirmation;

  await order.save();

  // Notify customer when order is out for delivery or delivered
  io.emit("deliveryUpdate", { orderId, status });

  res.json({ message: "Order status updated", order });
});


// 📌 Customer Confirms Delivery with OTP
const confirmDelivery = asyncHandler(async (req, res) => {
  const { orderId, otp } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  if (order.deliveryConfirmation !== otp) {
    res.status(400);
    throw new Error("Invalid OTP.");
  }

  order.orderStatus = "Delivered";
  await order.save();

  io.emit("orderDelivered", { orderId });

  res.json({ message: "Delivery confirmed successfully", order });
});

const getOrderByTrackingId = asyncHandler(async (req, res) => {
  const { trackingId } = req.params;

  const order = await Order.findOne({ trackingId })
    .populate("customer", "name email")
    .populate("items.product", "name price");

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  res.json({
    orderId: order._id,
    trackingId: order.trackingId,
    status: order.orderStatus,
    qrCode: order.qrCode, // Return QR Code data
  });
});

const getCustomerOrders = asyncHandler(async (req, res) => {
  const customerId = req.user._id; // Ensure req.user exists from authMiddleware
  console.log(customerId);
  // ✅ Fetch orders where the user is the customer
  const orders = await Order.find({ customer: customerId }).populate("items.product", "name price");
  console.log(orders);
  if (!orders || orders.length === 0) {
    return res.status(200).json([]); // Return empty array instead of throwing an error
  }

  res.status(200).json(orders);
});

module.exports = {getAllOrders,getCustomerOrders, getOrderByTrackingId , createInvoice,createOrder,updateDeliveryStatus,confirmDelivery,getDriverOrders,assignDriver, getUserOrders, updateOrderStatus, updateShipmentStatus, cancelOrder };
