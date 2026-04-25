"use client";

import { QrCode, Globe, MapPin, Smartphone, LayoutDashboard, Settings, User, Bell, Search, Plus, List, BarChart2, MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const chartData = [
  { date: "Apr 18", scans: 420, unique: 310 },
  { date: "Apr 19", scans: 580, unique: 420 },
  { date: "Apr 20", scans: 450, unique: 380 },
  { date: "Apr 21", scans: 720, unique: 550 },
  { date: "Apr 22", scans: 880, unique: 680 },
  { date: "Apr 23", scans: 660, unique: 490 },
  { date: "Apr 24", scans: 940, unique: 710 },
];

export function DemoDashboard() {
  return (
    <section id="demo" className="py-24 bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
            The power you need, <span className="text-[#0F6E56]">all in one place</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Experience a professional dashboard designed for growth. Monitor scans, manage dynamic content, and gain deep insights instantly.
          </p>
        </div>

        {/* Browser chrome mockup */}
        <div className="mx-auto max-w-6xl rounded-2xl bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-gray-200 overflow-hidden flex flex-col h-[700px]">
          {/* Address bar */}
          <div className="bg-[#F1F5F9] px-4 py-3 flex items-center gap-4 border-b border-gray-200">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm" />
            </div>
            <div className="flex-1 max-w-md bg-white rounded-lg px-4 py-1.5 text-sm text-gray-400 border border-gray-200 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" />
              dashboard.qrise.app/analytics
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Mockup */}
            <div className="w-64 border-r border-gray-100 bg-[#F8FAFC] hidden md:flex flex-col p-4 gap-2">
              <div className="flex items-center gap-2 px-3 py-4 mb-4">
                <div className="w-8 h-8 bg-[#0F6E56] rounded-lg flex items-center justify-center text-white font-bold">Q</div>
                <span className="font-bold text-gray-900">QRise Pro</span>
              </div>

              <div className="space-y-1">
                {[
                  { icon: LayoutDashboard, label: "Overview", active: true },
                  { icon: QrCode, label: "My QR Codes" },
                  { icon: BarChart2, label: "Analytics" },
                  { icon: List, label: "Submissions" },
                  { icon: Settings, label: "Settings" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.active ? "bg-[#0F6E56] text-white shadow-md shadow-[#0F6E56]/20" : "text-gray-500 hover:bg-gray-200/50"
                      }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="mt-auto p-4 bg-gradient-to-br from-[#0F6E56] to-emerald-600 rounded-xl text-white">
                <p className="text-xs font-medium opacity-80">Current Plan</p>
                <p className="text-sm font-bold mt-0.5">Enterprise Plan</p>
                <button className="mt-3 w-full py-2 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold hover:bg-white/30 transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>

            {/* Dashboard main area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Internal Header */}
              <div className="h-16 border-b border-gray-100 px-8 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search QR codes..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/20"
                      disabled
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Bell className="h-5 w-5 text-gray-400" />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="h-8 w-8 bg-gray-100 rounded-full border border-gray-200" />
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Header Section */}
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Analytics Overview</h3>
                    <p className="text-sm text-gray-500 mt-1">Real-time performance across all campaigns</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#0F6E56] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#0F6E56]/20">
                    <Plus className="h-4 w-4" />
                    Create QR
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Scans", value: "124.8k", trend: "+12.5%", color: "emerald" },
                    { label: "Unique Users", value: "82.4k", trend: "+8.2%", color: "blue" },
                    { label: "Completion Rate", value: "94.2%", trend: "+2.1%", color: "amber" },
                    { label: "Active QRs", value: "248", trend: "+14", color: "purple" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <span className="text-xs font-bold text-emerald-500">{stat.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Chart Area */}
                <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="font-bold text-gray-900">Traffic Distribution</h4>
                    <select className="text-sm bg-gray-50 border-none rounded-lg px-3 py-1 text-gray-600 outline-none" disabled>
                      <option>Last 7 days</option>
                    </select>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height={256} minHeight={256} debounce={100}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F6E56" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#0F6E56" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#94A3B8' }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#94A3B8' }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="scans"
                          stroke="#0F6E56"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorScans)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activity Table Mockup */}
                <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-gray-900">Recent QR Activity</h4>
                    <button className="text-sm text-[#0F6E56] font-bold">View All</button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: "Summer Marketing Campaign", type: "Dynamic URL", scans: "12,402", status: "Active" },
                      { name: "Product Launch Event", type: "vCard", scans: "4,291", status: "Active" },
                      { name: "Customer Feedback Loop", type: "Form Studio", scans: "892", status: "Paused" },
                    ].map((qr, i) => (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#0F6E56]/5 rounded-lg flex items-center justify-center">
                            <QrCode className="h-5 w-5 text-[#0F6E56]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{qr.name}</p>
                            <p className="text-xs text-gray-500">{qr.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{qr.scans}</p>
                            <p className="text-xs text-gray-500">Scans</p>
                          </div>
                          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${qr.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {qr.status}
                          </div>
                          <MoreVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white bg-[#0F6E56] rounded-2xl hover:bg-[#0d5c48] transition-all hover:scale-105 shadow-xl shadow-[#0F6E56]/20 group"
          >
            Start Free 14 days Trial
            <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}