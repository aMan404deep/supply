import { useState, useEffect } from "react";
import { TruckIcon, BoxIcon, ShieldCheckIcon, ChartBarIcon, ArrowRightIcon } from "lucide-react";

const Home = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <div className="bg-zinc-50 font-sans">
      {/* Hero Section with Dynamic 3D Effect */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with depth layers */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-900"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        
        {/* Geometric shapes for modern aesthetic */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-emerald-400 blur-3xl"
               style={{ transform: `translateY(${scrollY * 0.15}px)` }}></div>
          <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full bg-cyan-500 blur-3xl"
               style={{ transform: `translateY(${-scrollY * 0.2}px)` }}></div>
          <div className="absolute bottom-20 right-1/3 w-80 h-80 rounded-full bg-teal-400 blur-3xl"
               style={{ transform: `translateY(${-scrollY * 0.25}px)` }}></div>
        </div>
        
        {/* Content */}
        <div 
          className="relative z-10 px-6 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          style={{ 
            transform: `translateY(${-scrollY * 0.05}px)`,
            opacity: 1 - scrollY * 0.001
          }}
        >
          <div className="text-white">
            <div className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium tracking-wider">
              <TruckIcon size={16} className="mr-2" />
              NEXT-GEN LOGISTICS PLATFORM
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-8">
              <span className="text-zinc-50 block mb-2">Smart</span>
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                Supply Chain Intelligence
              </span>
            </h1>
            <p className="text-lg lg:text-xl mb-10 text-zinc-300 max-w-xl leading-relaxed">
              Elevate your logistics with AI-powered tracking, inventory management, and predictive analytics for the modern enterprise.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="/login" 
                className="group px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center"
              >
                Start Free Trial
                <ArrowRightIcon size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/track" 
                className="px-8 py-4 bg-zinc-800/50 backdrop-blur-lg hover:bg-zinc-800/70 border border-zinc-700 text-white font-medium rounded-lg transition-all duration-300"
              >
                Track Shipment
              </a>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="relative w-full h-full min-h-[400px]">
              {/* 3D-like dashboard visualization */}
              <div className="absolute top-0 right-0 w-full h-full bg-zinc-900/90 rounded-3xl shadow-2xl overflow-hidden border border-zinc-800"
                   style={{ transform: `perspective(1000px) rotateY(-15deg) rotateX(5deg) translateZ(0)` }}>
                <div className="p-4">
                  <div className="flex items-center mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="ml-4 h-6 w-40 bg-zinc-800 rounded-md"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="h-24 bg-zinc-800/80 rounded-lg p-4 flex flex-col justify-between">
                      <div className="text-xs text-zinc-400">Active Shipments</div>
                      <div className="text-2xl text-emerald-400 font-bold">428</div>
                      <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-emerald-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="h-24 bg-zinc-800/80 rounded-lg p-4 flex flex-col justify-between">
                      <div className="text-xs text-zinc-400">On-Time Delivery</div>
                      <div className="text-2xl text-teal-400 font-bold">96.3%</div>
                      <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full w-11/12 bg-teal-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-48 bg-zinc-800/80 rounded-lg p-4">
                    <div className="text-xs text-zinc-400 mb-2">Daily Shipment Volume</div>
                    <div className="h-32 flex items-end space-x-2">
                      {[40, 65, 35, 85, 55, 70, 90].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-emerald-600 to-cyan-500 rounded-sm"
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="text-xs text-zinc-500 mt-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="h-20 bg-zinc-800/80 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating elements for depth */}
              <div className="absolute -top-4 -right-4 w-28 h-28 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl shadow-lg"
                   style={{ transform: `perspective(1000px) rotateY(-5deg) rotateX(10deg) translateZ(20px)` }}>
                <div className="w-full h-full flex items-center justify-center text-white">
                  <TruckIcon size={36} />
                </div>
              </div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl shadow-lg"
                   style={{ transform: `perspective(1000px) rotateY(10deg) rotateX(-5deg) translateZ(40px)` }}>
                <div className="w-full h-full flex items-center justify-center text-white">
                  <ChartBarIcon size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scrolling indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-zinc-400">
          <span className="text-sm mb-2">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-zinc-500 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-zinc-400 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12">
            {[
              { value: "98.7%", label: "Delivery Accuracy" },
              { value: "12.4M", label: "Shipments Tracked" },
              { value: "24%", label: "Cost Reduction" },
              { value: "3.2hr", label: "Average Response Time" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-zinc-50 rounded-xl hover:shadow-md transition-all">
                <div className="text-3xl lg:text-4xl font-bold text-emerald-600 mb-2">{stat.value}</div>
                <div className="text-zinc-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Feature Grid Section */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-4">
              KEY CAPABILITIES
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-zinc-900">Redefine Your Supply Chain</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Our intelligent platform unifies tracking, inventory, and analytics in a seamless experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<TruckIcon size={28} />}
              title="Real-Time Tracking" 
              desc="Live GPS tracking with AI-powered ETA predictions and automated alerts." 
              color="emerald"
              num="01"
            />
            <FeatureCard 
              icon={<BoxIcon size={28} />}
              title="Inventory Intelligence" 
              desc="Smart forecasting with automated reordering and warehouse optimization." 
              color="teal"
              num="02"
            />
            <FeatureCard 
              icon={<ShieldCheckIcon size={28} />}
              title="Secure Blockchain" 
              desc="Immutable record-keeping with end-to-end encryption and verification." 
              color="cyan"
              num="03"
            />
            <FeatureCard 
              icon={<ChartBarIcon size={28} />}
              title="Advanced Analytics" 
              desc="Interactive dashboards with predictive insights and custom reporting." 
              color="emerald"
              num="04"
            />
            <FeatureCard 
              icon={<BoxIcon size={28} />}
              title="Route Optimization" 
              desc="ML-powered routing to minimize fuel costs and delivery times." 
              color="teal"
              num="05"
            />
            <FeatureCard 
              icon={<ShieldCheckIcon size={28} />}
              title="Sustainability Metrics" 
              desc="Carbon footprint tracking and eco-friendly logistics planning." 
              color="cyan"
              num="06"
            />
          </div>
        </div>
      </section>
      
      {/* Analytics Showcase Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-100 text-teal-800 text-sm font-medium mb-4">
                DATA-DRIVEN INSIGHTS
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-zinc-900">Transform Data Into Strategic Decisions</h2>
              <p className="text-lg text-zinc-600 mb-8">
                Our intuitive analytics platform provides complete visibility into your supply chain with actionable intelligence.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    title: "Identify Performance Patterns",
                    desc: "Uncover hidden bottlenecks and optimize routes with machine learning"
                  },
                  {
                    title: "Predict Future Trends",
                    desc: "Forecasting models that adapt to market changes and seasonal patterns"
                  },
                  {
                    title: "Cost Optimization Engine",
                    desc: "Automatically identify cost-saving opportunities across operations"
                  }
                ].map((item, i) => (
                  <div key={i} className="flex">
                    <div className="mr-4 mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-zinc-800 mb-1">{item.title}</h3>
                      <p className="text-zinc-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10">
                <a 
                  href="/analytics" 
                  className="group inline-flex items-center font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Explore Analytics Platform
                  <ArrowRightIcon size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-12 -left-12 w-full h-full bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-3xl transform -rotate-2"></div>
              <div className="relative bg-white p-4 rounded-3xl shadow-xl transform rotate-1 border border-zinc-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
                  <rect width="800" height="500" fill="#1e293b" rx="12" ry="12"/>
                  
                  <rect x="20" y="20" width="760" height="60" fill="#1e2736" rx="8" ry="8"/>
                  <circle cx="50" cy="50" r="10" fill="#ef4444"/>
                  <circle cx="80" cy="50" r="10" fill="#f59e0b"/>
                  <circle cx="110" cy="50" r="10" fill="#10b981"/>
                  <rect x="140" y="40" width="200" height="20" fill="#334155" rx="4" ry="4"/>
                  <rect x="600" y="40" width="160" height="20" fill="#334155" rx="10" ry="10"/>
                  
                  <rect x="20" y="100" width="180" height="380" fill="#1e2736" rx="8" ry="8"/>
                  
                  <rect x="40" y="130" width="140" height="40" fill="#0f766e" rx="6" ry="6"/>
                  <rect x="50" y="145" width="20" height="10" fill="#fff"/>
                  <rect x="80" y="145" width="80" height="10" fill="#fff"/>
                  
                  <rect x="40" y="190" width="140" height="40" fill="#334155" rx="6" ry="6"/>
                  <rect x="50" y="205" width="20" height="10" fill="#64748b"/>
                  <rect x="80" y="205" width="80" height="10" fill="#64748b"/>
                  
                  <rect x="40" y="250" width="140" height="40" fill="#334155" rx="6" ry="6"/>
                  <rect x="50" y="265" width="20" height="10" fill="#64748b"/>
                  <rect x="80" y="265" width="80" height="10" fill="#64748b"/>
                  
                  <rect x="40" y="310" width="140" height="40" fill="#334155" rx="6" ry="6"/>
                  <rect x="50" y="325" width="20" height="10" fill="#64748b"/>
                  <rect x="80" y="325" width="80" height="10" fill="#64748b"/>
                  
                  <rect x="220" y="100" width="560" height="380" fill="#1e2736" rx="8" ry="8"/>
                  
                  <rect x="240" y="120" width="200" height="24" fill="#2d3748" rx="4" ry="4"/>
                  <rect x="240" y="154" width="120" height="16" fill="#475569" rx="3" ry="3"/>
                  
                  <rect x="240" y="190" width="160" height="100" fill="#1f2937" rx="8" ry="8"/>
                  <rect x="255" y="205" width="130" height="15" fill="#334155" rx="2" ry="2"/>
                  <rect x="255" y="230" width="80" height="20" fill="#0ea5e9" rx="2" ry="2"/>
                  <rect x="255" y="260" width="130" height="8" fill="#475569" rx="4" ry="4"/>
                  <rect x="255" y="272" width="90" height="8" fill="#0ea5e9" rx="4" ry="4" opacity="0.7"/>
                  
                  <rect x="420" y="190" width="160" height="100" fill="#1f2937" rx="8" ry="8"/>
                  <rect x="435" y="205" width="130" height="15" fill="#334155" rx="2" ry="2"/>
                  <rect x="435" y="230" width="80" height="20" fill="#10b981" rx="2" ry="2"/>
                  <rect x="435" y="260" width="130" height="8" fill="#475569" rx="4" ry="4"/>
                  <rect x="435" y="272" width="100" height="8" fill="#10b981" rx="4" ry="4" opacity="0.7"/>
                  
                  <rect x="600" y="190" width="160" height="100" fill="#1f2937" rx="8" ry="8"/>
                  <rect x="615" y="205" width="130" height="15" fill="#334155" rx="2" ry="2"/>
                  <rect x="615" y="230" width="80" height="20" fill="#8b5cf6" rx="2" ry="2"/>
                  <rect x="615" y="260" width="130" height="8" fill="#475569" rx="4" ry="4"/>
                  <rect x="615" y="272" width="70" height="8" fill="#8b5cf6" rx="4" ry="4" opacity="0.7"/>
                  
                  <rect x="240" y="310" width="320" height="150" fill="#1f2937" rx="8" ry="8"/>
                  <rect x="255" y="325" width="130" height="15" fill="#334155" rx="2" ry="2"/>
                  
                  <polyline points="260,400 290,390 320,410 350,370 380,380 410,350 440,360 470,330 500,345 530,320" 
                          fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          
                  <polyline points="260,420 290,430 320,415 350,425 380,405 410,415 440,395 470,405 500,385 530,380" 
                          fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          
                  <line x1="260" y1="430" x2="530" y2="430" stroke="#64748b" strokeWidth="1"/>
                  <line x1="260" y1="430" x2="260" y2="330" stroke="#64748b" strokeWidth="1"/>

                  <rect x="270" y="440" width="10" height="5" fill="#64748b" rx="1" ry="1"/>
                  <rect x="330" y="440" width="10" height="5" fill="#64748b" rx="1" ry="1"/>
                  <rect x="390" y="440" width="10" height="5" fill="#64748b" rx="1" ry="1"/>
                  <rect x="450" y="440" width="10" height="5" fill="#64748b" rx="1" ry="1"/>
                  <rect x="510" y="440" width="10" height="5" fill="#64748b" rx="1" ry="1"/>
                  
                  <rect x="245" y="370" width="10" height="5" fill="#64748b" rx="1" ry="1"/>
                  <rect x="245" y="400" width="10" height="5" fill="#64748b" rx="1" ry="1"/>
                  <rect x="245" y="340" width="10" height="5" fill="#64748b" rx="1" ry="1"/>
                  
                  <rect x="580" y="310" width="180" height="150" fill="#1f2937" rx="8" ry="8"/>
                  <rect x="595" y="325" width="100" height="15" fill="#334155" rx="2" ry="2"/>
                  
                  <circle cx="670" cy="385" r="50" fill="none" stroke="#475569" strokeWidth="1"/>
                  
                  <path d="M670,385 L670,335 A50,50 0 0,1 713,407 z" fill="#10b981"/>
                  <path d="M670,385 L713,407 A50,50 0 0,1 627,407 z" fill="#0ea5e9"/>
                  <path d="M670,385 L627,407 A50,50 0 0,1 670,335 z" fill="#8b5cf6"/>
                  
                  <rect x="595" y="435" width="10" height="10" fill="#10b981" rx="2" ry="2"/>
                  <rect x="610" y="435" width="40" height="5" fill="#64748b" rx="1" ry="1"/>
                  
                  <rect x="665" y="435" width="10" height="10" fill="#0ea5e9" rx="2" ry="2"/>
                  <rect x="680" y="435" width="40" height="5" fill="#64748b" rx="1" ry="1"/>
                  
                  <rect x="595" y="450" width="10" height="10" fill="#8b5cf6" rx="2" ry="2"/>
                  <rect x="610" y="450" width="40" height="5" fill="#64748b" rx="1" ry="1"/>
                </svg> 
                <div className="absolute -bottom-8 -right-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg flex items-center text-white">
                  <ChartBarIcon size={24} className="mr-2" />
                  <span className="font-medium">Live Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-24 bg-zinc-900 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-emerald-500 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-500 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-800 text-emerald-400 text-sm font-medium mb-4">
              CUSTOMER STORIES
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-white">What Industry Leaders Say</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Join thousands of businesses revolutionizing their logistics operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "We've cut shipping costs by 23% and improved customer satisfaction by 31% since implementation.",
                author: "Sarah Johnson",
                role: "Logistics Director, TechCorp",
                gradient: "from-emerald-500 to-teal-600"
              },
              {
                quote: "The real-time tracking and predictive analytics have completely transformed our supply chain efficiency.",
                author: "Michael Chen",
                role: "COO, Global Retail Inc.",
                gradient: "from-teal-500 to-cyan-600"
              },
              {
                quote: "Customer satisfaction increased dramatically with the improved delivery accuracy and transparency.",
                author: "Emma Rodriguez",
                role: "VP of Operations, FastShip",
                gradient: "from-cyan-500 to-emerald-600"
              }
            ].map((testimonial, i) => (
              <div key={i} 
                className="bg-zinc-800/70 backdrop-blur-md rounded-2xl p-8 border border-zinc-700 hover:shadow-lg hover:shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-1">
                <div className={`h-1 w-12 bg-gradient-to-r ${testimonial.gradient} rounded-full mb-6`}></div>
                <p className="text-zinc-300 mb-8 leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold`}>
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-white">{testimonial.author}</div>
                    <div className="text-zinc-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Logos */}
          <div className="mt-20">
            <div className="text-center text-zinc-500 mb-8 text-sm font-medium tracking-wider">TRUSTED BY INDUSTRY LEADERS</div>
            <div className="flex flex-wrap justify-center gap-8 opacity-70">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-8 w-32 bg-zinc-700 rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-emerald-500/20 blur-2xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl"></div>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="w-full h-full flex items-center justify-center opacity-5">
              <div className="w-96 h-96 border-2 border-emerald-500 rounded-full"></div>
              <div className="absolute w-80 h-80 border-2 border-cyan-500 rounded-full"></div>
              <div className="absolute w-64 h-64 border-2 border-teal-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center px-6 py-2 rounded-full bg-white/10 text-emerald-300 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
            START OPTIMIZING TODAY
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">Ready to Transform Your Supply Chain?</h2>
          <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses that trust our platform for end-to-end logistics management.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/signup" 
              className="group px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center"
            >
              Start 14-Day Free Trial
              <ArrowRightIcon size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="/demo" 
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-white font-medium rounded-lg transition-all duration-300"
            >
              Schedule Live Demo
            </a>
          </div>
          
          <div className="mt-10 text-zinc-400 text-sm">
            No credit card required. Full-featured 14-day trial.
          </div>
        </div>
      </section>
      
      {/* Modern Footer */}
      <footer className="bg-zinc-900 text-zinc-400 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
            <div className="col-span-2">
              <div className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="mr-3 w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <TruckIcon size={18} className="text-white" />
                </div>
                EverStock
              </div>
              <p className="text-zinc-400 mb-6">
                Next-generation logistics management for the modern enterprise. Simplify operations, reduce costs, and boost efficiency.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'linkedin', 'facebook', 'github'].map(platform => (
                  <a key={platform} href={`#${platform}`} className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors">
                    <span className="sr-only">{platform}</span>
                    <div className="w-5 h-5 bg-zinc-500 rounded-sm"></div>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                {['Tracking', 'Inventory', 'Analytics', 'Integrations', 'Mobile App'].map(item => (
                  <li key={item}>
                    <a href={`/${item.toLowerCase()}`} className="hover:text-emerald-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                {['Documentation', 'API Reference', 'Blog', 'Guides', 'Case Studies'].map(item => (
                  <li key={item}>
                    <a href={`/resources/${item.toLowerCase()}`} className="hover:text-emerald-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-white mb-4">Company</h4>
              <ul className="space-y-3">
                {['About', 'Careers', 'Press', 'Partners', 'Contact'].map(item => (
                  <li key={item}>
                    <a href={`/company/${item.toLowerCase()}`} className="hover:text-emerald-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                {['Terms', 'Privacy', 'Security', 'Compliance', 'GDPR'].map(item => (
                  <li key={item}>
                    <a href={`/legal/${item.toLowerCase()}`} className="hover:text-emerald-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} EverStock. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <a href="/contact" className="flex items-center bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-lg px-4 py-2">
                <span className="mr-2">Contact Support</span>
                <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Enhanced Modern Feature Card Component
const FeatureCard = ({ icon, title, desc, color, num }) => {
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
      className={`p-8 rounded-2xl transition-all duration-500 transform ${
        isHovered ? 'shadow-xl -translate-y-1' : 'shadow-md'
      } bg-white border border-zinc-100 relative overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Feature number - subtle background element */}
      <div className="absolute -top-4 -right-4 text-8xl font-bold text-zinc-100 z-0 select-none">
        {num}
      </div>
      
      <div className="relative z-10">
        <div className={`mb-6 p-3 rounded-lg inline-block bg-gradient-to-r ${getGradient()} text-white transform transition-all duration-500 ${
          isHovered ? 'rotate-6 scale-110' : ''
        }`}>
          {icon}
        </div>
        
        <h3 className="text-xl font-bold mb-3 text-zinc-900">{title}</h3>
        <p className="text-zinc-600 leading-relaxed">{desc}</p>
        
        <div className={`mt-6 w-12 h-1 bg-gradient-to-r ${getGradient()} rounded-full transition-all duration-500 ${
          isHovered ? 'w-3/4' : ''
        }`}></div>
      </div>
    </div>
  );
};

export default Home;