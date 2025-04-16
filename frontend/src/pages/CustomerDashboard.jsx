import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerOrders, fetchOrderTracking, updateCustomerProfile } from "../redux/customer/customerSlice";
import { Loader2, Package, Truck, MapPin, Edit3, Save, User, ShieldCheck, ChevronRight, Clock, DollarSign, ChartBar } from "lucide-react";
import Sidebar from "../components/Sidebar";

const CustomerDashboard = () => {

  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("token"); // Or from Redux/auth slice
      const response = await fetch(`/api/orders/invoice/${orderId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to download invoice.");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error.message);
    }
  };

  const dispatch = useDispatch();
  const { orders, tracking, profile, loading, error } = useSelector((state) => state.customer);
  const [trackingId, setTrackingId] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [scrollY, setScrollY] = useState(0);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    dispatch(fetchCustomerOrders());
    dispatch(updateCustomerProfile()); // Fetch profile if needed
    setTimeout(() => setAnimateStats(true), 100);
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setUserData({ name: profile.name, email: profile.email });
    }
  }, [profile]);

  const handleTrackOrder = () => {
    if (trackingId) {
      dispatch(fetchOrderTracking(trackingId));
    }
  };

  const handleProfileUpdate = () => {
    dispatch(updateCustomerProfile(userData));
    setEditMode(false);
  };

  // Get the status badge styling
  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case "Delivered": 
        return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white";
      case "Processing": 
        return "bg-gradient-to-r from-teal-500 to-teal-600 text-white";
      case "Shipped": 
        return "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white";
      default: 
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Background with depth layers */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-900 h-64"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          {/* Geometric shapes for modern aesthetic */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-emerald-400 blur-3xl"
                 style={{ transform: `translateY(${scrollY * 0.15}px)` }}></div>
            <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full bg-cyan-500 blur-3xl"
                 style={{ transform: `translateY(${-scrollY * 0.2}px)` }}></div>
            <div className="absolute bottom-20 right-1/3 w-80 h-80 rounded-full bg-teal-400 blur-3xl"
                 style={{ transform: `translateY(${-scrollY * 0.25}px)` }}></div>
          </div>
        </div>
        
        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8 pt-6 text-white">
              <div className="mb-4 inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium tracking-wider">
                <Package size={16} className="mr-2" />
                MY ORDERS CENTER
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                <span className="text-zinc-50 block">
                  Welcome Back{profile ? `, ${profile.name}` : ""}
                </span>
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  Orders & Tracking
                </span>
              </h1>
              <p className="text-zinc-300 mt-2">Manage your orders, track shipments, and update your profile.</p>
            </header>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 font-semibold text-center p-4 rounded-xl mb-8">
                <p>Error: {error}</p>
                <p className="text-center mt-2 text-red-400">Please try refreshing the page.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-16">
                  <StatCard 
                    title="Total Orders" 
                    value={orders.length} 
                    icon={<Package size={24} className="text-white" />} 
                    delay={0} 
                    animate={animateStats}
                    color="emerald" 
                  />
                  <StatCard 
                    title="Active Shipments" 
                    value={orders.filter(order => order.orderStatus !== "Delivered").length} 
                    icon={<Truck size={24} className="text-white" />} 
                    delay={100} 
                    animate={animateStats}
                    color="teal" 
                  />
                  <StatCard 
                    title="Completed" 
                    value={orders.filter(order => order.orderStatus === "Delivered").length} 
                    icon={<ShieldCheck size={24} className="text-white" />} 
                    delay={200} 
                    animate={animateStats}
                    color="cyan" 
                  />
                </div>

                {/* Order History with Enhanced UI */}
                <div className="bg-white p-6 shadow-lg rounded-2xl mb-8 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] border border-zinc-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-zinc-800 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-emerald-600" />
                      Order History
                    </h2>
                    {orders.length > 0 && (
                      <span className="text-sm text-zinc-500">
                        Showing {orders.length} order{orders.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-10 bg-zinc-50 rounded-lg">
                      <Package className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                      <p className="text-zinc-500 mb-2">No orders found.</p>
                      <a 
                        href="/shop" 
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Browse products <ChevronRight className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50">
                            <th className="py-3 px-4 rounded-tl-lg font-semibold text-zinc-700">Order ID</th>
                            <th className="py-3 px-4 font-semibold text-zinc-700">Date</th>
                            <th className="py-3 px-4 font-semibold text-zinc-700">Status</th>
                            <th className="py-3 px-4 font-semibold text-zinc-700">Total</th>
                            <th className="py-3 px-4 rounded-tr-lg font-semibold text-zinc-700 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, index) => (
                            <tr 
                              key={order._id} 
                              className={`border-b hover:bg-emerald-50 transition-colors duration-150 ${
                                index === orders.length - 1 ? 'border-none' : ''
                              }`}
                            >
                              <td className="py-4 px-4">
                                <span className="font-medium">#{order._id.substring(0, 8)}</span>
                              </td>
                              <td className="py-4 px-4 text-zinc-600">
                                {new Date().toLocaleDateString()}
                              </td>
                              <td className="py-4 px-4">
                                <span 
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    getStatusBadgeStyle(order.orderStatus)
                                  }`}
                                >
                                  {order.orderStatus}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4 text-emerald-600 mr-1" />
                                  <span className="font-semibold">
                                    {order.totalAmount.toLocaleString()}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex flex-col items-end space-y-2">
                                  <button
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm hover:from-emerald-700 hover:to-teal-700 transform transition-transform duration-200 hover:scale-105 shadow-md"
                                    onClick={() => setTrackingId(order.trackingId)}
                                  >
                                    <Truck className="inline-block w-4 h-4 mr-1" />
                                    Track
                                  </button>
                                  <button
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm hover:from-indigo-700 hover:to-purple-700 transform transition-transform duration-200 hover:scale-105 shadow-md"
                                    onClick={() => downloadInvoice(order._id)}
                                  >
                                    Download Invoice
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white p-6 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] border border-zinc-100">
                    <h2 className="text-xl font-semibold text-zinc-800 flex items-center mb-6">
                      <Truck className="w-5 h-5 mr-2 text-emerald-600" />
                      Track Order
                    </h2>
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        placeholder="Enter Tracking ID"
                        className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                      />
                      <button
                        className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transform transition-transform duration-200 hover:scale-105 shadow-md flex-shrink-0"
                        onClick={handleTrackOrder}
                      >
                        Track
                      </button>
                    </div>

                    {tracking && (
                      <div className="mt-6 p-5 border rounded-lg bg-emerald-50 border-emerald-100 transition-all duration-500 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Tracking Details</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-teal-100 mr-3">
                              <Truck className="text-teal-600 w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm text-zinc-500">Status</p>
                              <p className="font-medium">{tracking.status}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-emerald-100 mr-3">
                              <Package className="text-emerald-600 w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm text-zinc-500">Order ID</p>
                              <p className="font-medium">{tracking.orderId}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-cyan-100 mr-3">
                              <MapPin className="text-cyan-600 w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm text-zinc-500">Tracking ID</p>
                              <p className="font-medium">{tracking.trackingId}</p>
                            </div>
                          </div>
                        </div>
                        
                        {tracking.qrCode && (
                          <div className="mt-5 flex justify-center">
                            <div className="p-2 bg-white rounded-lg shadow border">
                              <img src={tracking.qrCode} alt="QR Code" className="w-32 h-32" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-6 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] border border-zinc-100">
                    <h2 className="text-xl font-semibold text-zinc-800 flex items-center mb-6">
                      <User className="w-5 h-5 mr-2 text-emerald-600" />
                      Profile
                    </h2>
                    
                    {!editMode ? (
                      <div className="flex flex-col items-center text-center p-5 bg-zinc-50 rounded-lg">
                        <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4 text-white text-2xl font-bold">
                          {userData.name ? userData.name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
                        </div>
                        <h3 className="text-xl font-semibold mb-1">{userData.name}</h3>
                        <p className="text-zinc-500 mb-5">{userData.email}</p>
                        <button
                          className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transform transition-transform duration-200 hover:scale-105 shadow-md flex items-center"
                          onClick={() => setEditMode(true)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                        </button>
                      </div>
                    ) : (
                      <div className="p-5 bg-emerald-50 rounded-lg border border-emerald-100 animate-fadeIn">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
                            <input
                              type="text"
                              placeholder="Your Name"
                              className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                              value={userData.name}
                              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                            <input
                              type="email"
                              placeholder="Your Email"
                              className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                              value={userData.email}
                              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            />
                          </div>
                          
                          <div className="flex space-x-3 pt-3">
                            <button
                              className="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transform transition-transform duration-200 hover:scale-105 shadow-md flex items-center justify-center"
                              onClick={handleProfileUpdate}
                            >
                              <Save className="w-4 h-4 mr-2" /> Save Changes
                            </button>
                            
                            <button
                              className="flex-1 px-5 py-3 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-all duration-200"
                              onClick={() => setEditMode(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, delay, animate, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getGradient = () => {
    switch(color) {
      case 'emerald': return 'from-emerald-500 to-emerald-600';
      case 'teal': return 'from-teal-500 to-teal-600';
      case 'cyan': return 'from-cyan-500 to-cyan-600';
      default: return 'from-emerald-500 to-emerald-600';
    }
  };

  return (
    <div 
      className={`p-6 bg-white shadow-lg rounded-2xl hover:shadow-xl transition-all duration-500 transform ${
        animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${isHovered ? "-translate-y-1" : ""} border border-zinc-100 relative overflow-hidden`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${getGradient()} transform transition-all duration-500 ${
          isHovered ? "rotate-6 scale-110" : ""
        }`}>
          {icon}
        </div>
      </div>
      <h2 className="text-lg font-medium text-zinc-600">{title}</h2>
      <p className="text-3xl font-bold text-zinc-800 mt-1">{value}</p>
      <div className={`mt-4 h-1 w-16 bg-gradient-to-r ${getGradient()} rounded-full transition-all duration-500 ${
        isHovered ? "w-3/4" : ""
      }`}></div>
    </div>
  );
};

// You'll need to add this CSS to your global styles
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fadeIn {
//   animation: fadeIn 0.4s ease-out forwards;
// }

export default CustomerDashboard;