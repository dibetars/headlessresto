"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  QrCode, 
  ChefHat, 
  LayoutDashboard, 
  Utensils, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  Smartphone,
  Monitor,
  Bell,
  Check,
  Zap,
  Battery,
  Wifi,
  Signal,
  CreditCard,
  Lock,
  Search,
  Settings,
  Users,
  Menu,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = {
  id: string;
  role: "customer" | "kitchen" | "waiter" | "admin";
  title: string;
  description: string;
  video: string;
  icon: React.ReactNode;
};

const demoSteps: Step[] = [
  {
    id: "qr-menu",
    role: "customer",
    title: "Step 1: The Guest Experience",
    description: "Your guest scans a QR code at their table. No app to download. They browse your beautiful, high-res menu and place their order instantly.",
    video: "/Source/media/header2.mp4",
    icon: <QrCode className="h-6 w-6" />,
  },
  {
    id: "kds-arrival",
    role: "kitchen",
    title: "Step 2: Instant Kitchen Alert",
    description: "The order lands on the Kitchen Display System (KDS) in milliseconds. No paper tickets. Items are automatically grouped and timed for efficiency.",
    video: "/Source/media/header3.mp4",
    icon: <ChefHat className="h-6 w-6" />,
  },
  {
    id: "waiter-update",
    role: "waiter",
    title: "Step 3: Waiter Notification",
    description: "Your staff gets a notification on their device. They know exactly which table is waiting and what stage the order is in.",
    video: "/Source/media/header4.mp4",
    icon: <Utensils className="h-6 w-6" />,
  },
  {
    id: "fulfillment",
    role: "kitchen",
    title: "Step 4: Fulfillment",
    description: "Kitchen marks the order as ready. A notification is sent to the waiter for pickup. Total order time is tracked for performance analysis.",
    video: "/Source/media/header5.mp4",
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
  {
    id: "admin-insight",
    role: "admin",
    title: "Step 5: Live Analytics",
    description: "As the owner, you see everything in real-time. Revenue, popular items, and average fulfillment speed — all from your mobile dashboard.",
    video: "/Source/media/header7.mp4",
    icon: <LayoutDashboard className="h-6 w-6" />,
  },
];

export default function DemoWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  
  // Interactive States
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"review" | "pay" | "success">("review");
  const [kitchenStatus, setKitchenStatus] = useState<string[]>([]);
  const [kitchenNotification, setKitchenNotification] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<number[]>([]);

  // Loading States for Real Feel
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const nextStep = () => {
    setIsProcessingAction(true);
    setTimeout(() => {
      if (currentStep < demoSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setCurrentStep(0);
      }
      // Reset interaction states on step change
      setShowPayment(false);
      setPaymentStep("review");
      setKitchenNotification(null);
      setSelectedAlert(null);
      setIsProcessingAction(false);
    }, 400); // Small delay for "loading" feel
  };

  const prevStep = () => {
    setIsProcessingAction(true);
    setTimeout(() => {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
      setIsProcessingAction(false);
    }, 400);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying) {
      timer = setInterval(nextStep, 6000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, currentStep]);

  const addToCart = (item: any, index: number) => {
    setIsAddingToCart(index);
    setTimeout(() => {
      setCartItems(prev => [...prev, item]);
      setIsAddingToCart(null);
    }, 600);
  };

  const removeFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewOrder = () => {
    setIsProcessingAction(true);
    setTimeout(() => {
      setShowPayment(true);
      setIsProcessingAction(false);
    }, 800);
  };

  const markKitchenReady = (table: string) => {
    setIsProcessingAction(true);
    setTimeout(() => {
      setKitchenStatus(prev => [...prev, table]);
      setKitchenNotification(`Notification sent to Waiter: Table ${table} is ready!`);
      setIsProcessingAction(false);
      setTimeout(() => setKitchenNotification(null), 3000);
    }, 1000);
  };

  const step = demoSteps[currentStep];

  return (
    <div className="flex flex-col min-h-screen bg-black text-foreground font-work-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
        <div className="flex h-14 items-center bg-black/60 backdrop-blur-xl border border-white/[0.1] rounded-[24px] shadow-2xl px-3 gap-2">
          <Link href="/" className="flex items-center pl-3 pr-4 group cursor-pointer shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2 text-white/60 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Exit Demo</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <div className="flex items-center gap-1">
            {demoSteps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentStep ? "w-6 bg-brand-orange" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        <section className="relative flex-1 min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 z-0">
            <video
              key={step.video}
              src={step.video}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 object-cover w-full h-full opacity-40 transition-opacity duration-1000"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="container relative z-10 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Content Side */}
              <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20">
                  <span className="text-brand-orange">{step.icon}</span>
                  <span className="text-brand-orange text-[10px] font-medium uppercase tracking-[0.2em]">
                    {step.role} View
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-medium uppercase tracking-tighter text-white leading-none">
                  {step.title}
                </h1>
                
                <p className="text-white/60 text-xl md:text-2xl font-medium leading-relaxed max-w-xl">
                  {step.description}
                </p>

                <div className="flex flex-wrap gap-4 pt-8">
                  <Button 
                    onClick={prevStep}
                    disabled={currentStep === 0 || isProcessingAction}
                    loading={isProcessingAction && currentStep > 0}
                    variant="outline"
                    className="h-14 px-8 rounded-2xl bg-white/5 border-white/10 text-white font-medium text-xs uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30"
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={isProcessingAction}
                    loading={isProcessingAction}
                    className="h-14 px-8 rounded-2xl bg-brand-orange hover:bg-amber-500 text-white font-medium text-xs uppercase tracking-widest transition-all group shadow-xl shadow-brand-orange/20"
                  >
                    {currentStep === demoSteps.length - 1 ? "Start Again" : "Next Step"}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <Button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    variant="ghost"
                    className={`h-14 px-6 rounded-2xl text-[10px] uppercase tracking-widest font-medium transition-all ${
                      isAutoPlaying ? "text-brand-orange bg-brand-orange/10" : "text-white/40"
                    }`}
                  >
                    {isAutoPlaying ? "Auto-playing..." : "Enable Auto-play"}
                  </Button>
                </div>
              </div>

              {/* Visualization Side (Phone/Tablet/Monitor Frame) */}
              <div className="flex justify-center items-center relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
                
                {/* 1. Phone Frame (Customer & Waiter) */}
                {(step.role === "customer" || step.role === "waiter") && (
                  <div className="relative w-[300px] h-[600px] bg-[#1a1a1a] rounded-[3rem] border-[8px] border-[#333] shadow-2xl p-2 transition-all">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#333] rounded-b-2xl z-20" />
                    {/* Screen Content */}
                    <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative border border-white/5">
                      {/* Status Bar */}
                      <div className="h-10 px-8 flex justify-between items-center bg-black">
                        <span className="text-[10px] font-bold text-white">12:45</span>
                        <div className="flex items-center gap-1.5">
                          <Signal className="h-3 w-3 text-white" />
                          <Wifi className="h-3 w-3 text-white" />
                          <Battery className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      {/* Mockup Screens */}
                      <div className="h-[calc(100%-40px)] relative overflow-hidden">
                        
                        {/* CUSTOMER VIEW */}
                        {step.role === "customer" && (
                          <div className="flex flex-col h-full bg-[#0F0F0F]">
                            {!showPayment ? (
                              <>
                                <div className="px-6 py-4 flex justify-between items-center border-b border-white/5">
                                  <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">Table 04</span>
                                  <Menu className="h-4 w-4 text-white/40" />
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                  {[
                                    { name: "Truffle Pasta", price: 24, img: "https://images.unsplash.com/photo-1523905330026-b8bd1f5f320e?q=80&w=200&auto=format&fit=crop" },
                                    { name: "Wagyu Burger", price: 18, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop" }
                                  ].map((item, i) => (
                                    <div key={i} className="group relative rounded-2xl bg-white/5 border border-white/5 p-3 flex gap-3">
                                      <img src={item.img} className="h-14 w-14 rounded-xl object-cover" />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold text-white uppercase">{item.name}</div>
                                        <div className="text-[9px] text-brand-orange font-bold mt-1">${item.price}</div>
                                        <button 
                                          onClick={() => addToCart(item, i)}
                                          disabled={isAddingToCart !== null}
                                          className="mt-2 h-6 px-3 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[8px] font-bold uppercase active:scale-95 transition-all flex items-center justify-center min-w-[80px]"
                                        >
                                          {isAddingToCart === i ? (
                                            <div className="h-2 w-2 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            "Add to Order"
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="p-4 bg-black/80 border-t border-white/10">
                                  <button 
                                    onClick={handleViewOrder}
                                    disabled={cartItems.length === 0 || isProcessingAction}
                                    className="w-full h-12 rounded-xl bg-brand-orange text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 disabled:opacity-30"
                                  >
                                    {isProcessingAction ? (
                                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <>View Order ({cartItems.length})</>
                                    )}
                                  </button>
                                </div>
                              </>
                            ) : (
                              /* Payment Flow */
                              <div className="flex flex-col h-full bg-[#0F0F0F] animate-in slide-in-from-right duration-300">
                                <div className="px-6 py-4 flex items-center border-b border-white/5">
                                  <button onClick={() => setShowPayment(false)} className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center mr-3">
                                    <ArrowLeft className="h-4 w-4 text-white" />
                                  </button>
                                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                    {paymentStep === "review" ? "Review Order" : paymentStep === "pay" ? "Checkout" : "Order Placed"}
                                  </span>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-6">
                                  {paymentStep === "review" && (
                                    <div className="space-y-4">
                                      {cartItems.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-white">
                                          <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-brand-orange">1x</span>
                                            <span className="text-[10px] uppercase font-medium">{item.name}</span>
                                          </div>
                                          <span className="text-[10px] font-bold">${item.price}</span>
                                        </div>
                                      ))}
                                      <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-center text-white">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Total</span>
                                        <span className="text-xl font-bold">${cartItems.reduce((acc, curr) => acc + curr.price, 0)}</span>
                                      </div>
                                    </div>
                                  )}

                                  {paymentStep === "pay" && (
                                    <div className="space-y-6">
                                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                        <div className="flex items-center gap-3 text-white/40">
                                          <CreditCard className="h-4 w-4" />
                                          <span className="text-[10px] font-bold uppercase tracking-widest">Credit Card</span>
                                        </div>
                                        <div className="h-8 w-full bg-white/5 rounded-lg border border-white/5 px-3 flex items-center text-white/20 text-[10px]">•••• •••• •••• 4242</div>
                                      </div>
                                      <div className="flex items-center gap-2 justify-center text-white/20 text-[9px] uppercase font-bold">
                                        <Lock className="h-3 w-3" />
                                        Secure Payment via Stripe
                                      </div>
                                    </div>
                                  )}

                                  {paymentStep === "success" && (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-500">
                                      <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                                        <Check className="h-8 w-8 text-green-500" />
                                      </div>
                                      <h6 className="text-white text-lg font-bold uppercase">Success!</h6>
                                      <p className="text-white/40 text-[10px] font-medium leading-relaxed">Your order is being prepared and will be at Table 04 shortly.</p>
                                    </div>
                                  )}
                                </div>

                                {paymentStep !== "success" && (
                                  <div className="p-4 bg-black/80 border-t border-white/10">
                                    <button 
                                      onClick={() => {
                                        setIsProcessingAction(true);
                                        setTimeout(() => {
                                          setPaymentStep(paymentStep === "review" ? "pay" : "success");
                                          setIsProcessingAction(false);
                                        }, 1200);
                                      }}
                                      disabled={isProcessingAction}
                                      className="w-full h-12 rounded-xl bg-brand-orange text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2"
                                    >
                                      {isProcessingAction ? (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <>{paymentStep === "review" ? "Proceed to Pay" : "Pay Now"}</>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* WAITER VIEW */}
                        {step.role === "waiter" && (
                          <div className="flex flex-col h-full bg-[#0F0F0F] relative">
                            <div className="px-6 py-4 flex justify-between items-center border-b border-white/5">
                              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Active Alerts</span>
                              <span className="h-5 w-5 rounded-full bg-brand-orange text-white text-[9px] font-bold flex items-center justify-center">2</span>
                            </div>
                            <div className="p-4 space-y-3">
                              {[
                                { table: "04", msg: "Order ready", items: ["Truffle Pasta", "Burger"], status: "Ready" },
                                { table: "12", msg: "Help requested", reason: "Missing silverware", status: "Call" }
                              ].map((alert, i) => (
                                <div 
                                  key={i} 
                                  onClick={() => setSelectedAlert(alert)}
                                  className="p-4 rounded-xl border border-brand-orange/20 bg-brand-orange/5 cursor-pointer hover:bg-brand-orange/10 transition-all"
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Table {alert.table}</span>
                                    <span className="text-brand-orange text-[8px] font-bold uppercase">{alert.status}</span>
                                  </div>
                                  <p className="text-white/40 text-[9px] uppercase font-medium">{alert.msg}</p>
                                </div>
                              ))}
                            </div>

                            {/* Details Pane Overlay */}
                            {selectedAlert && (
                              <div className="absolute inset-0 bg-black/90 z-30 animate-in slide-in-from-bottom duration-300 flex flex-col">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                  <span className="text-white text-xs font-bold uppercase tracking-widest">Table {selectedAlert.table} Details</span>
                                  <button onClick={() => setSelectedAlert(null)} className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                                    <Minus className="h-4 w-4 text-white" />
                                  </button>
                                </div>
                                <div className="flex-1 p-6 space-y-6">
                                  <div className="space-y-3">
                                    <span className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em]">Request</span>
                                    <p className="text-white text-sm font-medium leading-relaxed">{selectedAlert.msg}</p>
                                  </div>
                                  {selectedAlert.items && (
                                    <div className="space-y-3">
                                      <span className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em]">Items to Serve</span>
                                      <div className="space-y-2">
                                        {selectedAlert.items.map((item: string, idx: number) => (
                                          <div key={idx} className="flex items-center gap-3 text-white">
                                            <div className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                                            <span className="text-[10px] uppercase font-medium">{item}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {selectedAlert.reason && (
                                    <div className="space-y-3">
                                      <span className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em]">Specific Note</span>
                                      <p className="text-white/60 text-[10px] italic">"{selectedAlert.reason}"</p>
                                    </div>
                                  )}
                                </div>
                                <div className="p-4 border-t border-white/10">
                                  <button 
                                    onClick={() => {
                                      setIsProcessingAction(true);
                                      setTimeout(() => {
                                        setSelectedAlert(null);
                                        setAcknowledgedAlerts(prev => [...prev, currentStep]);
                                        setIsProcessingAction(false);
                                      }, 800);
                                    }}
                                    disabled={isProcessingAction}
                                    className="w-full h-12 rounded-xl bg-brand-orange text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2"
                                  >
                                    {isProcessingAction ? (
                                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      "Mark as Handled"
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Tablet Frame (Kitchen) */}
                {step.role === "kitchen" && (
                  <div className="relative w-[500px] h-[350px] bg-[#1a1a1a] rounded-[2rem] border-[10px] border-[#333] shadow-2xl p-2 transition-all">
                    <div className="w-full h-full bg-black rounded-[1.5rem] overflow-hidden relative border border-white/5">
                      <div className="h-full flex flex-col bg-[#0F0F0F]">
                        {/* Notification Header */}
                        {kitchenNotification && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[80%] bg-green-500 text-white px-4 py-2 rounded-xl shadow-2xl z-40 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{kitchenNotification}</span>
                          </div>
                        )}
                        <div className="h-12 px-6 flex justify-between items-center border-b border-white/5 bg-black/40">
                          <span className="text-[10px] font-bold text-brand-orange uppercase tracking-[0.2em]">KDS ACTIVE</span>
                          <div className="flex items-center gap-4">
                            <Clock className="h-4 w-4 text-white/20" />
                            <span className="text-[10px] font-bold text-white/40">12:45 PM</span>
                          </div>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-3 p-4">
                          {[
                            { table: "04", time: "8m", items: ["1x Truffle Pasta", "1x Burger"] },
                            { table: "12", time: "3m", items: ["2x Salad", "1x Steak"] },
                            { table: "09", time: "12m", items: ["1x Pizza"] }
                          ].map((ticket, i) => (
                            <div 
                              key={i} 
                              onClick={() => !kitchenStatus.includes(ticket.table) && markKitchenReady(ticket.table)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col relative overflow-hidden ${
                                kitchenStatus.includes(ticket.table) ? "bg-green-500/5 border-green-500/20 opacity-40" : "bg-white/5 border-white/10 hover:border-brand-orange/40"
                              }`}
                            >
                              <div className="flex justify-between mb-3">
                                <span className="text-white text-[10px] font-bold uppercase">Table {ticket.table}</span>
                                <span className="text-white/20 text-[8px]">{ticket.time}</span>
                              </div>
                              <div className="flex-1 space-y-1.5">
                                {ticket.items.map((item, idx) => (
                                  <div key={idx} className="text-[9px] text-white/60 font-medium uppercase truncate">• {item}</div>
                                ))}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!kitchenStatus.includes(ticket.table)) markKitchenReady(ticket.table);
                                }}
                                disabled={isProcessingAction && !kitchenStatus.includes(ticket.table)}
                                className={`mt-4 w-full h-8 rounded-lg text-[8px] font-bold uppercase transition-all flex items-center justify-center ${
                                  kitchenStatus.includes(ticket.table) ? "bg-green-500 text-white" : "bg-brand-orange/10 border border-brand-orange/20 text-brand-orange"
                                }`}>
                                {isProcessingAction && !kitchenStatus.includes(ticket.table) ? (
                                  <div className="h-3 w-3 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  kitchenStatus.includes(ticket.table) ? "SENT TO STAFF" : "MARK READY"
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Monitor Frame (Admin Dashboard) */}
                {step.role === "admin" && (
                  <div className="relative w-[650px] h-[450px] bg-[#1a1a1a] rounded-xl border-[12px] border-[#333] shadow-2xl p-0.5 transition-all">
                    {/* Monitor Stand */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-10 bg-[#222] rounded-t-lg -z-10" />
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 h-2 bg-[#333] rounded-full -z-10" />
                    
                    {/* Screen Content */}
                    <div className="w-full h-full bg-[#0F0F0F] rounded-sm overflow-hidden flex relative border border-white/5">
                      {/* Dashboard Sidebar */}
                      <div className="w-48 bg-black border-r border-white/5 flex flex-col p-4 space-y-8">
                        <div className="flex items-center gap-3 px-2">
                          <div className="h-6 w-6 rounded-lg bg-brand-orange flex items-center justify-center">
                            <Zap className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Admin Panel</span>
                        </div>
                        <nav className="flex-1 space-y-2">
                          {[
                            { icon: <LayoutDashboard className="h-3.5 w-3.5" />, label: "Dashboard", active: true },
                            { icon: <Users className="h-3.5 w-3.5" />, label: "Staff" },
                            { icon: <Utensils className="h-3.5 w-3.5" />, label: "Menu" },
                            { icon: <Search className="h-3.5 w-3.5" />, label: "Inventory" },
                            { icon: <Settings className="h-3.5 w-3.5" />, label: "Settings" }
                          ].map((nav, i) => (
                            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${nav.active ? "bg-brand-orange/10 text-brand-orange" : "text-white/40 hover:bg-white/5 hover:text-white"}`}>
                              {nav.icon}
                              <span className="text-[9px] font-bold uppercase tracking-widest">{nav.label}</span>
                            </div>
                          ))}
                        </nav>
                      </div>

                      {/* Dashboard Main Content */}
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-black/40">
                          <h6 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Real-Time Performance Overview</h6>
                          <div className="flex items-center gap-4">
                            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10" />
                          </div>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                          {/* KPI Row */}
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { label: "Today's Revenue", val: "$4,284.50", trend: "+14.2%" },
                              { label: "Active Orders", val: "12", trend: "-2" },
                              { label: "Guest Satisfaction", val: "98.4%", trend: "+1.2%" }
                            ].map((kpi, i) => (
                              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-brand-orange/40 transition-all">
                                <div className="text-[8px] text-white/30 font-bold uppercase tracking-widest mb-1">{kpi.label}</div>
                                <div className="text-xl text-white font-bold">{kpi.val}</div>
                                <div className={`text-[9px] font-bold mt-1 ${kpi.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{kpi.trend}</div>
                              </div>
                            ))}
                          </div>

                          {/* Chart Area */}
                          <div className="bg-white/5 rounded-2xl border border-white/5 p-6 space-y-6">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Revenue by Hour</span>
                              <div className="flex gap-2">
                                <div className="px-2 py-1 rounded bg-brand-orange text-white text-[8px] font-bold">LIVE</div>
                              </div>
                            </div>
                            <div className="h-40 flex items-end gap-2 relative group/chart">
                              {[30, 45, 35, 60, 85, 40, 70, 95, 50, 65, 80, 55, 75, 90, 40, 60].map((h, i) => (
                                <div key={i} className="flex-1 bg-brand-orange/30 rounded-t-sm hover:bg-brand-orange transition-all cursor-pointer relative group/bar" style={{ height: `${h}%` }}>
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">${h*12}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Decorative glow */}
                <div className="absolute -inset-4 bg-brand-orange/10 blur-[150px] -z-10" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black py-12 border-t border-white/5 text-white/40">
        <div className="container px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} HeadlessResto Inc. Walkthrough Mode.
          </p>
          <div className="flex items-center gap-4">
             <Button asChild className="h-10 px-6 rounded-full bg-brand-orange text-white hover:bg-amber-500 text-[10px] font-medium uppercase tracking-widest transition-all">
                <Link href="/signup">Start Free Trial</Link>
             </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
