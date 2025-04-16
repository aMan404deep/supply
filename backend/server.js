const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes.js");
const inventoryRoutes = require("./routes/inventoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "https://everstock.netlify.app",
    methods: ["GET", "POST", "PUT"],
  },
});

app.use(cors({
  origin: "https://everstock.netlify.app", 
  credentials: true 
}));
app.use(express.json());

io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  socket.on("trackShipment", (shipmentId) => {
    console.log(`📦 Tracking shipment: ${shipmentId}`);
    socket.join(shipmentId); 
  });

  socket.on("updateShipment", (data) => {
    console.log(`🚚 Shipment ${data.shipmentId} updated to: ${data.status}`);
    io.to(data.shipmentId).emit("shipmentUpdated", data); 
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/driver", require("./routes/driverRoutes"));
app.use("/api/customer", customerRoutes);
app.use("/api/notifications", notificationRoutes);

app.get('/ping', (req, res) => {
  console.log('Keep-alive ping received');
  res.status(200).send('OK');
});

app.use(notFound);
app.use(errorHandler);

module.exports = { app,io };

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
