"use client";

import React, { useState, useEffect, useRef } from "react";
import AdminLogin from "./AdminLogin";
import ProductWorkspace from "./ProductWorkspace";
import OrdersWorkspace from "./OrdersWorkspace";
import BannerWorkspace from "./BannerWorkspace";
import CategoryWorkspace from "./CategoryWorkspace";
import CouponWorkspace from "./CouponWorkspace";
import FeedbackScreen from "./FeedbackScreen";
import { adminService } from "../utils/service";
import { io } from "socket.io-client";

// ── ADD "feedback" to the type ──────────────────────────────────────────────
type SidebarTab = "products" | "banners" | "categories" | "orders" | "coupons" | "feedback";

interface UserProfile {
  name: string;
  email?: string;
  phone: string;
  role: string;
}

// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconGrid = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
const IconPackage = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline strokeLinecap="round" strokeLinejoin="round" points="3.27 6.96 12 12.01 20.73 6.96" />
    <line strokeLinecap="round" x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconImage = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <polyline strokeLinecap="round" strokeLinejoin="round" points="21 15 16 10 5 21" />
  </svg>
);
const IconTag = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line strokeLinecap="round" x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const IconTicket = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 000 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 000-4V7a2 2 0 00-2-2H5z" />
  </svg>
);
const IconLogout = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
  </svg>
);
const IconChevronDown = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <polyline strokeLinecap="round" strokeLinejoin="round" points="6 9 12 15 18 9" />
  </svg>
);
const IconShoppingBag = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
const IconTrendUp = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <polyline strokeLinecap="round" strokeLinejoin="round" points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline strokeLinecap="round" strokeLinejoin="round" points="17 6 23 6 23 12" />
  </svg>
);
const IconEye = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconClock = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline strokeLinecap="round" points="12 6 12 12 16 14" />
  </svg>
);
// ── NEW: Feedback icon ────────────────────────────────────────────────────────
const IconMessageSquare = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

// ── NAV_TABS — now includes feedback ────────────────────────────────────────
const NAV_TABS = [
  { id: "products",   label: "Products",    Icon: IconGrid },
  { id: "orders",     label: "Orders",      Icon: IconPackage },
  { id: "banners",    label: "Banners",     Icon: IconImage },
  { id: "categories", label: "Categories",  Icon: IconTag },
  { id: "coupons",    label: "Coupons",     Icon: IconTicket },
  { id: "feedback",   label: "Feedback",    Icon: IconMessageSquare }, // ← added
] as const;

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>("products");
  const [liveViewers, setLiveViewers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState("₹0");
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedProfile = localStorage.getItem("adminProfile");
    if (savedToken && savedProfile) {
      try {
        setAdminUser(JSON.parse(savedProfile));
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Hydration profile corruption:", e);
        handleSignOut();
      }
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchLiveMetricsStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      if (response?.data?.success) {
        const { stats } = response.data;
        setTotalProducts(stats.totalProducts || 0);
        setPendingOrdersCount(stats.pendingOrders || 0);
        setTotalSales(`₹${(stats.todaysSales || 0).toLocaleString("en-IN")}`);
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchLiveMetricsStats();
    const socket = io("http://localhost:5000", { transports: ["polling", "websocket"], autoConnect: true });
    socket.on("liveViewersUpdate", (data: { count: number }) => {
      if (typeof data?.count === "number") setLiveViewers(data.count);
    });
    return () => { socket.off("liveViewersUpdate"); socket.disconnect(); };
  }, [isAuthenticated]);

  const handleLoginSuccess = (userData?: any) => {
    const adminMetadata: UserProfile = {
      name: userData?.name || "Sanwariya Admin",
      email: userData?.email || "admin@sanwariya.com",
      phone: userData?.phone || "9999999999",
      role: userData?.role || "admin",
    };
    localStorage.setItem("adminProfile", JSON.stringify(adminMetadata));
    setAdminUser(adminMetadata);
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminProfile");
    setAdminUser(null);
    setIsAuthenticated(false);
    setProfileOpen(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center font-sans text-xs uppercase font-bold tracking-widest text-stone-400 animate-pulse">
        Synchronizing Session...
      </div>
    );
  }

  if (!isAuthenticated) return <AdminLogin onLoginSuccess={handleLoginSuccess} />;

  // ── Workspace renderer — feedback now wired ──────────────────────────────
  const renderWorkspace = () => {
    switch (activeTab) {
      case "products":   return <ProductWorkspace onRefreshStats={fetchLiveMetricsStats} />;
      case "orders":     return <OrdersWorkspace />;
      case "banners":    return <BannerWorkspace />;
      case "categories": return <CategoryWorkspace />;
      case "coupons":    return <CouponWorkspace />;
      case "feedback":   return <FeedbackScreen />;   // ← wired
    }
  };

  const statCards = [
    { label: "Total Products", value: totalProducts, sub: "Items in catalog",      Icon: IconGrid,    accent: "text-[#8b4513]",   bg: "bg-amber-50",  iconColor: "text-[#8b4513]" },
    { label: "Live Visitors",  value: liveViewers,   sub: "Online right now",       Icon: IconEye,     accent: "text-emerald-600", bg: "bg-emerald-50",iconColor: "text-emerald-500", pulse: true },
    { label: "Total Revenue",  value: totalSales,    sub: "Settled sales",          Icon: IconTrendUp, accent: "text-amber-600",   bg: "bg-yellow-50", iconColor: "text-amber-500" },
    { label: "Pending Orders", value: pendingOrdersCount, sub: "Awaiting fulfillment", Icon: IconClock, accent: "text-violet-600", bg: "bg-violet-50", iconColor: "text-violet-500" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f5f0] font-sans text-stone-800">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-56 bg-[#18110c] flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#8b4513] flex items-center justify-center shrink-0">
              <IconShoppingBag size={16} />
            </div>
            <div>
              <p className="text-amber-50 text-[13px] font-bold leading-none tracking-wide">MalaWale</p>
              <p className="text-stone-500 text-[10px] mt-0.5 font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-bold uppercase tracking-widest text-stone-600 px-3 mb-2">Workspace</p>
          {NAV_TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as SidebarTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  active
                    ? "bg-[#8b4513] text-white shadow-lg shadow-[#8b4513]/25"
                    : "text-stone-500 hover:text-stone-200 hover:bg-white/5"
                }`}
              >
                <Icon size={15} />
                <span>{label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-[#8b4513]/30 flex items-center justify-center shrink-0 text-white font-bold text-xs">
              {adminUser?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-stone-300 text-[12px] font-semibold truncate">{adminUser?.name || "Administrator"}</p>
              <p className="text-stone-600 text-[10px] uppercase font-bold tracking-wider">{adminUser?.role || "Super Admin"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-stone-100 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[15px] font-bold text-stone-800 capitalize">
              {NAV_TABS.find((t) => t.id === activeTab)?.label ?? "Dashboard"}
            </h1>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[11px] font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Live Engine Grid
            </div>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8b4513] to-[#c4702a] flex items-center justify-center text-white text-xs font-bold uppercase">
                  {adminUser?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[12px] font-semibold text-stone-700 leading-none">{adminUser?.name || "Admin"}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5 uppercase tracking-wide font-medium">{adminUser?.role || "Super Admin"}</p>
                </div>
                <span className={`text-stone-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}>
                  <IconChevronDown />
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-stone-100 shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-stone-50 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8b4513] to-[#c4702a] flex items-center justify-center text-white font-bold text-sm shrink-0 uppercase">
                      {adminUser?.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-stone-800 truncate">{adminUser?.name || "Administrator"}</p>
                      <p className="text-[11px] text-stone-400 truncate">{adminUser?.email || adminUser?.phone || "admin@sanwariya.com"}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-b border-stone-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-500">Security Ring</span>
                      <span className="bg-[#8b4513]/10 text-[#8b4513] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {adminUser?.role || "Admin"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-stone-500">System Link</span>
                      <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Authorized
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-[13px] font-medium transition"
                    >
                      <IconLogout size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 py-4 bg-white border-b border-stone-100 shrink-0">
          {statCards.map((card, i) => (
            <div key={i} className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center shrink-0 ${card.iconColor}`}>
                <card.Icon size={16} />
              </div>
              <div>
                <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide leading-none mb-1">{card.label}</p>
                <p className={`text-lg font-black leading-none ${card.accent} ${"pulse" in card && card.pulse ? "animate-pulse" : ""}`}>{card.value}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#f7f5f0]">
          {renderWorkspace()}
        </div>
      </div>
    </div>
  );
}