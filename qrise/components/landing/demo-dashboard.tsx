"use client";

import { QrCode, Globe, MapPin, Smartphone, LayoutDashboard, Settings, User, Bell, Search, Plus, List, BarChart2, MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import "./demo-dashboard.css";

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
    <section id="demo" className="demo-section">
      <div className="demo-container">
        <div className="demo-header">
          <h2 className="demo-title">
            The power you need, <span>all in one place</span>
          </h2>
          <p className="demo-description">
            Experience a professional dashboard designed for growth. Monitor scans, manage dynamic content, and gain deep insights instantly.
          </p>
        </div>

        {/* Browser chrome mockup */}
        <div className="browser-mockup">
          {/* Address bar */}
          <div className="browser-header">
            <div className="browser-dots">
              <div className="dot dot-red" />
              <div className="dot dot-yellow" />
              <div className="dot dot-green" />
            </div>
            <div className="browser-address-bar">
              <Globe className="h-3.5 w-3.5" />
              dashboard.qrise.app/analytics
            </div>
          </div>

          <div className="dashboard-content">
            {/* Sidebar Mockup */}
            <div className="dashboard-sidebar">
              <div className="sidebar-logo">
                <div className="logo-box">Q</div>
                <span className="logo-text">QRise Pro</span>
              </div>

              <div className="sidebar-nav">
                {[
                  { icon: LayoutDashboard, label: "Overview", active: true },
                  { icon: QrCode, label: "My QR Codes" },
                  { icon: BarChart2, label: "Analytics" },
                  { icon: List, label: "Submissions" },
                  { icon: Settings, label: "Settings" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`nav-item ${item.active ? "active" : ""}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="sidebar-footer">
                <p className="footer-label">Current Plan</p>
                <p className="footer-value">Enterprise Plan</p>
                <button className="footer-btn">
                  Upgrade Now
                </button>
              </div>
            </div>

            {/* Dashboard main area */}
            <div className="dashboard-main">
              {/* Internal Header */}
              <div className="main-header">
                <div className="search-wrapper">
                  <Search className="search-icon h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search QR codes..."
                    className="search-input"
                    disabled
                  />
                </div>
                <div className="header-actions">
                  <div className="notification-bell">
                    <Bell className="h-5 w-5" />
                    <div className="notification-dot" />
                  </div>
                  <div className="user-avatar" />
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="dashboard-body">
                {/* Header Section */}
                <div className="content-heading">
                  <div>
                    <h3 className="body-title">Analytics Overview</h3>
                    <p className="body-subtitle">Real-time performance across all campaigns</p>
                  </div>
                  <button className="create-btn">
                    <Plus className="h-4 w-4" />
                    Create QR
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                  {[
                    { label: "Total Scans", value: "124.8k", trend: "+12.5%" },
                    { label: "Unique Users", value: "82.4k", trend: "+8.2%" },
                    { label: "Completion Rate", value: "94.2%", trend: "+2.1%" },
                    { label: "Active QRs", value: "248", trend: "+14" },
                  ].map((stat) => (
                    <div key={stat.label} className="stat-card">
                      <p className="stat-card-label">{stat.label}</p>
                      <div className="stat-card-value-row">
                        <p className="stat-card-value">{stat.value}</p>
                        <span className="stat-card-trend">{stat.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Chart Area */}
                <div className="chart-card">
                  <div className="card-header">
                    <h4 className="card-title">Traffic Distribution</h4>
                    <select className="card-select" disabled>
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
                          tick={{ fontSize: 10, fill: '#94A3B8' }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#94A3B8' }}
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
                <div className="table-card">
                  <div className="card-header">
                    <h4 className="card-title">Recent QR Activity</h4>
                    <button className="text-sm text-[#0F6E56] font-bold">View All</button>
                  </div>
                  <div className="activity-list">
                    {[
                      { name: "Summer Campaign", type: "Dynamic URL", scans: "12,402", status: "Active" },
                      { name: "Launch Event", type: "vCard", scans: "4,291", status: "Active" },
                      { name: "Feedback Loop", type: "Form Studio", scans: "892", status: "Paused" },
                    ].map((qr, i) => (
                      <div key={i} className="activity-item">
                        <div className="item-left">
                          <div className="item-icon-box">
                            <QrCode className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="item-name">{qr.name}</p>
                            <p className="item-type">{qr.type}</p>
                          </div>
                        </div>
                        <div className="item-right">
                          <div className="item-stats">
                            <p className="item-name">{qr.scans}</p>
                            <p className="item-type">Scans</p>
                          </div>
                          <div className={`item-status ${qr.status === 'Active' ? 'status-active' : 'status-paused'}`}>
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
        <div className="demo-cta">
          <Link
            href="/register"
            className="cta-button"
          >
            Start Free 14 days Trial
            <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}