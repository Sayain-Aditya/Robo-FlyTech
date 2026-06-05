'use client';
import { useEffect, useState } from 'react';
import { getAdminOrders, updateOrderStatus } from '@/lib/api';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusColor = (s) => {
  if (s === 'Delivered') return 'badge-green';
  if (s === 'Cancelled') return 'badge-red';
  return 'badge-blue';
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  const load = () => getAdminOrders().then(r => setOrders(r.data));
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    load();
  };

  return (
    <div>
      <h1 className="section-title mb-8">Orders</h1>
      <div className="bg-white border border-gray-200 overflow-auto">
        <table className="classic-table">
          <thead>
            <tr>
              {['Order ID', 'Customer', 'Total', 'Date', 'Status', 'Update'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td className="font-mono text-xs text-gray-400">#{o._id.slice(-8).toUpperCase()}</td>
                <td className="font-medium text-gray-800">{o.user?.name}</td>
                <td className="text-green-700 font-semibold">₹{o.totalPrice?.toLocaleString()}</td>
                <td className="text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td><span className={statusColor(o.status)}>{o.status}</span></td>
                <td>
                  <select
                    className="border border-gray-300 text-xs px-2 py-1 bg-white text-gray-700 focus:border-green-500 outline-none"
                    value={o.status}
                    onChange={e => handleStatus(o._id, e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No orders yet</p>
        )}
      </div>
    </div>
  );
}
