const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = async (order, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      doc
        .fontSize(22)
        .fillColor("#0f766e")
        .text("EverStock", { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor("#333")
        .text("Order Invoice", { align: "center" })
        .moveDown(2);

      // Customer Info
      doc
        .fontSize(12)
        .fillColor("#444")
        .text(`Customer Name: ${order.customer?.name || "N/A"}`)
        .text(`Email: ${order.customer?.email || "N/A"}`)
        .text(`Order ID: ${order._id}`)
        .text(`Tracking ID: ${order.trackingId}`)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
        .moveDown();

      // Order Table Header
      doc
        .fontSize(12)
        .fillColor("#000")
        .text("Product", 50, doc.y, { continued: true })
        .text("Qty", 250, doc.y, { continued: true })
        .text("Price", 300, doc.y, { continued: true })
        .text("Subtotal", 400, doc.y);

      doc.moveDown(0.5).strokeColor("#ccc").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

      // Order Items
      order.items.forEach((item) => {
        const name = item.product?.name || "Unknown";
        const qty = item.quantity || 0;
        const price = item.product?.price || 0;
        const subtotal = qty * price;

        doc
          .fontSize(12)
          .fillColor("#333")
          .text(name, 50, doc.y, { continued: true })
          .text(qty.toString(), 250, doc.y, { continued: true })
          .text(`₹${price.toFixed(2)}`, 300, doc.y, { continued: true })
          .text(`₹${subtotal.toFixed(2)}`, 400, doc.y);
      });

      doc.moveDown(1.5);

      // Total
      const total = order.totalAmount || 0;
      doc
        .fontSize(14)
        .fillColor("#000")
        .text(`Total Amount: ₹${total.toFixed(2)}`, { align: "right" })
        .moveDown();

      // QR Code
      if (order.qrCode && order.qrCode.startsWith("data:image/png;base64,")) {
        doc
          .fontSize(12)
          .fillColor("#444")
          .text("Scan this QR code to track your order:", { align: "center" })
          .moveDown(0.5);

        try {
          const qrCodeBuffer = Buffer.from(order.qrCode.split(",")[1], "base64");
          const qrPath = path.join(__dirname, `../invoices/qr_${order._id}.png`);
          fs.writeFileSync(qrPath, qrCodeBuffer);

          doc.image(qrPath, {
            fit: [150, 150],
            align: "center",
          });

          // Clean up temp QR image after doc ends
          writeStream.on("finish", () => {
            fs.unlinkSync(qrPath);
            resolve();
          });
        } catch (err) {
          console.error("QR Code Error:", err);
          resolve(); // Continue even if QR fails
        }
      } else {
        writeStream.on("finish", () => resolve());
      }

      // Footer
      doc.moveDown(3);
      doc
        .fontSize(10)
        .fillColor("#aaa")
        .text("Thank you for ordering with EverStock!", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateInvoice;
