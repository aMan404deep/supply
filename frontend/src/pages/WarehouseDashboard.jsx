import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWarehouseStats, fetchWarehouses, fetchProducts } from "../redux/warehouse/warehouseSlice";
import { 
  Loader2, 
  Package, 
  ClipboardList, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  AlertCircle,
  ChartBar
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import Sidebar from "../components/Sidebar";

const WarehouseDashboard = () => {
  const dispatch = useDispatch();
  const { stats, warehouses, products, loading, error } = useSelector((state) => state.warehouse);
  const [animateStats, setAnimateStats] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showLowStockItems, setShowLowStockItems] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    dispatch(fetchWarehouseStats());
    dispatch(fetchWarehouses());
    dispatch(fetchProducts()); // Fetch all products as well
    setTimeout(() => setAnimateStats(true), 100);
  }, [dispatch]);

  // Process product data to get category distribution when products data changes
  useEffect(() => {
    if (products && Array.isArray(products) && products.length > 0) {
      calculateCategoryDistribution();
    }
  }, [products]);

  // Calculate category distribution based on product data
  const calculateCategoryDistribution = () => {
    const categories = {
      "Electronics": 0,
      "Clothing": 0,
      "Home": 0,
      "Grocery": 0,
      "Other": 0
    };
    
    // Count products by category
    products.forEach(product => {
      if (product.category) {
        categories[product.category] = (categories[product.category] || 0) + product.stock;
      } else {
        categories["Other"] = (categories["Other"] || 0) + product.stock;
      }
    });
    
    // Convert to array format for chart
    const data = Object.keys(categories).map(category => ({
      name: category,
      value: categories[category]
    }));
    
    // Filter out zero-value categories
    const filteredData = data.filter(item => item.value > 0);
    setCategoryData(filteredData);
  };

  const handleWarehouseSelect = (warehouse) => {
    setSelectedWarehouse(warehouse);
  };

  const toggleLowStockItems = () => {
    setShowLowStockItems(!showLowStockItems);
  };

  // Calculate stock utilization percentage for a warehouse
  const calculateUtilization = (warehouse) => {
    if (!warehouse || !warehouse.stock) return 0;
    
    const totalItems = warehouse.stock.reduce((total, item) => total + item.quantity, 0);
    return Math.min(100, Math.round((totalItems / warehouse.capacity) * 100));
  };

  // Get product details by ID
  const getProductDetails = (productId) => {
    if (!products || !Array.isArray(products)) return null;
    return products.find(product => product._id === productId);
  };

  const renderWarehouseDetails = () => {
    if (!selectedWarehouse) return null;

    const utilization = calculateUtilization(selectedWarehouse);
    
    return (
      <div className="bg-white shadow-lg rounded-2xl p-6 mt-6 border border-zinc-100 transform transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-zinc-800">{selectedWarehouse.name} Details</h3>
          <button 
            onClick={() => setSelectedWarehouse(null)}
            className="text-zinc-500 hover:text-zinc-800"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-zinc-700 mb-2">Warehouse Information</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="text-teal-500 w-5 h-5 mr-2" />
                <span className="text-zinc-800">{selectedWarehouse.location}</span>
              </div>
              <div className="flex items-center">
                <Package className="text-teal-500 w-5 h-5 mr-2" />
                <span className="text-zinc-800">Capacity: {selectedWarehouse.capacity} units</span>
              </div>
              <div className="flex items-center">
                <Calendar className="text-teal-500 w-5 h-5 mr-2" />
                <span className="text-zinc-800">
                  Created: {new Date(selectedWarehouse.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-zinc-700 mb-2">Utilization</h4>
            <div className="bg-zinc-100 h-4 rounded-full w-full mb-2">
              <div 
                className={`h-4 rounded-full ${
                  utilization > 90 ? 'bg-red-500' : 
                  utilization > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${utilization}%` }}
              ></div>
            </div>
            <span className="text-sm text-zinc-600">{utilization}% of capacity in use</span>
          </div>
        </div>

        {/* Stock Items */}
        <div className="mt-6">
          <h4 className="font-medium text-zinc-700 mb-2">Inventory ({selectedWarehouse.stock?.length || 0} products)</h4>
          
          {selectedWarehouse.stock && selectedWarehouse.stock.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="py-2 px-4 font-medium text-zinc-700">Product</th>
                    <th className="py-2 px-4 font-medium text-zinc-700">Category</th>
                    <th className="py-2 px-4 font-medium text-zinc-700">Quantity</th>
                    <th className="py-2 px-4 font-medium text-zinc-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedWarehouse.stock.map((item, index) => {
                    const productDetails = getProductDetails(item.product);
                    return (
                      <tr key={index} className="border-t border-zinc-100">
                        <td className="py-2 px-4">{productDetails?.name || "Unknown Product"}</td>
                        <td className="py-2 px-4">{productDetails?.category || "N/A"}</td>
                        <td className="py-2 px-4">{item.quantity}</td>
                        <td className="py-2 px-4">
                          {item.quantity <= (productDetails?.lowStockThreshold || 5) ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-zinc-500 py-2">No inventory items found in this warehouse.</p>
          )}
        </div>
      </div>
    );
  };

  // Get low stock items across all warehouses
  const getLowStockItems = () => {
    if (!warehouses || !Array.isArray(warehouses) || !products || !Array.isArray(products)) return [];
    
    const lowStockItems = [];
    
    warehouses.forEach(warehouse => {
      if (warehouse.stock && Array.isArray(warehouse.stock)) {
        warehouse.stock.forEach(item => {
          const productDetails = getProductDetails(item.product);
          if (!productDetails) return;
          
          // Check if quantity is below threshold
          if (item.quantity <= (productDetails.lowStockThreshold || 5)) {
            lowStockItems.push({
              warehouse: warehouse.name,
              product: productDetails.name,
              category: productDetails.category,
              quantity: item.quantity,
              threshold: productDetails.lowStockThreshold || 5
            });
          }
        });
      }
    });
    
    return lowStockItems;
  };

  // Colors for pie chart that match the color scheme
  const COLORS = ['#10b981', '#0d9488', '#0e7490', '#0891b2', '#14b8a6'];

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
                <Truck size={16} className="mr-2" />
                WAREHOUSE MANAGEMENT
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                <span className="text-zinc-50 block">Warehouse Dashboard</span>
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  Inventory & Distribution
                </span>
              </h1>
              <p className="text-zinc-300 mt-2">Monitor inventory, stock levels, and warehouse capacity across all locations</p>
            </header>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <p className="bg-red-500/10 border border-red-500/20 text-red-500 font-semibold text-center p-4 rounded-xl">
                Error: {error}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-16">
                  <StatCard 
                    title="Total Products" 
                    value={products?.length || 0} 
                    change={stats.productChange || "+0%"} 
                    isPositive={stats.productChange?.startsWith('+') || false} 
                    icon={<Package size={24} className="text-white" />} 
                    delay={0} 
                    animate={animateStats}
                    color="emerald" 
                  />
                  <StatCard 
                    title="Low Stock Items" 
                    value={getLowStockItems().length || 0} 
                    change={stats.lowStockChange || "+0%"} 
                    isPositive={!(stats.lowStockChange?.startsWith('+')) || false} 
                    icon={<AlertCircle size={24} className="text-white" />} 
                    delay={100} 
                    animate={animateStats}
                    color="cyan" 
                    onClick={toggleLowStockItems}
                  />
                  <StatCard 
                    title="Total Warehouses" 
                    value={warehouses?.length || 0} 
                    change={stats.warehouseChange || "+0%"} 
                    isPositive={stats.warehouseChange?.startsWith('+') || false} 
                    icon={<Truck size={24} className="text-white" />} 
                    delay={200} 
                    animate={animateStats}
                    color="teal" 
                  />
                  <StatCard 
                    title="Available Capacity" 
                    value={stats.availableCapacity || 0} 
                    change={stats.capacityChange || "+0%"} 
                    isPositive={stats.capacityChange?.startsWith('+') || false} 
                    icon={<ShieldCheck size={24} className="text-white" />} 
                    delay={300} 
                    animate={animateStats}
                    color="emerald" 
                  />
                </div>

                {/* Low Stock Items Modal */}
                {showLowStockItems && (
                  <div className="bg-white p-6 shadow-lg rounded-2xl mb-8 transform transition-all duration-300 border border-zinc-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-zinc-800">Low Stock Items</h3>
                      <button 
                        onClick={toggleLowStockItems}
                        className="text-zinc-500 hover:text-zinc-800"
                      >
                        Close
                      </button>
                    </div>
                    
                    {getLowStockItems().length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-zinc-50">
                              <th className="py-2 px-4 font-medium text-zinc-700">Warehouse</th>
                              <th className="py-2 px-4 font-medium text-zinc-700">Product</th>
                              <th className="py-2 px-4 font-medium text-zinc-700">Category</th>
                              <th className="py-2 px-4 font-medium text-zinc-700">Quantity</th>
                              <th className="py-2 px-4 font-medium text-zinc-700">Threshold</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getLowStockItems().map((item, index) => (
                              <tr key={index} className="border-t border-zinc-100">
                                <td className="py-2 px-4">{item.warehouse}</td>
                                <td className="py-2 px-4">{item.product}</td>
                                <td className="py-2 px-4">{item.category}</td>
                                <td className="py-2 px-4 text-red-600 font-medium">{item.quantity}</td>
                                <td className="py-2 px-4">{item.threshold}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-zinc-500 py-2">No low stock items found.</p>
                    )}
                  </div>
                )}

                {/* Selected Warehouse Details */}
                {renderWarehouseDetails()}

                {/* Warehouse List Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <ChartCard 
                    title="Product Category Distribution" 
                    subtitle="By inventory quantity"
                    className="lg:col-span-1" 
                  >
                    <div className="h-64">
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-zinc-500">
                          <p>No category data available</p>
                        </div>
                      )}
                    </div>
                  </ChartCard>

                  <ChartCard 
                    title="Warehouse Utilization" 
                    subtitle="Capacity usage by location"
                    className="lg:col-span-2" 
                  >
                    <div className="space-y-4">
                      {warehouses.map((warehouse) => {
                        const utilization = calculateUtilization(warehouse);
                        return (
                          <div key={warehouse._id} className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-zinc-700">{warehouse.name}</span>
                              <span className="text-sm font-medium text-zinc-700">{utilization}%</span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  utilization > 90 ? 'bg-red-500' : 
                                  utilization > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${utilization}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ChartCard>
                </div>

                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-zinc-800 mb-4">All Warehouses</h2>
                  <div className="bg-white p-6 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 border border-zinc-100">
                    {!Array.isArray(warehouses) || warehouses.length === 0 ? (
                      <p className="text-zinc-600 text-center py-8">No warehouses found.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr>
                              <th className="py-4 px-6 font-semibold text-zinc-700 border-b-2 border-zinc-100">Warehouse Name</th>
                              <th className="py-4 px-6 font-semibold text-zinc-700 border-b-2 border-zinc-100">Location</th>
                              <th className="py-4 px-6 font-semibold text-zinc-700 border-b-2 border-zinc-100">Capacity</th>
                              <th className="py-4 px-6 font-semibold text-zinc-700 border-b-2 border-zinc-100">Stock Items</th>
                              <th className="py-4 px-6 font-semibold text-zinc-700 border-b-2 border-zinc-100">Utilization</th>
                              <th className="py-4 px-6 font-semibold text-zinc-700 border-b-2 border-zinc-100">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {warehouses.map((warehouse, index) => {
                              const utilization = calculateUtilization(warehouse);
                              return (
                                <tr 
                                  key={warehouse._id} 
                                  className="hover:bg-zinc-50 transition-colors border-b border-zinc-100"
                                >
                                  <td className="py-4 px-6 font-medium">{warehouse.name}</td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center">
                                      <MapPin size={16} className="text-teal-500 mr-2" />
                                      {warehouse.location}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">{warehouse.capacity} units</td>
                                  <td className="py-4 px-6">{warehouse.stock?.length || 0} products</td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center">
                                      <div className="w-24 bg-zinc-200 rounded-full h-2.5 mr-2">
                                        <div 
                                          className={`h-2.5 rounded-full ${
                                            utilization > 90 ? 'bg-red-500' : 
                                            utilization > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                          }`}
                                          style={{ width: `${utilization}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm text-zinc-600">{utilization}%</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <button
                                      onClick={() => handleWarehouseSelect(warehouse)}
                                      className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-md hover:shadow-md transition-all duration-300"
                                    >
                                      View Details
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
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

// Enhanced StatCard Component
const StatCard = ({ title, value, change, isPositive, icon, delay, animate, color, onClick }) => {
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
      } ${isHovered ? "-translate-y-1" : ""} border border-zinc-100 relative overflow-hidden ${onClick ? "cursor-pointer" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${getGradient()} transform transition-all duration-500 ${
          isHovered ? "rotate-6 scale-110" : ""
        }`}>
          {icon}
        </div>
        <div className={`flex items-center ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
          <span className="text-sm font-medium">{change}</span>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
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

// Chart Card Component
const ChartCard = ({ title, subtitle, children, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`p-6 bg-white shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 border border-zinc-100 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-800">{title}</h2>
          <p className="text-zinc-500">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white transform transition-all duration-500 ${isHovered ? "rotate-6 scale-110" : ""}`}>
          <ChartBar size={20} />
        </div>
      </div>
      {children}
    </div>
  );
};

export default WarehouseDashboard;
