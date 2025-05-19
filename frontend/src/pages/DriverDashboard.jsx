import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup as MapPopup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Sidebar from "../components/Sidebar";
import { Package, ChartBar, MapPin, TrendingUp } from "lucide-react";
import { fetchDriverData, updateDriverOrder } from "../redux/driver/driverSlice"; // Import Redux actions

const DriverDashboard = () => {
  const dispatch = useDispatch();
  const { 
    deliveries, 
    loading, 
    error,
    totalDistance,
    onTimeRate
  } = useSelector((state) => state.driver); // Get state from Redux

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Use the Redux action instead of direct axios call
    dispatch(fetchDriverData());
    setTimeout(() => setAnimateStats(true), 100);
  }, [dispatch]);

  const customIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  // Calculate delivery statistics
  const completedDeliveries = deliveries?.filter(d => d.status === 'Completed').length || 0;
  const inTransitDeliveries = deliveries?.filter(d => d.status === 'In Transit').length || 0;
  const scheduledDeliveries = deliveries?.filter(d => d.status === 'Scheduled').length || 0;

  // Handler to update delivery status
  const handleUpdateStatus = (deliveryId, newStatus, location, otp) => {
    dispatch(updateDriverOrder({ deliveryId, status: newStatus, location, otp }));
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
              <div className="mb-4 inline-flex items-center px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 text-sm font-medium tracking-wider">
                <Package size={16} className="mr-2" />
                DRIVER CONTROL CENTER
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                <span className="text-zinc-50 block">Deliveries</span>
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  Route Management
                </span>
              </h1>
              <p className="text-zinc-300 mt-2">Manage your assigned deliveries and track your progress</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-16">
              <StatCard 
                title="Completed" 
                value={completedDeliveries}
                change="+2 today" 
                isPositive={true} 
                icon={<Package size={24} className="text-white" />} 
                delay={0} 
                animate={animateStats}
                color="emerald" 
              />
              <StatCard 
                title="In Transit" 
                value={inTransitDeliveries}
                change="Next stop in 15min" 
                isPositive={true} 
                icon={<TrendingUp size={24} className="text-white" />} 
                delay={100} 
                animate={animateStats}
                color="teal" 
              />
              <StatCard 
                title="Scheduled" 
                value={scheduledDeliveries}
                change="Today's remaining" 
                isPositive={true} 
                icon={<MapPin size={24} className="text-white" />} 
                delay={200} 
                animate={animateStats}
                color="cyan" 
              />
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 border border-zinc-100 mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-800">Active Deliveries</h2>
                  <p className="text-zinc-500">Manage your delivery routes</p>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  <ChartBar size={20} />
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64 text-red-500">
                  Error loading deliveries: {error}
                </div>
              ) : Array.isArray(deliveries) && deliveries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-zinc-200">
                        <th className="py-3 px-4 text-left text-zinc-500 font-semibold text-sm uppercase">Order ID</th>
                        <th className="py-3 px-4 text-left text-zinc-500 font-semibold text-sm uppercase">Status</th>
                        <th className="py-3 px-4 text-left text-zinc-500 font-semibold text-sm uppercase">Location</th>
                        <th className="py-3 px-4 text-left text-zinc-500 font-semibold text-sm uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map((delivery, index) => (
                        <tr
                          key={delivery._id}
                          className={`border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors duration-150 ${
                            animateStats ? "opacity-100" : "opacity-0"
                          }`}
                          style={{ transitionDelay: `${300 + index * 50}ms` }}
                        >
                          <td className="py-4 px-4 font-medium text-zinc-800">{delivery.order?._id || "N/A"}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                              ${delivery.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                              delivery.status === 'In Transit' ? 'bg-cyan-100 text-cyan-700' : 
                              delivery.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' : 
                              'bg-red-100 text-red-700'}`}>
                              {delivery.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-zinc-600">{delivery.location || "Unknown"}</td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => {
                                setSelectedDelivery(delivery);
                                setShowMap(true);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all text-sm font-medium flex items-center"
                            >
                              <MapPin size={16} className="mr-2" />
                              View Map
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-zinc-500">
                  No deliveries found. Check back later for new assignments.
                </div>
              )}
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 border border-zinc-100 mb-8">
              <h2 className="text-xl font-semibold text-zinc-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { 
                    label: "Today's Route", 
                    icon: <MapPin size={20} />,
                    action: () => dispatch(fetchDriverData())
                  },
                  { 
                    label: "Delivery History", 
                    icon: <Package size={20} />,
                    action: () => console.log("View history")
                  },
                  { 
                    label: "Update Status", 
                    icon: <TrendingUp size={20} />,
                    action: () => {
                      if (selectedDelivery) {
                        // Example update - in a real app, you'd have a modal or form
                        handleUpdateStatus(
                          selectedDelivery._id,
                          'In Transit',
                          { lat: 37.7749, lng: -122.4194 },
                          null
                        );
                      }
                    }
                  },
                  { 
                    label: "Support", 
                    icon: <ChartBar size={20} />,
                    action: () => console.log("Open support")
                  },
                ].map((action, index) => (
                  <button 
                    key={index}
                    className="flex items-center justify-center gap-2 p-4 bg-zinc-50 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 rounded-xl border border-zinc-200 transition-all hover:shadow-md group"
                    onClick={action.action}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white transform transition-all duration-300 group-hover:rotate-6">
                      {action.icon}
                    </div>
                    <span className="font-medium text-zinc-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Popup */}
        {showMap && selectedDelivery && selectedDelivery.location && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl relative w-11/12 max-w-5xl h-3/4">
              <div className="absolute top-4 right-4">
                <button
                  className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 p-2 rounded-full transition-colors"
                  onClick={() => setShowMap(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-zinc-800">Delivery Location</h3>
                <p className="text-zinc-500">Order ID: {selectedDelivery.order?._id || "N/A"}</p>
              </div>

              <div className="h-5/6 rounded-lg overflow-hidden">
                <MapContainer
                  center={[selectedDelivery.location.lat, selectedDelivery.location.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="w-full h-full rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[selectedDelivery.location.lat, selectedDelivery.location.lng]}
                    icon={customIcon}
                  >
                    <MapPopup>
                      <div className="text-zinc-800">
                        <strong>Delivery Location</strong>
                        <p>Order: {selectedDelivery.order?._id || "N/A"}</p>
                        <p>Status: {selectedDelivery.status}</p>
                      </div>
                    </MapPopup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, change, isPositive, icon, delay, animate, color }) => {
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
        <div className="text-zinc-500 text-sm font-medium">
          <span>{change}</span>
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

export default DriverDashboard;