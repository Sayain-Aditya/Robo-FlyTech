'use client';
import { useEffect, useState } from 'react';
import { getAdminStats, getAdminOrders } from '@/lib/api';
import { motion } from 'framer-motion';
import { StatCardSkeleton } from '@/components/Skeleton';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getAdminStats().then(r => setStats(r.data));
    getAdminOrders().then(r => setOrders(r.data.slice(0, 5)));
  }, []);

  const cards = stats ? [
    { label: 'Total Revenue',   value: `₹${stats.revenue.toLocaleString()}`,  border: 'border-l-red-500',    text: 'text-red-600',    bg: 'bg-red-50',    icon: DollarSign },
    { label: 'Total Orders',    value: stats.totalOrders,                      border: 'border-l-blue-500',   text: 'text-blue-700',   bg: 'bg-blue-50',   icon: ShoppingBag },
    { label: 'Total Products',  value: stats.totalProducts,                    border: 'border-l-purple-500', text: 'text-purple-700', bg: 'bg-purple-50', icon: Package },
    { label: 'Total Customers', value: stats.totalUsers,                       border: 'border-l-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50',  icon: Users },
  ] : [];

  const statusColor = (s) => {
    if (s === 'Delivered') return 'badge-green';
    if (s === 'Cancelled') return 'badge-red';
    if (s === 'Shipped') return 'badge-blue';
    return 'badge-amber';
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title mb-1">Dashboard</h1>
        <p className="text-xs text-gray-400 tracking-wide mb-8">Welcome back, Admin</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats ? cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white border border-gray-200 border-l-4 ${c.border} p-5 hover:shadow-md transition-shadow`}>
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-widest">{c.label}</p>
                <div className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center`}>
                  <Icon size={14} className={c.text} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            </motion.div>
          );
        }) : Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h2 className="section-title mb-6 text-lg">Recent Orders</h2>
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="classic-table">
            <thead>
              <tr>{['Order ID', 'Customer', 'Total', 'Date', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td className="font-mono text-xs text-gray-400">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="font-medium text-gray-800">{o.user?.name}</td>
                  <td className="text-red-600 font-semibold">₹{o.totalPrice?.toLocaleString()}</td>
                  <td className="text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td><span className={statusColor(o.status)}>{o.status}</span></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8 text-sm">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
