import axios from "axios";

const API_URL = "https://supplychainpro.onrender.com/api/orders";

// 📌 Fetch assigned deliveries for the driver
export const getDriverOrders = async (token) => {
  const response = await fetch("https://supplychainpro.onrender.com/api/driver/deliveries", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch deliveries");
  }

  return await response.json();
};

export const updateDeliveryStatus = async (token, deliveryId, status, location, otp) => {
  const response = await fetch(`https://supplychainpro.onrender.com/api/driver/deliveries/${deliveryId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, location, otp }),
  });

  if (!response.ok) {
    throw new Error("Failed to update delivery status");
  }

  return await response.json();
};


export default { getDriverOrders, updateDeliveryStatus };
